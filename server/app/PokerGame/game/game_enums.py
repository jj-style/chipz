from enum import Enum, auto


class MoveType(Enum):
    FOLD = auto()
    CHECK = auto()
    CALL = auto()
    BET = auto()


class RoundType(Enum):
    PRE_FLOP = 1
    FLOP = 2
    TURN = 3
    RIVER = 4
