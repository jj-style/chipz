import React from 'react';
import { View, Text, StyleSheet, TouchableHighlight, Image } from 'react-native';

import * as gStyle from './globalStyle';

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
                <TouchableHighlight style={gStyle.styles.button} onPress={() => navigation.navigate("Create Game")} underlayColor={gStyle.buttonUnderlayColor}>
                    <Text style={gStyle.styles.buttonText}>Create Game</Text>
                </TouchableHighlight>
                <TouchableHighlight style={gStyle.styles.button} onPress={() => navigation.navigate("Join Game")} underlayColor={gStyle.buttonUnderlayColor}>
                    <Text style={gStyle.styles.buttonText}>Join Game</Text>
                </TouchableHighlight>
            </View>
        </View>
    );
    
}