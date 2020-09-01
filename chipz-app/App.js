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


const Stack = createStackNavigator();

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={HomeScreen}/>
                <Stack.Screen name="Create Game" component={CreateForm}/>
                <Stack.Screen name="Join Game" component={JoinForm}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;