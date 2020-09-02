import React from 'react';
import { View, Text, StyleSheet, TouchableHighlight, Image } from 'react-native';

import { gStyle, buttonUnderlayColor } from './globalStyle';

const styles = StyleSheet.create({
    logo: {
        width: "75%",
        height: "75%",
        alignSelf: 'center'
    },
});

export const HomeScreen = ({navigation}) => {
    return (
        <View>
            <View>
                <Image style={styles.logo} source={require("../assets/splash.png")} />
                <TouchableHighlight style={gStyle.button} onPress={() => navigation.navigate("Create Game")} underlayColor={buttonUnderlayColor}>
                    <Text style={gStyle.buttonText}>Create Game</Text>
                </TouchableHighlight>
                <TouchableHighlight style={gStyle.button} onPress={() => navigation.navigate("Join Game")} underlayColor={buttonUnderlayColor}>
                    <Text style={gStyle.buttonText}>Join Game</Text>
                </TouchableHighlight>
            </View>
        </View>
    );
    
}