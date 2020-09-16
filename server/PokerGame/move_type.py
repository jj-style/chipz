from enum import Enum, auto

class MoveType(Enum):
    FOLD = auto()
    CHECK = auto()
    CALL = auto()
    BET = auto()