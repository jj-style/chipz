import React from 'react';
import { View, Text, StyleSheet, TouchableHighlight, Image } from 'react-native';

const styles = StyleSheet.create({
    logo: {
        width: "75%",
        height: "75%",
        alignSelf: 'center'
    },
    button: {
        height: 50,
        backgroundColor: '#48BBEC',
        borderColor: '#48BBEC',
        alignSelf: 'stretch',
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5
    },
    buttonText: {
        color: '#fff',
        fontSize: 18
    },
});

export const HomeScreen = ({navigation}) => {
    return (
        <View>
            <View>
                <Image style={styles.logo} source={require("../assets/splash.png")} />
                <TouchableHighlight style={styles.button} onPress={() => navigation.navigate("Create Game")}>
                    <Text style={styles.buttonText}>Create Game</Text>
                </TouchableHighlight>
                <TouchableHighlight style={styles.button} onPress={() => navigation.navigate("Join Game")}>
                    <Text style={styles.buttonText}>Join Game</Text>
                </TouchableHighlight>
            </View>
        </View>
    );
    
}