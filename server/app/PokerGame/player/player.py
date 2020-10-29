from typing import List
from itertools import chain

from app.PokerGame.game.game_enums import MoveType


class Player:
    def __init__(self, name, chips, dealer=False):
        self._name: str = name
        self._chips: int = chips
        self._last_move: MoveType = None
        self._chips_played: int = 0
        self._dealer: bool = dealer

    def __eq__(self, rhs):
        if not isinstance(rhs, Player):
            return NotImplemented
        return self.display_name == rhs.display_name

    def __ne__(self, rhs):
        if not isinstance(rhs, Player):
            return NotImplemented
        return self.display_name != rhs.display_name

    @property
    def display_name(self) -> str:
        return self._name

    @property
    def move(self) -> MoveType:
        return self._last_move

    @move.setter
    def move(self, value: MoveType) -> None:
        self._last_move = value

    @property
    def dealer(self) -> bool:
        return self._dealer

    @dealer.setter
    def dealer(self, new_status: bool) -> None:
        self._dealer = new_status

    @property
    def chips_played(self) -> int:
        return self._chips_played

    @chips_played.setter
    def chips_played(self, new_value: int) -> None:
        self._chips_played = new_value

    @property
    def chips(self) -> int:
        return self._chips

    @chips.setter
    def chips(self, new_chips: int) -> None:
        self._chips = new_chips

    @property
    def last_move(self) -> MoveType:
        return self._last_move

    def __str__(self):
        return self._name

    def __repr__(self):
        return f"Player(name={self._name}, chips={self._chips})"


class PlayerList:
    def __init__(self, players=None):
        self._players: List[Player] = (
            list(players) if players is not None else []
        )

    def __len__(self):
        return len(self._players)

    def __iter__(self):
        return iter(self._players)

    def __repr__(self):
        return "PlayerList({})".format(
            repr(self._players) if self._players else ""
        )

    def __getitem__(self, index) -> Player:
        result = self._players[index]
        return PlayerList(result) if isinstance(index, slice) else result

    def __add__(self, rhs):
        return PlayerList(chain(self._players, rhs._players))

    def __contains__(self, player_name: str):
        for p in self:
            if p._name == player_name:
                return True
        return False

    def index(self, player_name: str) -> int:
        for i in range(len(self)):
            if self[i]._name == player_name:
                return i
        raise ValueError(f"{player_name} is not in PlayerList")

    def remove(self, player_name: str) -> None:
        self._players = [
            p for p in self._players if p.display_name != player_name
        ]

    def add(self, player: Player) -> None:
        self._players.append(player)

    @property
    def players(self):
        return self._players

    @property
    def dealer(self) -> Player:
        for player in self._players:
            if player.dealer:
                return player
        return None
