from abc import ABC
from datetime import datetime, timedelta
import json
from .game_enums import MoveType
from app.PokerGame.player import Player, PlayerList


class PokerGame(ABC):
    def __init__(self, starting_chips: int):
        self._players = PlayerList()
        self._starting_chips = starting_chips
        self._started_at: datetime = None

    def start_game(self):
        self._started_at = datetime.now()

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
        player.chips_played += kwargs.get("bet", 0)
        player.chips -= kwargs.get("bet", 0)
        # TODO: need additional logic for folding and stuff

    def to_json(self):
        full_dict = {**self.__dict__, **{"_pot": self.pot}}
        return json.dumps(
            full_dict,
            default=lambda x: x.isoformat() if isinstance(x, datetime) else x.__dict__,
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
