from abc import ABC
from datetime import datetime
from datetime import timedelta
import json
import operator
from enum import Enum
from .game_enums import MoveType, RoundType
from app.PokerGame.player import Player, PlayerList
from app.PokerGame.logger.game_logger import GameLogger


class PokerGame(ABC):
    def __init__(self, starting_chips: int):
        self._players = PlayerList()
        self._starting_chips = starting_chips
        self._started_at: datetime = None
        self._players_turn: int = -1  # index to players of whose turn it is
        self._round: RoundType = None
        self._min_raise: int = -1
        self._last_bet: int = -1
        self._logger: GameLogger = GameLogger()
        self._total_players: int = (
            -1
        )  # total number of players still in poker game at any given point

    def start_game(self):
        """Anything that should happen ONCE the entire game"""
        self._started_at = datetime.now()
        self._round = RoundType(0)  # set round to pre_hand
        self._total_players = len(self.players)

    def start_hand(self):
        """Anything that should happen before the pre-flop each hand"""
        self.start_round(1)

    def eliminate_players_who_went_out(self):
        """remove players that went out during the round and
        log their names and the positions they went out in
        """
        players_to_remove = []
        for player in self._players:
            if player.chips == 0 and player.move != MoveType.OUT:
                players_to_remove.append(player)
                player.move = MoveType.OUT

        if len(players_to_remove) > 0:
            players = ",".join([p.display_name for p in players_to_remove])
            positions = ",".join(
                map(
                    str,
                    range(
                        self._total_players,
                        self._total_players - len(players_to_remove),
                        -1,
                    ),
                )
            )
            self._logger.msg(f"{players} checked out {positions}", True)
            self._total_players -= len(players_to_remove)

    def start_round(self, round: int):
        """Anything that should happen before the next stage within a hand"""
        self._round = RoundType(round)
        self._last_bet = 0
        for player in self._players:
            if (
                player.move != MoveType.FOLD or round == 1
            ) and player.move != MoveType.OUT:
                player.move = None
                player.last_bet = 0

        # select first left of dealer who hasn't folded to start round
        self._players_turn = self._next_players_turn(self._players.dealer_idx)

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

    @property
    def game_over(self) -> bool:
        return len(self.players_in) == 1

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
                if not kwargs.get("blinds"):
                    self._logger.msg(f"{player.display_name} bets £{bet_amount}", True)
                player.make_a_bet(bet_amount)  # bet
            else:
                self._logger.msg(
                    f"""{player.display_name} raises £{bet_amount - player.last_bet} to \
£{bet_amount}""",
                    True,
                )
                player.make_a_bet(bet_amount - player.last_bet)  # raise

            if bet_amount > 0:
                # need to update min_raise
                self._min_raise = bet_amount + (bet_amount - self._last_bet)
                self._last_bet = bet_amount

        # TODO: need additional logic for folding and stuff
        # TODO: win round if 1 player left etc.
        elif player.move == MoveType.CALL:
            amount_to_call = self._last_bet - player.last_bet
            if amount_to_call > player.chips:
                amount_to_call = player.chips
            self._logger.msg(f"{player.display_name} calls £{amount_to_call}", True)
            player.make_a_bet(amount_to_call)

        elif player.move == MoveType.FOLD:
            self._logger.msg(f"{player.display_name} folds", True)
            if self.end_of_hand:
                # player who hasn't folded wins the pot
                self.win_pot(
                    [
                        [
                            p
                            for p in self.players
                            if p.move not in [MoveType.FOLD, MoveType.OUT]
                        ][0].display_name
                    ]
                )
                return

        elif player.move == MoveType.CHECK:
            self._logger.msg(f"{player.display_name} checks", True)

        if self.end_of_round:
            self._round = RoundType(self._round.value + 1)
            self.start_round(self._round)
        else:
            next_player_idx = self._next_players_turn(
                self._players_turn
            )  # move turn around
            self._players_turn = next_player_idx

    def _next_players_turn(self, from_) -> int:
        """return index to players of next player whose turn it is
        by skipping over players who have folded or are out
        """
        # TODO: do a thing like if didn't change then one player left so you won
        def move_one_player_round(current):
            return (current + 1) % len(self._players)

        npi = from_
        while True:
            npi = move_one_player_round(npi)
            np = self.players[npi]
            if np.move not in [MoveType.FOLD, MoveType.OUT]:
                return npi

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
            elif player.move not in [MoveType.FOLD, MoveType.OUT]:
                if player.chips_played != max_chips and not player.is_all_in:
                    return False
        return True

    @property
    def end_of_hand(self) -> bool:
        """Determines if the hand is over because all bar one player has folded

        Returns:
            bool: whether the hand has ended
        """
        return (
            len(
                [p for p in self.players if p.move not in [MoveType.FOLD, MoveType.OUT]]
            )
            == 1
        )

    @property
    def round(self) -> RoundType:
        return self._round

    def win_pot(self, player_names: list) -> None:
        a_winner = self.players[self.players.index(player_names[0])]
        for player in self.players:
            # for all other players - make their bets no bigger than the winner's
            if player.display_name not in player_names:
                if player.chips_played > a_winner.chips_played:
                    diff = player.chips_played - a_winner.chips_played
                    player.chips_played -= diff
                    player.chips += diff

        share_of_pot = int(self.pot / len(player_names))
        for winner_name in player_names:
            self._logger.msg(f"{winner_name} wins £{share_of_pot}", True)
            winner = self.players[self.players.index(winner_name)]
            winner.chips += share_of_pot

        self.post_hand()
        self.next_hand()

    def next_hand(self):
        """move to next hand"""
        for player in self.players:
            player.chips_played = 0
        self._round = RoundType(0)
        new_dealer_idx = self._next_players_turn(self._players.dealer_idx)
        self.players[self.players.dealer_idx].dealer = False
        self.players[new_dealer_idx].dealer = True

    def win_sidepot(self, player_order: list) -> None:
        """Split pot appropriately between players
        Arguments:
            player_order: list - player names in order they should take part of the pot
        """
        # NOTE: edge case as players could have same hand within a sidepot split
        # but not implemented so player's must be given distinct order
        players_cls = [
            self.players[self.players.index(p)] for p in player_order
        ]  # list of player classes in order they are given

        for plyr_idx in range(len(players_cls)):
            plyr = players_cls[plyr_idx]
            my_sidepot = plyr.chips_played  # put their chips into their sidepot
            for othr_plyr_idx in range(plyr_idx + 1, len(players_cls)):
                # for each other player win money from them
                othr_plyr = players_cls[othr_plyr_idx]
                # player can win max of what they have bet against other players
                win_from_player = (
                    othr_plyr.chips_played
                    if othr_plyr.chips_played <= plyr.chips_played
                    else plyr.chips_played
                )
                my_sidepot += win_from_player
                othr_plyr.chips_played -= win_from_player
            if my_sidepot > 0:
                self._logger.msg(f"{plyr.display_name} wins £{my_sidepot}", True)
            plyr.chips_played = 0
            plyr.chips += my_sidepot
        self.post_hand()
        self.next_hand()

    @property
    def players_in(self):
        return [p for p in self.players if p.move not in [MoveType.FOLD, MoveType.OUT]]

    @property
    def num_sidepots(self) -> int:
        """Returns the max number of sidepots to be won
        (how many different chips in front)

        Not really the number of sidepots but not sure what to call it.
        """

        return len(set([p.chips_played for p in self.players_in]))

    @property
    def is_sidepot(self) -> bool:
        """Given in ON_BACKS state, is there a sidepot or will pot be split equally
        There is a sidepot if for all the players who are still in, their chips they've
        played are not equal
        Returns:
            bool: whether there is a sidepot or not
        """
        return self.num_sidepots > 1 and len(self.players_in) > 2

    def post_hand(self):
        """anything that should happen after winners of hand are chosen"""
        self.eliminate_players_who_went_out()

    def to_json(self):
        def default(x):
            if isinstance(x, datetime):
                return x.isoformat()
            elif isinstance(x, Enum):
                return x.name
            elif isinstance(x, GameLogger):
                return x.user_logs()
            else:
                return x.__dict__

        full_dict = {
            **self.__dict__,
            **{
                "_pot": self.pot,
                "_is_sidepot": self.is_sidepot,
                "_num_sidepots": self.num_sidepots,
                "_players_on_backs": self.players_in,
                "_game_over": self.game_over,
            },
        }
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

    def start_hand(self):
        """update blinds and set new blinds up at time if time is greater
        than blinds up at time
        """
        if self._blinds_up_at is None or (
            self._blinds_up_at is not None and datetime.now() > self._blinds_up_at
        ):
            self.set_blinds_up_at()
        super().start_hand()

    def start_round(self, round: int):
        super().start_round(round)
        # if pre-flop is starting small blind and big blind put down their bet
        if self._round == RoundType.PRE_FLOP:
            self.current_player_make_move(
                "bet",
                bet=self.small_blind,
                blinds=True,
            )
            self.current_player_make_move(
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
