import pytest

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
    assert game.players[2].last_bet == 10
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
