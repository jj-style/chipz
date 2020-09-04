import 'react-native-gesture-handler'; // MUST BE AT TOP

// Core react imports
import React from 'react';

// React Navigation stuff
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// my components
import { HomeScreen } from './components/HomeScreen';
import { CreateForm } from './components/CreateForm';
import { JoinForm } from './components/JoinForm';
import { PlayerList } from './components/PlayerList';

import * as gStyle from './components/globalStyle.js';

const Stack = createStackNavigator();

const App = () => {
    return (
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
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>
                <Stack.Screen name="Create Game" component={CreateForm} />
                <Stack.Screen name="Join Game" component={JoinForm} />
                <Stack.Screen name="Players" component={PlayerList} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;