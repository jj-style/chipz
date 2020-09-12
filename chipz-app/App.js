import 'react-native-gesture-handler'; // MUST BE AT TOP

// Core react imports
import React, { createContext, useEffect, useReducer, useMemo } from 'react';

// React native imports
import AsyncStorage from '@react-native-community/async-storage';

// React Navigation stuff
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// my components
import { HomeScreen } from './components/HomeScreen';
import { CreateForm } from './components/CreateForm';
import { JoinForm } from './components/JoinForm';
import { PlayerList } from './components/PlayerList';
import { GameScreen } from './components/GameScreen';
import { SplashScreen } from './components/SplashScreen';
import { LeaveGameIcon } from './components/LeaveGameIcon';

import { AuthContext } from './AuthContext';

import * as gStyle from './components/globalStyle.js';

const Stack = createStackNavigator();

const App = () => {
    const [state, dispatch] = useReducer((prevState, action) => {
        switch (action.type) {
            case 'RESTORE_TOKEN':
                return {
                    ...prevState,
                    userToken: action.token,
                    loading: false
                };
            case 'JOIN_GAME':
                return {
                    ...prevState,
                    signOut: false,
                    userToken: action.token
                };
            case 'START_GAME':
                return {
                    ...prevState,
                    userToken: {
                        ...(prevState.userToken),
                        gameStarted:true
                    }
                }
            case 'LEAVE_GAME':
                return {
                    ...prevState,
                    signOut: true,
                    userToken: null
                };
        }
    },
        {
            loading: true,
            signOut: false,
            userToken: null
        }
    );

    useEffect(() => {
        const asyncTokenLoad = async () => {
            let token;
            try {
                token = await AsyncStorage.getItem('userToken');
                token =  token != null ? JSON.parse(token) : null;
            } catch(e) {
                token = null;
            }
            dispatch({type: 'RESTORE_TOKEN', token: token});
        };
        asyncTokenLoad();
    }, []);

    const storeUserToken = async (data) => {
        try {
            await AsyncStorage.setItem('userToken', data);
        } catch (e) {
            console.log("error saving data");
        }
    }

    const removeUserToken = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
        } catch (e) {
            console.log(e);
            console.log("error removing token");
        }
    }

    const authContext = useMemo(() => ({
        createGame: async data => {
            const { startingChips, useBlinds, startingBlinds, blindInterval, displayName } = data;
            // get game code from server here passing this data to create game
            const token = {gameCode: 'abc', displayName, gameStarted: false, host: true};
            storeUserToken(JSON.stringify(token))
            .then(() => {
                console.log("stored user token", token);
                dispatch({ type: 'JOIN_GAME', token: token });
            })
            .catch((e) => console.log(e));

        },
        joinGame: async data => {
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token
        
        // const {gameCode, displayName} = data;
        const token = {...data, gameStarted:false, host:false};
        storeUserToken(JSON.stringify(token))
        .then(() => dispatch({ type: 'JOIN_GAME', token: token }))
        .catch((e) => console.log(e));
        },
        startGame: () => {
            storeUserToken(JSON.stringify({...(state.userToken), gameStarted: true}))
            .then(() => dispatch({ type: 'START_GAME' }))
            .catch((e) => console.log(e));
        },
        leaveGame: () => {
            removeUserToken()
            .then(() => dispatch({ type: 'LEAVE_GAME' }))
            .catch((e) => console.log(e));
        }
    }),[]);

    if (state.loading)
        return <SplashScreen />;

    return (
        <AuthContext.Provider value={authContext}>
        <NavigationContainer>
            <Stack.Navigator 
                    screenOptions={{
                    headerStyle: {
                        backgroundColor: gStyle.primary,
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'normal',
                    },
                    }}
            >
            {state.userToken == null ? 
                <>
                    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Create Game">
                        {props => <CreateForm {...props} contextProvider={AuthContext} /> }
                    </Stack.Screen>
                    <Stack.Screen name="Join Game">
                        {props => <JoinForm {...props} contextProvider={AuthContext} /> }
                    </Stack.Screen>
                </>
                :
                <>
                    {state.userToken.gameStarted === false ? 
                    <Stack.Screen name="Players" 
                        options={{ 
                            headerLeft: () => (
                                <LeaveGameIcon
                                    onPress={() => authContext.leaveGame()}
                                />
                            )
                        }}
                    >
                        {props => <PlayerList {...props} contextProvider={AuthContext} method={state.userToken.host?"create":"join"} /> }
                    </Stack.Screen>
                    :
                    <Stack.Screen name="Game Screen"options={{ headerShown: false }}>
                        {props => <GameScreen {...props} contextProvider={AuthContext} /> }
                    </Stack.Screen>
                    }
                </>
            }
            </Stack.Navigator>
        </NavigationContainer>
        </AuthContext.Provider>
    );
}

export default App;