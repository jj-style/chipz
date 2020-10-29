from enum import Enum, auto


class MoveType(Enum):
    FOLD = auto()
    CHECK = auto()
    CALL = auto()
    BET = auto()


class RoundType(Enum):
    PRE_FLOP = auto()
    FLOP = auto()
    TURN = auto()
    RIVER = auto()
