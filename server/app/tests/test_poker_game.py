import pytest

from app.PokerGame.game import NoBlindsPokerGame, BlindsPokerGame, PokerGame, MoveType


@pytest.fixture
def game() -> PokerGame:
    game = BlindsPokerGame(1000, 10, 10)
    game.add_player("Tony Stark", is_dealer=False)
    return game


def test_create_no_blinds_game():
    game = NoBlindsPokerGame(1000)
    assert game.starting_chips == 1000


def test_create_blinds_game():
    game = BlindsPokerGame(1000, 10, 15)
    assert game.starting_chips == 1000
    assert game.small_blind == 10
    assert game.big_blind == 20


def test_add_player_to_game():
    game = BlindsPokerGame(1000, 10, 10)
    game.add_player("Tony Stark", is_dealer=False)
    game.add_player("Peter Parker", is_dealer=True)
    assert len(game.players) == 2


def test_add_multiple_dealers_fails():
    game = BlindsPokerGame(1000, 10, 10)
    game.add_player("Tony Stark", is_dealer=True)
    with pytest.raises(ValueError):
        game.add_player("Peter Parker", is_dealer=True)


def test_remove_player_from_game():
    game = BlindsPokerGame(1000, 10, 10)
    game.add_player("Tony Stark", is_dealer=False)
    assert len(game.players) == 1
    game.remove_player("Tony Stark")
    assert len(game.players) == 0


def test_player_make_valid_move(game: PokerGame):
    game.player_make_move("Tony Stark", "fold")
    game.player_make_move("Tony Stark", "check")
    game.player_make_move("Tony Stark", "call")
    game.player_make_move("Tony Stark", "bet", bet=10)
    assert game.players[0].last_move == MoveType.BET


def test_player_make_invalid_move(game):
    with pytest.raises(KeyError):
        game.player_make_move("Tony Stark", "invalid_move")


def test_invalid_player_make_move(game):
    with pytest.raises(ValueError):
        game.player_make_move("Peter Parker", "fold")


def test_pot_increases_with_bet(game):
    assert game.pot == 0
    game.player_make_move("Tony Stark", "bet", bet=100)
    assert game.pot == 100
    assert game.players[0].chips == 900
