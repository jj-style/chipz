import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

import { StyledButton } from './StyledButton';

import CasinoChip from '../assets/casino_chip.png';

const styles = StyleSheet.create({
    logo: {
        width: 300,
        height: 400,
        alignSelf: 'center',
        marginTop: "20%"
    },
});

export const HomeScreen = ({navigation}) => {
    return (
        <View>
            <View>
                <Image resizeMode="contain" style={styles.logo} source={CasinoChip} />
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