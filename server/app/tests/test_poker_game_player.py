import pytest

from app.PokerGame.player import Player, PlayerList


# Player tests
def test_player_create():
    player = Player("Tony Stark", 1000, False)
    assert player.chips == 1000
    assert player.display_name == "Tony Stark"
    assert player.chips_played == 0
    assert player.last_move is None
    assert player.dealer is False


# PlayerList tests
@pytest.fixture
def player_list() -> PlayerList:
    p1 = Player("Tony Stark", 1000)
    p2 = Player("Peter Parker", 1000)
    p3 = Player("Steve Rogers", 1000)
    list_ = PlayerList([p1, p2, p3])
    return list_


def test_player_list_create_empty():
    l = PlayerList()


def test_player_list_create_non_empty():
    p = Player("Tony Stark", 1000)
    list1 = PlayerList([p])
    list2 = PlayerList(tuple([p]))


def test_player_list_length(player_list: PlayerList):
    assert len(player_list) == 3


def test_player_list_iterable(player_list: PlayerList):
    for player in player_list:
        assert isinstance(player, Player)
    i = iter(player_list)


def test_player_list_slice(player_list: PlayerList):
    assert player_list[0].display_name == "Tony Stark"
    assert player_list[2].display_name == "Steve Rogers"
    assert player_list[-1].display_name == "Steve Rogers"
    with pytest.raises(IndexError):
        player_list[3]
    assert len(player_list[1:3]) == 2


def test_player_list_add(player_list: PlayerList):
    other_player_list = PlayerList([Player("Bruce Banner", 1000)])
    combined_list = player_list + other_player_list
    assert len(combined_list) == 4


def test_player_list_contains(player_list: PlayerList):
    assert "Tony Stark" in player_list
    assert "Steve Rogers" in player_list
    assert "Bruce Banner" not in player_list


def test_player_list_index(player_list: PlayerList):
    assert player_list.index("Tony Stark") == 0
    assert player_list.index("Peter Parker") == 1
    assert player_list.index("Steve Rogers") == 2
    with pytest.raises(ValueError):
        player_list.index("Bruce Banner")


def test_player_list_remove(player_list: PlayerList):
    assert len(player_list) == 3
    player_list.remove("Tony Stark")
    assert len(player_list) == 2
    player_list.remove("Player who doesn't exist")
    assert len(player_list) == 2


def test_player_list_add_single_player(player_list: PlayerList):
    player_list.add(Player("Bruce Banner", 1000))
    assert len(player_list) == 4
    assert player_list[3].display_name == "Bruce Banner"


def test_player_list_find_dealer_first(player_list: PlayerList):
    player_list[0].dealer = True
    assert player_list.dealer == player_list[0]


def test_player_list_find_dealer_middle(player_list: PlayerList):
    player_list[1].dealer = True
    assert player_list.dealer == player_list[1]


def test_player_list_find_dealer_last(player_list: PlayerList):
    player_list[2].dealer = True
    assert player_list.dealer == player_list[2]


def test_player_list_find_dealer_none(player_list: PlayerList):
    assert player_list.dealer is None


def test_player_list_find_dealer_idx(player_list: PlayerList):
    player_list[2].dealer = True
    assert player_list.dealer_idx == 2


def test_player_list_find_dealer_idx_none(player_list: PlayerList):
    assert player_list.dealer_idx is None