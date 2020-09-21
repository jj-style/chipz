from flask import Flask
from flask import request, jsonify, abort, make_response
from flask_cors import CORS, cross_origin
from flask_socketio import SocketIO, send, emit, join_room, leave_room
import random, json

from PokerGame.poker_game import NoBlindsPokerGame, BlindsPokerGame
from PokerGame.player import Player

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

GAMES = {}

def generate_game_code():
    valid = False
    while not valid:
        code = ""
        for i in range(6):
            code += (chr(random.randint(65,90)))
        valid = code not in GAMES
    return code

def add_player_to_game(player_name, game_code):
    try:
        game = GAMES[game_code]
        if player_name in game.players:
            raise ValueError(f"{player_name} already in the game")
        game.add_player(player_name)
    except:
        raise ValueError(f"Game {game_code} could not be found")

@app.route("/")
@cross_origin()
def hello_world():
    return "Hello, World!"

@app.route("/game", methods=["GET", "POST"])
@app.route("/game/<string:room>", methods=["GET", "POST"])
@cross_origin()
def game(room=None):
    if not room:
        if request.method == "GET":
            return jsonify([g.to_dict() for r,g in GAMES.items()])
        else:
            code = generate_game_code()
            game_data = request.get_json()
            print(game_data)
            GAMES[code] = BlindsPokerGame(game_data["startingChips"],
                                            game_data["startingBlinds"], 
                                            game_data["blindInterval"]) \
                            if game_data["useBlinds"] \
                            else NoBlindsPokerGame(game_data["startingChips"])
            add_player_to_game(game_data["displayName"], code)
            return jsonify({"room":code})
    else:
        print("made request to room: " + room)
        if request.method == "GET":
            if GAMES.get(room):
                return json.dumps(GAMES[room], default=lambda x: x.__dict__)
            else:
                return jsonify(message="Saved game not found"), 404
        else:
            game_data = request.get_json()
            print(game_data)
            try:
                add_player_to_game(game_data["displayName"], game_data["gameCode"])
                return jsonify(success=True)
            except ValueError as e:
                return jsonify(str(e)), 400
        

@socketio.on("join")
def on_join(data):
    name = data["name"]
    room = data["game_code"]
    join_room(room)
    GAMES[room].add_player(Player(name, GAMES[room].starting_chips))
    send(name + " has entered the game.", room=room)

@socketio.on("leave")
def on_leave(data):
    name = data["name"]
    room = data["game_code"]
    leave_room(room)
    GAMES[room].remove_player(name)
    send(name + " has left the game.", room=room)

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)
    # socketio.run(app, debug=True)