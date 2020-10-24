from flask import Flask
from flask import request, jsonify, abort, make_response
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, send, emit, join_room, leave_room
import random, json
from typing import Dict

from PokerGame.poker_game import NoBlindsPokerGame, BlindsPokerGame, PokerGame
from PokerGame.player import Player, PlayerList

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", logger=True, async_mode="gevent")

GAMES : Dict[str, PokerGame] = {}

# def generate_game_code():
#     valid = False
#     while not valid:
#         code = ""
#         for i in range(6):
#             code += (chr(random.randint(65,90)))
#         valid = code not in GAMES
#     return code

def generate_game_code():
    valid = False
    with open("data/words.txt","r") as f:
        lines = f.readlines()
        while not valid:
            two_words = random.sample(lines, 2)
            code = "".join(map(str.strip,two_words))
            valid = code not in GAMES
    return code

def add_player_to_game(player_name, game_code, dealer=False):
    try:
        game = GAMES[game_code]
        if player_name in game.players:
            raise ValueError(f"{player_name} already in the game")
        game.add_player(player_name, dealer)
    except KeyError:
        raise ValueError(f"Game {game_code} could not be found")

@app.route("/")
@cross_origin()
def hello_world():
    return "Hello, World!"

@app.route("/game", methods=["GET", "POST"])
@app.route("/game/<string:room>", methods=["GET", "POST", "DELETE"])
@cross_origin()
def game(room=None):
    if not room:
        if request.method == "GET":
            return jsonify([g.toJson() for r,g in GAMES.items()])
        else:
            code = generate_game_code()
            game_data = request.get_json()
            print(game_data)
            GAMES[code] = BlindsPokerGame(game_data["startingChips"],
                                            game_data["startingBlinds"], 
                                            game_data["blindInterval"]) \
                            if game_data["useBlinds"] \
                            else NoBlindsPokerGame(game_data["startingChips"])
            add_player_to_game(game_data["displayName"], code, dealer=True)
            return jsonify({"room":code})
    else:
        print("made request to room: " + room)
        if request.method == "GET":
            if GAMES.get(room):
                return GAMES[room].toJson()
            else:
                return jsonify(message="Saved game not found"), 404
        elif request.method == "POST":
            game_data = request.get_json()
            print(game_data)
            try:
                add_player_to_game(game_data["displayName"], game_data["gameCode"])
                return jsonify(success=True)
            except ValueError as e:
                return jsonify(str(e)), 400
        elif request.method == "DELETE":
            game_data = request.get_json()
            try:
                player_to_be_removed = GAMES[room].players[GAMES[room].players.index(game_data["displayName"])]
                GAMES[room].remove_player(game_data["displayName"])
                if player_to_be_removed.dealer == True and len(GAMES[room].players) >= 1:
                    GAMES[room].players[0].dealer = True
                return jsonify(success=True)
            except ValueError as e:
                return jsonify(str(e)), 400

@socketio.on("join")
def on_join(data):
    name = data["name"]
    room = data["gameCode"]
    join_room(room)
    print(f"{name} has joined the game {room}")
    # send(name + " has entered the game.", room=room)
    # send(name + " has entered the game", room=room)

@socketio.on("leave")
def on_leave(data):
    name = data["name"]
    room = data["gameCode"]
    leave_room(room)
    print(f"{name} has left the game {room}")
    # GAMES[room].remove_player(name)
    # send(name + " has left the game.", room=room)

@socketio.on("GETPLAYERLISTINFO")
def get_player_list_info(game_code):
    emit("GETPLAYERINFO", json.dumps(GAMES[game_code].players, default=lambda x: x.__dict__), room=game_code)

@socketio.on("SETPLAYERLISTINFO")
def set_player_list_info(game_code, new_player_list_info):
    g = GAMES[game_code]
    new_players = PlayerList()
    for p in new_player_list_info:
        new_p = Player(p['_name'],p['_chips'],p['_dealer'])
        new_players.add(new_p)
    g.players = new_players
    emit("GETPLAYERINFO", json.dumps(GAMES[game_code].players, default=lambda x: x.__dict__), room=game_code)

@socketio.on("ENDGAME")
def end_game(room):
    print("Received request to end game for " + room)
    # GAMES.pop(room)
    emit("GAMEENDED", room=room)

@socketio.on("STARTGAME")
def start_game(room):
    print("Starting game for " + room)
    GAMES[room].start_game()
    emit("STARTGAME", room=room)

if __name__ == "__main__":
    # app.run(host='0.0.0.0', debug=True)
    socketio.run(app, debug=True, host='0.0.0.0', log_output=True)