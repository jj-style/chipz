import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Slider,
  FlatList,
  SafeAreaView,
} from "react-native";
import CheckBox from "@react-native-community/checkbox";

import update from "immutability-helper";

import * as gStyle from "./globalStyle";
import { StyledButton } from "./StyledButton";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { leaveGameAlert } from "./LeaveGame";

import { api } from "../api";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SplashScreen } from "./SplashScreen";

import { websocket } from "../socket";

const tmpState = {
  pot: 20,
  smallBlind: 10,
  lastBet: null, // so next min bet is twice this if not null otherwise small blind
  thisPlayer: "Alan",
  players: [
    { name: "Alan", chips: 100, infront: 10, key: "1" },
    { name: "Dennis", chips: 75, infront: 0, key: "2" },
    { name: "Charles", chips: 210, infront: 0, key: "3" },
    { name: "Ken", chips: 20, infront: 0, key: "4" },
    { name: "Donald", chips: 300, infront: 0, key: "5" },
  ],
};

const styles = StyleSheet.create({
  buttonGroup: {
    alignItems: "center",
    justifyContent: "space-around",
  },
  betButton: {
    backgroundColor: "white",
    borderColor: gStyle.primary,
    borderWidth: 2,
    borderRadius: 10,
    alignSelf: "stretch",
    margin: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
  },
  quickBetRow: {
    flexDirection: "row",
  },
  bigButton: {
    height: "20%",
  },
  bigText: {
    fontSize: 32,
    fontWeight: "bold",
  },
  infoBox: {
    alignItems: "center",
    backgroundColor: "white",
    alignSelf: "center",
    width: "100%",
    borderRadius: 10,
  },
  infoBoxText: {
    fontSize: 25,
  },
  // following styles for info page
  infoName: {
    width: "70%",
    fontSize: 30,
  },
  infoChips: {
    fontSize: 30,
  },
  infoPlayers: {
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  logItem: {
    fontSize: 16,
  },
});

const PlayScreen = ({ gameData, contextProvider, token, makeMove }) => {
  const thisPlayer = gameData._players._players.find(
    (obj) => obj._name === token.displayName
  );
  const chipStack = thisPlayer._chips;
  const minBet =
    (gameData._min_raise > chipStack ? chipStack : gameData._min_raise) || 10;

  var betButtonText = "Bet";
  if (gameData._last_bet > 0) {
    betButtonText = "Raise to";
  }
  if (minBet === chipStack) {
    betButtonText = "All in";
  }

  const [newBet, setNewBet] = useState(0);
  useEffect(() => {
    setNewBet(minBet);
  }, [minBet]);

  const players_turn_name =
    gameData._players._players[gameData._players_turn]._name;

  return (
    <View style={{ flex: 1, margin: 10, marginTop: 30 }}>
      <View style={styles.infoBox}>
        <Text style={styles.infoBoxText}>{gameData._round}</Text>
        <Text style={styles.infoBoxText}>Pot: £{gameData._pot}</Text>
        <Text style={{ fontSize: 16 }}>
          {token.displayName === players_turn_name
            ? "Your"
            : players_turn_name + "'s"}{" "}
          turn
        </Text>
      </View>
      <View style={styles.buttonGroup}>
        <StyledButton
          buttonText="Fold"
          onPress={() => makeMove("fold")}
          style={styles.bigButton}
          textStyle={styles.bigText}
        />
        {thisPlayer._last_bet === gameData._last_bet ? (
          <StyledButton
            buttonText="Check"
            onPress={() => makeMove("check")}
            style={styles.bigButton}
            textStyle={styles.bigText}
          />
        ) : (
          <StyledButton
            buttonText={`Call ${gameData._last_bet - thisPlayer._last_bet}`}
            onPress={() => makeMove("call")}
            style={styles.bigButton}
            textStyle={styles.bigText}
          />
        )}
        <TouchableHighlight
          onPress={() => makeMove("bet", newBet)}
          style={[styles.betButton]}
          underlayColor="#e6e6e6"
        >
          <View style={{ width: "100%", alignItems: "center" }}>
            <Text style={{ fontSize: 18 }}>
              {betButtonText}: £{newBet}
            </Text>
            <Slider
              minimumValue={minBet}
              maximumValue={chipStack}
              step={minBet}
              onValueChange={(n) => setNewBet(n)}
              value={newBet}
              style={{ width: "75%", marginTop: 10, marginBottom: 10 }}
            />
            <View style={styles.quickBetRow}>
              <StyledButton
                buttonText="Min"
                onPress={() => {
                  setNewBet(minBet);
                }}
                style={{ width: "17%" }}
                textStyle={{ fontWeight: "bold", fontSize: 12 }}
              />
              <StyledButton
                buttonText="1/2 Pot"
                onPress={() => {
                  setNewBet(
                    Math.ceil(gameData._pot / 2) <= chipStack
                      ? Math.ceil(gameData._pot / 2)
                      : chipStack
                  );
                }}
                style={{ width: "17%" }}
                textStyle={{ fontWeight: "bold", fontSize: 12 }}
              />
              <StyledButton
                buttonText="Pot"
                onPress={() => {
                  setNewBet(
                    gameData._pot <= chipStack ? gameData._pot : chipStack
                  );
                }}
                style={{ width: "17%" }}
                textStyle={{ fontWeight: "bold", fontSize: 12 }}
              />
              <StyledButton
                buttonText="Max"
                onPress={() => {
                  setNewBet(chipStack);
                }}
                style={{ width: "17%" }}
                textStyle={{ fontWeight: "bold", fontSize: 12 }}
              />
            </View>
          </View>
        </TouchableHighlight>
      </View>
    </View>
  );
};

const PlayerStats = ({ info, thisPlayer }) => {
  const fontWeight = thisPlayer === info._name ? "bold" : "normal";
  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <Text style={[styles.infoName, { fontWeight: fontWeight }]}>
        {info._name}
      </Text>
      <Text style={[styles.infoChips, { fontWeight: fontWeight }]}>
        £{info._chips}
      </Text>
    </View>
  );
};

const InfoScreen = ({ contextProvider, token, gameData }) => {
  const { leaveGameInGame } = useContext(contextProvider);
  const copyPlayers = [...gameData._players._players];

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.infoPlayers}>
        <Text
          style={[
            { textAlign: "center", marginTop: 20, marginBottom: 20 },
            styles.bigText,
          ]}
        >
          Table Standings
        </Text>
        <FlatList
          data={copyPlayers.sort((a, b) => {
            return b._chips - a._chips;
          })}
          renderItem={({ item }) => (
            <PlayerStats info={item} thisPlayer={token.displayName} />
          )}
          keyExtractor={(item, index) => `player-info-${index}`}
        />
      </View>
      {gameData._small_blind !== undefined ? (
        <>
          <gStyle.HorizontalRule />
          <Text style={[{ textAlign: "center" }, styles.bigText]}>
            Blinds: £{gameData._small_blind}/{gameData._small_blind * 2}
          </Text>
          {gameData._blinds_up_at !== null ? (
            <>
              <gStyle.HorizontalRule />
              <Text style={[{ textAlign: "center" }, styles.bigText]}>
                Blinds up at{" "}
                {new Date(gameData._blinds_up_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </>
          ) : null}
        </>
      ) : null}
      <gStyle.HorizontalRule />
      <Text style={[{ textAlign: "center" }, styles.bigText]}>
        Game: {token.gameCode}
      </Text>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <StyledButton
          buttonText="Leave Game"
          onPress={() =>
            leaveGameAlert(
              () => null,
              () =>
                leaveGameInGame({
                  gameCode: token.gameCode,
                  displayName: token.displayName,
                })
            )
          }
          style={{ backgroundColor: "red" }}
          underlayColor="#ff4d4d"
        />
      </View>
    </View>
  );
};

const StartHand = ({ token, gameData, startHand }) => {
  const dealerPlayer = gameData._players._players.find(
    (o) => o._dealer === true
  );
  const isDealer = dealerPlayer._name === token.displayName;
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {isDealer ? (
        <StyledButton
          buttonText="Start Hand"
          onPress={startHand}
          style={styles.bigButton}
          textStyle={styles.bigText}
        />
      ) : (
        <Text>Waiting for dealer to start the hand</Text>
      )}
    </View>
  );
};

const LogItem = ({ data }) => {
  const formattedDate = new Date(data.time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <View style={styles.logItem}>
      <Text>
        [{formattedDate}] - {data.message}
      </Text>
    </View>
  );
};

const LogScreen = ({ logMessages }) => {
  return (
    <SafeAreaView style={{ flex: 1, marginLeft: 20, marginTop: 40 }}>
      <FlatList
        data={logMessages}
        renderItem={(item) => <LogItem data={item.item} />}
        keyExtractor={(_, index) => `logMsg-${index}`}
      />
    </SafeAreaView>
  );
};

const SplitPotWinnersScreen = ({ gameData, confirmCallback }) => {
  var playersToChoose = gameData._players._players.filter(
    (p) => p._move !== "FOLD"
  );
  const [state, setState] = useState(
    playersToChoose.map((p) => ({
      ...p,
      selectedToWin: false,
    }))
  );
  const setPlayerSelected = (i, newVal) => {
    setState(
      update(state, {
        [i]: {
          selectedToWin: {
            $set: newVal,
          },
        },
      })
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, marginLeft: 20, marginTop: 40 }}>
      <Text style={{ fontSize: 18, alignSelf: "center" }}>
        Select winning player(s) to split the pot
      </Text>
      <Text style={{ fontSize: 18, alignSelf: "center" }}>
        Pot: £{gameData._pot}
      </Text>
      <gStyle.HorizontalRule />
      <FlatList
        data={state}
        renderItem={(item) => (
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.bigText}>{item.item._name}</Text>
            <CheckBox
              value={item.item.selectedToWin}
              onValueChange={(newVal) => setPlayerSelected(item.index, newVal)}
            />
          </View>
        )}
        keyExtractor={(_, index) => `selectablePlayer-${index}`}
      />
      <StyledButton
        buttonText="Confirm Winners"
        underlayColor={gStyle.buttonUnderlayColor}
        onPress={() =>
          confirmCallback(
            state.filter((p) => p.selectedToWin === true).map((p) => p._name)
          )
        }
        disabled={state.filter((p) => p.selectedToWin === true).length === 0}
      />
    </SafeAreaView>
  );
};

const SelectWinnerScreen = ({ gameData, token }) => {
  const dealerPlayer = gameData._players._players.find(
    (o) => o._dealer === true
  );
  const isDealer = dealerPlayer._name === token.displayName;

  const splitPotCallback = (names) => {
    websocket.emit("SELECT_WINNERS", token.gameCode, names);
  };

  return isDealer ? (
    gameData._is_sidepot === false ? (
      <SplitPotWinnersScreen
        gameData={gameData}
        confirmCallback={splitPotCallback}
      />
    ) : null
  ) : (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Waiting for dealer to choose the winner of the hand</Text>
    </View>
  );
};

const Tab = createBottomTabNavigator();

export const GameScreen = ({ navigation, contextProvider, token }) => {
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);

  websocket.off("GOT_GAME_INFO").on("GOT_GAME_INFO", (newdata) => {
    // console.log(newdata);
    setGameData(JSON.parse(newdata));
    setLoading(false);
  });

  useEffect(() => {
    websocket.emit("GET_IN_GAME_INFO", token.gameCode);
  }, []);

  const makeMove = (moveName, betAmount) => {
    const is_my_turn =
      gameData._players._players[gameData._players_turn]._name ===
      token.displayName;
    if (is_my_turn) {
      console.log(`move ${moveName} ${betAmount ? betAmount : ""}`);
    } else {
      console.log("oi it's not your turn!!!");
    }
    websocket.emit("MAKE_MOVE", token.gameCode, moveName, betAmount || -1);
  };

  const startHand = () => {
    websocket.emit("STARTHAND", token.gameCode);
  };

  // TODO: if roundtype is showdown then return select winner screen not tab navigation
  return (
    <NavigationContainer independent={true}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Play") {
              iconName = focused ? "cards" : "cards-outline";
            } else if (route.name === "Info") {
              iconName = focused ? "account-group" : "account-group-outline";
            } else if (route.name === "Start") {
              iconName = focused ? "clock" : "clock-outline";
            } else if (route.name === "Log") {
              iconName = focused ? "file-document" : "file-document-outline";
            } else if (route.name === "Choose Winners") {
              iconName = "check-all";
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: gStyle.primary,
          inactiveTintColor: "gray",
        }}
      >
        {loading ? (
          <Tab.Screen name="Loading" component={SplashScreen} />
        ) : gameData._round === "ON_BACKS" ? (
          <Tab.Screen name="Choose Winners">
            {(props) => (
              <SelectWinnerScreen
                {...props}
                gameData={gameData}
                token={token}
              />
            )}
          </Tab.Screen>
        ) : (
          <>
            {gameData._round === "PRE_HAND" ? (
              <Tab.Screen name="Start">
                {(props) => (
                  <StartHand
                    {...props}
                    token={token}
                    gameData={gameData}
                    startHand={startHand}
                  />
                )}
              </Tab.Screen>
            ) : (
              <Tab.Screen name="Play">
                {(props) => (
                  <PlayScreen
                    {...props}
                    contextProvider={contextProvider}
                    token={token}
                    gameData={gameData}
                    makeMove={makeMove}
                  />
                )}
              </Tab.Screen>
            )}
            <Tab.Screen name="Info">
              {(props) => (
                <InfoScreen
                  {...props}
                  contextProvider={contextProvider}
                  token={token}
                  gameData={gameData}
                />
              )}
            </Tab.Screen>
            <Tab.Screen name="Log">
              {(props) => (
                <LogScreen {...props} logMessages={gameData._logger} />
              )}
            </Tab.Screen>
          </>
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
};
