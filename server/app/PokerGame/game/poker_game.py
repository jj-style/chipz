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
        self._players_turn: int = None  # index to players of whose turn it is
        self._round: RoundType = None

    def start_game(self):
        """Anything that should happen ONCE the entire game"""
        self._started_at = datetime.now()

    def start_hand(self):
        """Anything that should happen before the pre-flop each hand"""
        self.start_round(1)

    def start_round(self, round: int):
        """Anything that should happen before the next stage within a hand"""
        self._players_turn = (self._players.dealer_idx + 1) % len(
            self._players
        )  # set left of dealer to go first
        self._round = RoundType(round)
        for player in self._players:
            player.last_move = None

    @property
    def current_players_turn(self):
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

    def player_make_move(self, player_name: str, move: str, **kwargs) -> None:
        idx = self.players.index(player_name)
        player = self.players[idx]
        player.move = MoveType[move.upper()]
        bet_amount = kwargs.get("bet", 0)
        player.chips_played += bet_amount
        player.chips -= bet_amount
        self._next_players_turn()  # move turn around
        # TODO: need additional logic for folding and stuff
        # TODO: win round if 1 player left etc.

    def _next_players_turn(self):
        """update pointer to current player by skipping over players who have folded"""
        # TODO: do a thing like if didn't change then one player left so you won
        def move_one_player_round():
            self._players_turn = (self._players_turn + 1) % len(self._players)

        while True:
            move_one_player_round()
            if not self.players[self.current_players_turn].last_move == MoveType.FOLD:
                break

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

    def start_game(self):
        super().start_game()
        self._blinds_up_at = (
            None
            if self._blind_interval == 0
            else self._started_at + timedelta(minutes=self._blind_interval)
        )

    def start_round(self, round: int):
        super().start_round(round)
        if self._round == RoundType.PRE_FLOP:
            self.player_make_move(
                self.players[self.current_players_turn].display_name,
                "bet",
                bet=self.small_blind,
            )
            self.player_make_move(
                self.players[self.current_players_turn].display_name,
                "bet",
                bet=self.big_blind,
            )
