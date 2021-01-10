import pytest
from copy import deepcopy

from app.PokerGame.game import (
    NoBlindsPokerGame,
    BlindsPokerGame,
    PokerGame,
    MoveType,
    RoundType,
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


def test_gameplay():
    game = BlindsPokerGame(1000, 10, 10)
    game.add_player("Tony Stark", is_dealer=False)  # first to go
    game.add_player("Peter Parker", is_dealer=True)  # dealer
    game.add_player("Bruce Banner", is_dealer=False)  # sb
    game.add_player("Steve Rogers", is_dealer=False)  # bb
    game.start_game()
    game.start_hand()
    assert game.round == RoundType.PRE_FLOP

    # TS calls 20 (bb)
    assert game.current_players_turn == 0
    game.current_player_make_move("call")
    assert game.players[0].last_bet == 20
    assert game.players[0].move == MoveType.CALL

    # Still pre-flop as round of betting isn't over
    assert game.round == RoundType.PRE_FLOP
    assert game.end_of_round is False

    # PP calls 20 (bb)
    assert game.current_players_turn == 1
    game.current_player_make_move("call")
    assert game.players[1].last_bet == 20
    assert game.players[1].move == MoveType.CALL

    # Still pre-flop as round of betting isn't over
    assert game.round == RoundType.PRE_FLOP
    assert game.end_of_round is False

    # BB calls 10 (as is small blind)
    assert game.current_players_turn == 2
    game.current_player_make_move("call")
    assert game.players[2].last_bet == 20
    assert game.players[2].move == MoveType.CALL

    # Still pre-flop as bb needs to check of bet
    assert game.round == RoundType.PRE_FLOP
    assert game.end_of_round is False

    # SR (bb) turn to check and move onto next round or continue betting
    assert game.current_players_turn == 3
    game.current_player_make_move("check")
    # can't check player's last moves as will be reset as we should expect new round
    assert game.round == RoundType.FLOP


def test_hand_ends_when_all_bar_one_player_folds():
    game = BlindsPokerGame(1000, 10, 10)
    game.add_player("Tony Stark", is_dealer=False)  # bb
    game.add_player("Peter Parker", is_dealer=True)  # dealer first to go
    game.add_player("Bruce Banner", is_dealer=False)  # sb
    game.start_game()
    game.start_hand()

    assert game.current_players_turn == 1
    game.current_player_make_move("call")
    assert game.current_players_turn == 2
    game.current_player_make_move("fold")
    assert game.end_of_hand is False
    assert game.round == RoundType.PRE_FLOP
    assert game.current_players_turn == 0
    game.current_player_make_move("check")
    assert game.round == RoundType.FLOP
    assert game.current_players_turn == 0
    game.current_player_make_move("fold")
    assert game.round == RoundType.PRE_HAND


def test_player_wins_money_when_others_all_fold():
    game = BlindsPokerGame(1000, 10, 10)
    game.add_player("Tony Stark", is_dealer=False)  # sb first to go
    game.add_player("Peter Parker", is_dealer=True)  # dealer bb
    game.start_game()
    game.start_hand()

    game.current_player_make_move("call")
    assert game.round == RoundType.PRE_FLOP
    game.current_player_make_move("check")
    assert game.round == RoundType.FLOP
    game.current_player_make_move("bet", bet=100)
    game.current_player_make_move("call")
    assert game.round == RoundType.TURN
    game.current_player_make_move("bet", bet=250)
    game.current_player_make_move("fold")

    assert game.round == RoundType.PRE_HAND

    matching_pot = 240
    assert game.players[0].chips == 1000 + (matching_pot / 2)
    assert game.players[1].chips == 1000 - (matching_pot / 2)


def test_players_split_money_when_win_pot():
    game = BlindsPokerGame(100, 10, 10)
    game.add_player("Tony Stark", is_dealer=False)  # bb
    game.add_player("Peter Parker", is_dealer=True)  # dealer first to go
    game.add_player("Bruce Banner", is_dealer=False)  # sb
    game.start_game()
    game.start_hand()

    # pre-flop
    game.current_player_make_move("call")
    game.current_player_make_move("call")
    game.current_player_make_move("check")

    # flop
    game.current_player_make_move("check")
    game.current_player_make_move("check")
    game.current_player_make_move("check")

    # turn
    game.current_player_make_move("check")
    game.current_player_make_move("check")
    game.current_player_make_move("check")

    # river
    game.current_player_make_move("bet", bet=50)
    game.current_player_make_move("call")
    game.current_player_make_move("fold")

    # on_backs
    assert game.round == RoundType.ON_BACKS
    assert game.is_sidepot is False

    game.win_pot(["Tony Stark", "Bruce Banner"])
    assert game.players[0].chips == 110
    assert game.players[2].chips == 110
    assert game.players[1].chips == 80


def test_gameplay_2():
    game = BlindsPokerGame(100, 10, 10)
    game.add_player("Tony Stark", is_dealer=False)  # sb first
    game.add_player("Peter Parker", is_dealer=True)  # dealer bb
    game.start_game()
    game.start_hand()
    assert game.round == RoundType.PRE_FLOP

    # TS calls to 20 (bb)
    assert game.current_players_turn == 0
    game.current_player_make_move("call")
    assert game.players[0].last_bet == 20
    assert game.players[0].move == MoveType.CALL

    game.current_player_make_move("check")
    assert game.round == RoundType.FLOP

    game.current_player_make_move("bet", bet=30)
    assert game.players[0].last_bet == 30
    assert game.players[0].move == MoveType.BET

    game.current_player_make_move("call")
    assert game.round == RoundType.TURN
    assert game.players[0].chips_played == game.players[1].chips_played

    game.current_player_make_move("bet", bet=40)
    game.current_player_make_move("fold")

    assert game.players[0].chips == 150
    assert game.players[1].chips == 50

    game.start_hand()

    game.current_player_make_move("call")
    game.current_player_make_move("check")

    game.current_player_make_move("check")
    game.current_player_make_move("bet", bet=20)
    game.current_player_make_move("call")

    assert game.round == RoundType.TURN


def test_gameplay_3():
    game = BlindsPokerGame(100, 10, 10)
    game.add_player("Tony Stark", is_dealer=False)  # sb first
    game.add_player("Peter Parker", is_dealer=True)  # dealer bb
    game.start_game()
    game.start_hand()
    assert game.round == RoundType.PRE_FLOP

    # TS calls to 20 (bb)
    assert game.current_players_turn == 0
    game.current_player_make_move("call")
    assert game.players[0].last_bet == 20
    assert game.players[0].move == MoveType.CALL

    game.current_player_make_move("bet", bet=40)
    assert game.players[1].last_bet == 60
    assert game.players[1].move == MoveType.BET

    game.current_player_make_move("call")

    assert game.round == RoundType.FLOP
    assert game.pot == 120


def test_is_no_sidepot():
    game = BlindsPokerGame(100, 10, 10)
    game.add_player("Tony Stark", is_dealer=False)  # sb first
    game.add_player("Peter Parker", is_dealer=True)  # dealer bb
    game.start_game()
    game.start_hand()

    assert game.round == RoundType.PRE_FLOP
    game.current_player_make_move("call")
    game.current_player_make_move("check")

    assert game.round == RoundType.FLOP
    game.current_player_make_move("check")
    game.current_player_make_move("check")

    assert game.round == RoundType.TURN
    game.current_player_make_move("bet", bet=40)
    game.current_player_make_move("call")

    assert game.round == RoundType.RIVER
    game.current_player_make_move("check")
    game.current_player_make_move("check")

    assert game.round == RoundType.ON_BACKS
    assert game.is_sidepot is False


def test_is_sidepot():
    game = NoBlindsPokerGame(100)
    game.add_player("Tony Stark", is_dealer=False)
    game.add_player("Peter Parker", is_dealer=True)  # dealer
    game.add_player("Bruce Banner", is_dealer=False)  # first
    game.start_game()
    game.start_hand()

    game._round = RoundType.RIVER
    game.players[0]._chips = 200
    game.players[1]._chips = 25
    game.players[2]._chips = 75

    assert game.round == RoundType.RIVER
    game.current_player_make_move("bet", bet=75)
    game.current_player_make_move("call")
    game.current_player_make_move("call")

    assert game.round == RoundType.ON_BACKS
    assert game.is_sidepot is True


def test_sidepot_1():
    game = NoBlindsPokerGame(100)
    game.add_player("Tony Stark", is_dealer=True)  # dealer first
    game.add_player("Peter Parker", is_dealer=False)  # first to go
    game.add_player("Bruce Banner", is_dealer=False)

    game.players[0].chips = 75
    game.players[1].chips = 200
    game.players[2].chips = 25

    game.start_game()
    game.start_hand()
    game._round = RoundType.RIVER

    game.current_player_make_move("bet", bet=200)
    game.current_player_make_move("call")
    game.current_player_make_move("call")

    assert game.round == RoundType.ON_BACKS
    assert game.is_sidepot is True
    assert game.num_sidepots == 3

    game_copy_1 = deepcopy(game)
    game_copy_1.win_sidepot(["Tony Stark", "Peter Parker", "Bruce Banner"])
    assert game_copy_1.players[0].chips == 175
    assert game_copy_1.players[1].chips == 125
    assert game_copy_1.players[2].chips == 0

    game_copy_2 = deepcopy(game)
    game_copy_2.win_sidepot(["Tony Stark", "Bruce Banner", "Peter Parker"])
    assert game_copy_2.players[0].chips == 175
    assert game_copy_2.players[1].chips == 125
    assert game_copy_2.players[2].chips == 0

    game_copy_3 = deepcopy(game)
    game_copy_3.win_sidepot(["Bruce Banner", "Peter Parker", "Tony Stark"])
    assert game_copy_3.players[0].chips == 0
    assert game_copy_3.players[1].chips == 225
    assert game_copy_3.players[2].chips == 75

    game_copy_4 = deepcopy(game)
    game_copy_4.win_sidepot(["Bruce Banner", "Tony Stark", "Peter Parker"])
    assert game_copy_4.players[0].chips == 100
    assert game_copy_4.players[1].chips == 125
    assert game_copy_4.players[2].chips == 75