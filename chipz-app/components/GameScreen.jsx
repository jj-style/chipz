import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Slider,
  FlatList,
} from "react-native";

import * as gStyle from "./globalStyle";
import { StyledButton } from "./StyledButton";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { leaveGameAlert } from "./LeaveGame";

import { api } from "../api";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SplashScreen } from "./SplashScreen";

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
});

const PlayScreen = ({ gameData, contextProvider, token }) => {
  const minBet = !tmpState.lastBet ? tmpState.smallBlind : tmpState.lastBet;
  const [newBet, setNewBet] = useState(minBet);

  function searchForPlayer(name, players) {
    for (var i = 0; i < players.length; i++) {
      if (players[i].name === name) {
        return players[i];
      }
    }
  }
  const thisPlayer = searchForPlayer(tmpState.thisPlayer, tmpState.players);
  const chipStack = thisPlayer.chips;
  const chipsOut = thisPlayer.infront;

  return (
    <View style={{ flex: 1, margin: 10, marginTop: 30 }}>
      <View style={styles.infoBox}>
        <Text style={styles.infoBoxText}>Pot: £{gameData._pot}</Text>
      </View>
      <View style={styles.buttonGroup}>
        <StyledButton
          buttonText="Fold"
          onPress={() => console.log("fold")}
          style={styles.bigButton}
          textStyle={styles.bigText}
        />
        {tmpState.lastBet === null ? (
          <StyledButton
            buttonText="Check"
            onPress={() => console.log("check")}
            style={styles.bigButton}
            textStyle={styles.bigText}
          />
        ) : (
          <StyledButton
            buttonText="Call"
            onPress={() => console.log("call")}
            style={styles.bigButton}
            textStyle={styles.bigText}
          />
        )}
        <TouchableHighlight
          onPress={() => console.log("bet")}
          style={[styles.betButton]}
          underlayColor="#e6e6e6"
        >
          <View style={{ width: "100%", alignItems: "center" }}>
            <Text style={{ fontSize: 18 }}>Bet: £{newBet}</Text>
            <Slider
              minimumValue={minBet} // TODO: will need to recalculate this
              maximumValue={chipStack} // TODO: max will be find the player then their stack
              step={minBet} // TODO: and this
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
                    tmpState.pot / 2 <= chipStack ? tmpState.pot / 2 : chipStack
                  );
                }}
                style={{ width: "17%" }}
                textStyle={{ fontWeight: "bold", fontSize: 12 }}
              />
              <StyledButton
                buttonText="Pot"
                onPress={() => {
                  setNewBet(
                    tmpState.pot <= chipStack ? tmpState.pot : chipStack
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
  const { leaveGame } = useContext(contextProvider);
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
          data={gameData._players._players.sort((a, b) => {
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
                leaveGame({
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

const Tab = createBottomTabNavigator();

export const GameScreen = ({ navigation, contextProvider, token }) => {
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${api}/game/${token.gameCode}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) {
          throw res.json();
        }
        return res.json();
      })
      .then((data) => {
        console.log("game data found");
        setGameData(data);
        setLoading(false);
      })
      .catch((error) => {
        error.then((e) => {
          console.log(e.message);
        });
      });
  }, []);

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
        ) : (
          <>
            <Tab.Screen name="Play">
              {(props) => (
                <PlayScreen
                  {...props}
                  contextProvider={contextProvider}
                  token={token}
                  gameData={gameData}
                />
              )}
            </Tab.Screen>
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
          </>
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
};
