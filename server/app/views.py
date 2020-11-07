import random
import json
import os
from typing import Dict

from app import socketio

from flask import current_app as app
from flask import request
from flask import jsonify
from flask_cors import cross_origin
from flask_socketio import emit
from flask_socketio import join_room
from flask_socketio import leave_room

from app.PokerGame import PokerGame, NoBlindsPokerGame, BlindsPokerGame
from app.PokerGame import Player, PlayerList

GAMES: Dict[str, PokerGame] = {}


def generate_game_code():
    valid = False
    path = os.path.join(os.path.dirname(__file__), "data/words.txt")
    with open(path, "r") as f:
        lines = f.readlines()
        while not valid:
            two_words = random.sample(lines, 2)
            code = "".join(map(str.strip, two_words))
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
            return jsonify([g.to_json() for r, g in GAMES.items()])
        else:
            code = generate_game_code()
            game_data = request.get_json()
            print(game_data)
            GAMES[code] = (
                BlindsPokerGame(
                    int(game_data["startingChips"]),
                    int(game_data["startingBlinds"]),
                    int(game_data["blindInterval"]),
                )
                if game_data["useBlinds"]
                else NoBlindsPokerGame(int(game_data["startingChips"]))
            )
            add_player_to_game(game_data["displayName"], code, dealer=True)
            return jsonify({"room": code})
    else:
        print("made request to room: " + room)
        if request.method == "GET":
            if GAMES.get(room):
                return GAMES[room].to_json()
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
                player_to_be_removed = GAMES[room].players[
                    GAMES[room].players.index(game_data["displayName"])
                ]
                GAMES[room].remove_player(game_data["displayName"])
                if (
                    player_to_be_removed.dealer is True
                    and len(GAMES[room].players) >= 1
                ):
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
    emit(
        "GETPLAYERINFO",
        json.dumps(GAMES[game_code].players, default=lambda x: x.__dict__),
        room=game_code,
    )


@socketio.on("SETPLAYERLISTINFO")
def set_player_list_info(game_code, new_player_list_info):
    g = GAMES[game_code]
    new_players = PlayerList()
    for p in new_player_list_info:
        new_p = Player(p["_name"], p["_chips"], p["_dealer"])
        new_players.add(new_p)
    g.players = new_players
    emit(
        "GETPLAYERINFO",
        json.dumps(GAMES[game_code].players, default=lambda x: x.__dict__),
        room=game_code,
    )


@socketio.on("ENDGAME")
def end_game(room):
    print("Received request to end game for " + room)
    # GAMES.pop(room)
    emit("GAMEENDED", room=room)


@socketio.on("STARTGAME")
def start_game(room):
    print("Starting game for " + room)
    GAMES[room].start_game()
    GAMES[room].start_hand()
    emit("STARTGAME", room=room)


@socketio.on("GET_IN_GAME_INFO")
def get_in_game_info(room):
    emit("GOT_GAME_INFO", GAMES[room].to_json())
