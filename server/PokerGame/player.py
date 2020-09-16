from itertools import chain

class Player:
    def __init__(self, name, chips):
        self._name = name
        self._chips = chips
        self._last_move = None
        self._chip_in_play = 0

    def __eq__(self, rhs):
        if not isinstance(rhs, Player):
            return NotImplemented
        return self.display_name == rhs.display_name
    
    def __ne__(self, rhs):
        if not isinstance(rhs, Player):
            return NotImplemented
        return self.display_name != rhs.display_name

    @property
    def display_name(self):
        return self._name

    @property
    def move(self):
        return self._last_move

    @move.setter
    def move(self, value):
        self._last_move = value

    def __str__(self):
        return self._name

    def __repr__(self):
        return f"Player(name={self._name}, chips={self._chips})"

    

class PlayerList:
    def __init__(self, players=None):
        self._players = list(players) if players is not None else []

    def __len__(self):
        return len(self._players)

    def __iter__(self):
        return iter(self._players)

    def __repr__(self):
        return "PlayerList({})".format(repr(self._players) if self._players else '')

    def __getitem__(self, index):
        result = self._players[index]
        return PlayerList(result) if isinstance(index, slice) else result

    def __add__(self, rhs):
        return PlayerList(chain(self._players, rhs._players))

    def __contains__(self, item):
        for p in self:
            if p._name == item:
                return True
        return False

    def index(self, item):
        for i in range(len(self)):
            if self[i]._name == item:
                return i
        raise ValueError(f"{item} is not in PlayerList")