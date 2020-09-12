import React from 'react';
import { Text, View } from 'react-native';

export const SplashScreen = () => {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignContent: 'center'}}>
            <Text style={{fontSize: 30}}>Loading...</Text>
        </View>
    )
}