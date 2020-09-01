import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

import { Button } from 'react-native-paper';

const styles = StyleSheet.create({
    logoImage: {
        width: "50%",
        height: "70%",
        alignSelf: "center"
    }, 
    buttonContainer: {
        flex: 1,
        flexDirection: "column"
    },
    button: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch',
        marginBottom: 50
    },
    buttonText: {
        fontSize: 20
    }
});

export const HomeScreen = ({navigation}) => {
    return (
        <View>
            <Image source={require("../assets/splash.png")} style={styles.logoImage}/>
            <View style={styles.buttonContainer}>
                <Button mode="text" compact={true} onPress={() => navigation.navigate("Create Game")} style={styles.button} labelStyle={styles.buttonText}>
                    Create Game
                </Button>
                <Button mode="text" compact={true} onPress={() => navigation.navigate("Join Game")} style={styles.button} labelStyle={styles.buttonText}>
                    Join Game
                </Button>
            </View>
        </View>
    );
    
}