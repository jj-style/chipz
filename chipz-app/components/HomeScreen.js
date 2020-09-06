import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

import { StyledButton } from './StyledButton';

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
                <StyledButton
                    buttonText="Create Game"
                    onPress={() => navigation.navigate("Create Game")}
                />
                <StyledButton
                    buttonText="Join Game"
                    onPress={() => navigation.navigate("Join Game")}
                />
            </View>
        </View>
    );
    
}