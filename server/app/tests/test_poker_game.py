import pytest

from app.PokerGame.game import (
    NoBlindsPokerGame,
    BlindsPokerGame,
    PokerGame,
    MoveType,
)


@pytest.fixture
def game() -> BlindsPokerGame:
    game = BlindsPokerGame(1000, 10, 10)
    game.add_player("Tony Stark", is_dealer=False)
    return game


@pytest.fixture
def no_blind_game() -> NoBlindsPokerGame:
    game = NoBlindsPokerGame(1000)
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


def test_player_make_valid_move(no_blind_game: NoBlindsPokerGame):
    no_blind_game.players[0].dealer = True
    no_blind_game.start_game()
    no_blind_game.start_hand()
    no_blind_game.player_make_move("Tony Stark", "check")
    no_blind_game.player_make_move("Tony Stark", "call")
    no_blind_game.player_make_move("Tony Stark", "bet", bet=10)
    no_blind_game.add_player("Peter Parker", False)
    no_blind_game.player_make_move("Tony Stark", "fold")

    assert no_blind_game.players[0].last_move == MoveType.FOLD
    assert no_blind_game.current_players_turn == 1


def test_player_make_invalid_move(no_blind_game: NoBlindsPokerGame):
    no_blind_game.players[0].dealer = True
    no_blind_game.start_game()
    no_blind_game.start_hand()
    with pytest.raises(KeyError):
        no_blind_game.player_make_move("Tony Stark", "invalid_move")


def test_invalid_player_make_move(no_blind_game: NoBlindsPokerGame):
    no_blind_game.players[0].dealer = True
    no_blind_game.start_game()
    no_blind_game.start_hand()
    with pytest.raises(ValueError):
        no_blind_game.player_make_move("Peter Parker", "fold")


def test_pot_increases_with_bet(no_blind_game: NoBlindsPokerGame):
    no_blind_game.players[0].dealer = True
    no_blind_game.start_game()
    no_blind_game.start_hand()
    assert no_blind_game.pot == 0
    no_blind_game.player_make_move("Tony Stark", "bet", bet=100)
    assert no_blind_game.pot == 100
    assert no_blind_game.players[0].chips == 900


def test_start_round_no_blinds(no_blind_game: NoBlindsPokerGame):
    no_blind_game.add_player("Peter Parker", is_dealer=True)  # dealer
    no_blind_game.add_player("Bruce Banner", is_dealer=False)  # small blind
    no_blind_game.add_player("Steve Rogers", is_dealer=False)  # big blind

    no_blind_game.start_game()
    no_blind_game.start_hand()
    assert no_blind_game.current_players_turn == 2  # left of dealer first as no blinds
    assert no_blind_game.pot == 0


def test_start_round_blinds():
    game = BlindsPokerGame(1000, 10, 10)
    game.add_player("Tony Stark", is_dealer=False)
    game.add_player("Peter Parker", is_dealer=True)
    game.add_player("Bruce Banner", is_dealer=False)
    game.add_player("Steve Rogers", is_dealer=False)

    game.start_game()
    game.start_hand()
    assert game.current_players_turn == 0  # after small and big blind
    assert game.pot == game.small_blind + game.big_blind
    assert game.players[2].chips_played == game.small_blind
    assert game.players[3].chips_played == game.big_blind


def test_no_blinds_game_to_json(no_blind_game: NoBlindsPokerGame):
    no_blind_game.players[0].dealer = True
    no_blind_game.start_game()
    no_blind_game.start_hand()
    no_blind_game.to_json()


def test_blinds_game_to_json(game: BlindsPokerGame):
    game.players[0].dealer = True
    game.start_game()
    game.start_hand()
    game.to_json()