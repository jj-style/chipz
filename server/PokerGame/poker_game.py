from abc import ABC
from datetime import datetime, timedelta
from .player import PlayerList, Player

class PokerGame(ABC):
    def __init__(self, starting_chips):
        self._players = PlayerList()
        self._starting_chips = starting_chips
        self._started_at = None

    def start_game(self):
        self._started = datetime.now()

    @property
    def starting_chips(self):
        return self._starting_chips

    @property
    def players(self):
        return self._players

    @players.setter
    def players(self, new_player_list):
        self._players = new_player_list

    def add_player(self, player_name, is_dealer):
        self._players.add(Player(player_name, self._starting_chips, dealer=is_dealer))

    def remove_player(self, player_name):
        self._players.remove(player_name)

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
    def big_blind(self):
        return self._small_blind * 2

    def start_game(self):
        super().start_game()
        self._blinds_up_at = self._started_at + timedelta(minutes=self._blind_interval)