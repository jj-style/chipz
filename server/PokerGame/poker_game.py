from abc import ABC
from datetime import datetime, timedelta
from player import PlayerList

class PokerGame(ABC):
    def __init__(self, players, starting_chips):
        self._players = PlayerList(players)
        self._starting_chips = starting_chips
        self._started_at = None
        self._dealer = None

    def start_game(self):
        self._started = datetime.now()

    @property
    def dealer(self):
        return self._dealer

    @dealer.setter
    def dealer(self, name):
        self._dealer = self._players.index(name)

class NoBlindsPokerGame(PokerGame):
    def __init__(self, players, starting_chips):
        super().__init__(players, starting_chips)

class BlindsPokerGame(PokerGame):
    def __init__(self, players, starting_chips, starting_blinds, blind_interval):
        super().__init__(players, starting_chips)
        self._small_blind = starting_blinds
        self._blind_interval = blind_interval
        self._blinds_up_at = None

    @property
    def big_blind(self):
        return self._small_blind * 2

    def start_game(self):
        super().start_game()
        self._blinds_up_at = self._started_at + timedelta(minutes=self._blind_interval)