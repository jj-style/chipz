import 'react-native-gesture-handler'; // MUST BE AT TOP

// Core react imports
import React from 'react';

import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

// React Navigation stuff
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// my components
import { HomeScreen } from './components/HomeScreen';
import { CreateForm } from './components/CreateForm';
import { JoinForm } from './components/JoinForm';
import { PlayerList } from './components/PlayerList';

const theme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
      ...DefaultTheme.colors,
      primary: '#3498db',
      accent: '#248f24',
    },
  };

const Stack = createStackNavigator();

const App = () => {
    return (
        <PaperProvider theme={theme}>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Create Game" component={CreateForm} />
                    <Stack.Screen name="Join Game" component={JoinForm} />
                    <Stack.Screen name="Players" component={PlayerList} />
                </Stack.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );
}

export default App;