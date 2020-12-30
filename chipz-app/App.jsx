import "react-native-gesture-handler"; // MUST BE AT TOP

// Core react imports
import React, {
  createContext,
  useEffect,
  useReducer,
  useMemo,
  useState,
} from "react";

// React native imports
import AsyncStorage from "@react-native-community/async-storage";

// React Navigation stuff
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// my components
import { HomeScreen } from "./components/HomeScreen";
import { CreateForm } from "./components/CreateForm";
import { JoinForm } from "./components/JoinForm";
import { PlayerList } from "./components/PlayerList";
import { GameScreen } from "./components/GameScreen";
import { SplashScreen } from "./components/SplashScreen";
import { LeaveGameIcon, leaveGameAlert } from "./components/LeaveGame";

import { api } from "./api";

import { AppContext } from "./AppContext";

import * as gStyle from "./components/globalStyle";

import { websocket } from "./socket";

import { YellowBox } from "react-native";
YellowBox.ignoreWarnings(["Warning:", "Setting a timer", "Can't"]);

const Stack = createStackNavigator();

const initialState = {
  loading: true,
  signOut: false,
  userToken: null,
};

const App = () => {
  const [joinErrorMsg, setJoinErrorMsg] = useState("");

  const [state, dispatch] = useReducer((prevState, action) => {
    switch (action.type) {
      case "RESTORE_TOKEN":
        return {
          ...prevState,
          userToken: action.token,
          loading: false,
        };
      case "JOIN_GAME":
        return {
          ...prevState,
          signOut: false,
          userToken: action.token,
        };
      case "START_GAME":
        return {
          ...prevState,
          userToken: {
            ...prevState.userToken,
            gameStarted: true,
          },
        };
      case "LEAVE_GAME":
        return {
          ...prevState,
          signOut: true,
          userToken: null,
        };
      case "RELOAD":
        return {
          ...prevState,
          loading: true,
        };
      default:
        return prevState;
    }
  }, initialState);

  const asyncTokenLoad = async () => {
    let token;
    try {
      token = await AsyncStorage.getItem("userToken");
      token = token != null ? JSON.parse(token) : null;
    } catch (e) {
      token = null;
    }
    // retrieved token from users phone but must check if game still exists
    if (token !== null) {
      await fetch(`${api}/game/${token.gameCode}`, {
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
          console.log("game found can restore");
          dispatch({ type: "RESTORE_TOKEN", token: token });
        })
        .catch((error) => {
          error.then((e) => {
            console.log(e.message);
            console.log("restoring null");
            dispatch({ type: "RESTORE_TOKEN", token: null });
          });
        });
    } else {
      console.log("token was null, restoring null");
      dispatch({ type: "RESTORE_TOKEN", token: null });
    }
  };

  useEffect(() => {
    asyncTokenLoad();
  }, [state.loading]);

  const storeUserToken = async (data) => {
    try {
      await AsyncStorage.setItem("userToken", data);
      console.log("stored token", data);
    } catch (e) {
      console.log("error saving data");
    }
  };

  const removeUserToken = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
    } catch (e) {
      console.log(e);
      console.log("error removing token");
    }
  };

  const appContext = useMemo(
    () => ({
      createGame: async (data) => {
        const {
          startingChips,
          useBlinds,
          startingBlinds,
          blindInterval,
          displayName,
        } = data;
        // get game code from server here passing this data to create game

        let gameCode;
        fetch(`${api}/game`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
          .then((res) => res.json())
          .then(async (data) => {
            gameCode = data.room;
            const token = {
              gameCode: gameCode,
              displayName: displayName,
              gameStarted: false,
              host: true,
            };
            await storeUserToken(JSON.stringify(token));
            websocket.emit("join", { name: displayName, gameCode: gameCode });
            dispatch({ type: "RELOAD" });
          })
          .catch((e) => console.log("something went wrong creating a game :("));
      },
      joinGame: async (data) => {
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token

        const { gameCode, displayName } = data;
        fetch(`${api}/game/${gameCode}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
          .then((res) => {
            if (res.status >= 400) throw res.json();
            return res.json();
          })
          .then(async (newdata) => {
            const token = {
              gameCode: gameCode,
              displayName: displayName,
              gameStarted: false,
              host: false,
            };
            await storeUserToken(JSON.stringify(token));

            websocket.emit("join", { name: displayName, gameCode: gameCode });
            dispatch({ type: "RELOAD" });
          })
          .catch((error) => {
            error.then((e) => {
              console.log(e);
              setJoinErrorMsg(e);
            });
          });
      },
      startGame: async (data) => {
        const { userToken } = data;
        const token = { ...userToken, gameStarted: true };
        await storeUserToken(JSON.stringify(token));
        dispatch({ type: "RELOAD" });
      },
      leaveGame: async (data) => {
        const { gameCode, displayName } = data;
        fetch(`${api}/game/${gameCode}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
          .then((res) => {
            if (res.status >= 400) throw res.json();
            return res.json();
          })
          .then(async (newdata) => {
            await removeUserToken();
            websocket.emit("leave", { name: displayName, gameCode: gameCode });
            // dispatch({ type: 'LEAVE_GAME' });
            dispatch({ type: "RELOAD" });
            websocket.emit("GETPLAYERLISTINFO", gameCode);
          })
          .catch((error) => {
            error.then((e) => {
              console.log(e);
            });
          });
      },
      leaveGameInGame: async (data) => {
        const { gameCode, displayName } = data;
        fetch(`${api}/game/${gameCode}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
          .then((res) => {
            if (res.status >= 400) throw res.json();
            return res.json();
          })
          .then(async (newdata) => {
            await removeUserToken();
            websocket.emit("leave", { name: displayName, gameCode: gameCode });
            dispatch({ type: "RELOAD" });
            websocket.emit("GET_IN_GAME_INFO", gameCode);
          })
          .catch((error) => {
            error.then((e) => {
              console.log(e);
            });
          });
      },
      reload: async () => {
        await removeUserToken();
        dispatch({ type: "RELOAD" });
      },
    }),
    []
  );

  useEffect(() => {
    websocket.off("GAMEENDED").on("GAMEENDED", (data) => {
      appContext.leaveGame({
        gameCode: state.userToken.gameCode,
        displayName: state.userToken.displayName,
      });
    });
    websocket.off("STARTGAME").on("STARTGAME", (data) => {
      appContext.startGame(state);
    });
    return () => {
      websocket.off("GAMEENDED");
    };
  }, [state]);

  if (state.loading) return <SplashScreen />;

  return (
    <AppContext.Provider value={appContext}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: gStyle.primary,
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "normal",
            },
          }}
        >
          {state.userToken == null ? (
            <>
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen name="Create Game">
                {(props) => (
                  <CreateForm {...props} contextProvider={AppContext} />
                )}
              </Stack.Screen>
              <Stack.Screen name="Join Game">
                {(props) => (
                  <JoinForm
                    {...props}
                    contextProvider={AppContext}
                    errorMsg={joinErrorMsg}
                    clearErrorMsg={() => setJoinErrorMsg("")}
                  />
                )}
              </Stack.Screen>
            </>
          ) : (
            <>
              {state.userToken.gameStarted === false ? (
                <Stack.Screen
                  name="Players"
                  options={{
                    headerLeft: () => (
                      <LeaveGameIcon
                        onPress={() =>
                          leaveGameAlert(
                            () => null,
                            state.userToken.host === false
                              ? () => {
                                  appContext.leaveGame({
                                    gameCode: state.userToken.gameCode,
                                    displayName: state.userToken.displayName,
                                  });
                                }
                              : () =>
                                  websocket.emit(
                                    "ENDGAME",
                                    state.userToken.gameCode
                                  ),
                            state.userToken.host
                          )
                        }
                      />
                    ),
                    title: `Game ${state.userToken.gameCode}`,
                  }}
                >
                  {(props) => (
                    <PlayerList
                      {...props}
                      contextProvider={AppContext}
                      method={state.userToken.host ? "create" : "join"}
                      gameCode={state.userToken.gameCode}
                    />
                  )}
                </Stack.Screen>
              ) : (
                <Stack.Screen
                  name="Game Screen"
                  options={{ headerShown: false }}
                >
                  {(props) => (
                    <GameScreen
                      {...props}
                      contextProvider={AppContext}
                      token={state.userToken}
                    />
                  )}
                </Stack.Screen>
              )}
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
};

export default App;
