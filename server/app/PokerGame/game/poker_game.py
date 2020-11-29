from abc import ABC
from datetime import datetime, timedelta
import json
from enum import Enum
from .game_enums import MoveType, RoundType
from app.PokerGame.player import Player, PlayerList


class PokerGame(ABC):
    def __init__(self, starting_chips: int):
        self._players = PlayerList()
        self._starting_chips = starting_chips
        self._started_at: datetime = None
        self._players_turn: int = -1  # index to players of whose turn it is
        self._round: RoundType = None
        self._min_raise: int = -1
        self._last_bet: int = -1

    def start_game(self):
        """Anything that should happen ONCE the entire game"""
        self._started_at = datetime.now()
        self.players.move_dealer(
            -1
        )  # move dealer back so when starting a hand we move round

    def start_hand(self):
        """Anything that should happen before the pre-flop each hand"""
        self.players.move_dealer(1)
        self.start_round(1)

    def start_round(self, round: int):
        """Anything that should happen before the next stage within a hand"""
        self._round = RoundType(round)
        self._last_bet = 0
        for player in self._players:
            if player.move != MoveType.FOLD or round == 1:
                player.move = None
                player.last_bet = 0

        # select first left of dealer who hasn't folded to start round
        valid_next_player = False
        inc = 0
        while not valid_next_player:
            inc += 1
            self._players_turn = (self._players.dealer_idx + inc) % len(
                self._players
            )  # set left of dealer to go first
            valid_next_player = (
                True
                if self.players[self.current_players_turn].move != MoveType.FOLD
                else False
            )

    @property
    def min_raise(self) -> int:
        return self._min_raise

    @property
    def current_players_turn(self) -> int:
        return self._players_turn

    @property
    def starting_chips(self) -> int:
        return self._starting_chips

    @property
    def players(self) -> PlayerList:
        return self._players

    @players.setter
    def players(self, new_player_list: PlayerList):
        self._players = new_player_list

    @property
    def pot(self) -> int:
        return sum(player.chips_played for player in self.players)

    def add_player(self, player_name: str, is_dealer: bool) -> None:
        if is_dealer is True and self._players.dealer is not None:
            raise ValueError("There is already a dealer in the game")
        self._players.add(Player(player_name, self._starting_chips, dealer=is_dealer))

    def remove_player(self, player_name: str) -> None:
        self._players.remove(player_name)

    def current_player_make_move(self, move: str, **kwargs) -> None:
        name_of_current_player = self.players[self._players_turn].display_name
        self.player_make_move(name_of_current_player, move, **kwargs)

    def player_make_move(self, player_name: str, move: str, **kwargs) -> None:
        idx = self.players.index(player_name)
        player = self.players[idx]
        player.move = MoveType[move.upper()]
        if player.move == MoveType.BET:
            bet_amount = kwargs.get("bet", 0)
            if self._last_bet == 0 or kwargs.get("blinds"):
                player.make_a_bet(bet_amount)  # bet
            else:
                player.make_a_bet(bet_amount - player.last_bet)  # raise

            if bet_amount > 0:
                # need to update min_raise
                self._min_raise = bet_amount + (bet_amount - self._last_bet)
                self._last_bet = bet_amount

        # TODO: need additional logic for folding and stuff
        # TODO: win round if 1 player left etc.
        elif player.move == MoveType.CALL:
            player.make_a_bet(self._last_bet - player.last_bet)

        elif player.move == MoveType.FOLD:
            if self.end_of_hand:
                print("end of hand")
                self.start_hand()
                return

        if self.end_of_round:
            self._round = RoundType(self._round.value + 1)
            self.start_round(self._round)
        else:
            self._next_players_turn()  # move turn around

    def _next_players_turn(self):
        """update pointer to current player by skipping over players who have folded"""
        # TODO: do a thing like if didn't change then one player left so you won
        def move_one_player_round():
            self._players_turn = (self._players_turn + 1) % len(self._players)

        while True:
            move_one_player_round()
            if not self.players[self.current_players_turn].move == MoveType.FOLD:
                break

    @property
    def end_of_round(self) -> bool:
        """Determines if it is the end of the current round of betting.

        E.g. it should move from pre-flop to flop, flop to river etc.

        Returns:
            bool: whether the round has ended
        """
        max_chips = max(self.players, key=lambda x: x.chips_played).chips_played
        for player in self.players:
            if (
                player.move is None
            ):  # if a player hasn't played a move can't be end of round
                return False
            elif player.move != MoveType.FOLD:
                if player.chips_played != max_chips and not player.is_all_in:
                    return False
        return True

    @property
    def end_of_hand(self) -> bool:
        """Determines if the hand is over because all bar one player has folded

        Returns:
            bool: whether the hand has ended
        """
        return len([p for p in self.players if p.move != MoveType.FOLD]) == 1

    @property
    def round(self) -> RoundType:
        return self._round

    def to_json(self):
        def default(x):
            if isinstance(x, datetime):
                return x.isoformat()
            elif isinstance(x, Enum):
                return x.name
            else:
                return x.__dict__

        full_dict = {**self.__dict__, **{"_pot": self.pot}}
        return json.dumps(
            full_dict,
            default=default,
        )


class NoBlindsPokerGame(PokerGame):
    def __init__(self, starting_chips):
        super().__init__(starting_chips)


class BlindsPokerGame(PokerGame):
    def __init__(self, starting_chips, starting_blinds, blind_interval):
        super().__init__(starting_chips)
        self._small_blind = starting_blinds
        self._blind_interval = blind_interval
        self._blinds_up_at = None

    @property
    def small_blind(self):
        return self._small_blind

    @property
    def big_blind(self):
        return self._small_blind * 2

    @property
    def blind_interval(self):
        return self._blind_interval

    def set_blinds_up_at(self):
        self._blinds_up_at = (
            None
            if self.blind_interval == 0
            else self._started_at + timedelta(minutes=self._blind_interval)
            if self._started_at is None
            else datetime.now() + timedelta(minutes=self._blind_interval)
        )

    def start_game(self):
        super().start_game()
        self.set_blinds_up_at()

    def start_round(self, round: int):
        super().start_round(round)
        # if pre-flop is starting small blind and big blind put down their bet
        if self._round == RoundType.PRE_FLOP:
            self.player_make_move(
                self.players[self.current_players_turn].display_name,
                "bet",
                bet=self.small_blind,
                blinds=True,
            )
            self.player_make_move(
                self.players[self.current_players_turn].display_name,
                "bet",
                bet=self.big_blind,
                blinds=True,
            )
            self._min_raise = (
                self.big_blind * 2
            )  # special case for min raise after blinds
            self.players[
                (self.current_players_turn - 1) % len(self.players)
            ].move = None  # give bb chance to check or bet when it comes back round
        else:
            self._min_raise = self.big_blind
