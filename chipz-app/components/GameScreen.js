import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, Slider } from 'react-native';                

import * as gStyle from './globalStyle';
import { StyledButton } from './StyledButton';

const tmpState = {
    pot: 20,
    smallBlind: 10,
    lastBet: null, // so next min bet is twice this if not null otherwise small blind
    playersChips: 100 // will this be list of all players or just this ones?
}

const styles = StyleSheet.create({
    buttonGroup: {
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    betButton: {
        backgroundColor: 'white',
        borderColor: gStyle.primary,
        borderWidth: 2,
        borderRadius: 10,
        alignSelf: 'stretch',
        margin: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10
    },
    quickBetRow: {
        flexDirection: 'row',
    },
    bigButton: {
        height: "25%",
    },
    bigText: {
        fontSize: 32,
        fontWeight: 'bold'
    },
    infoBox: {
        alignItems: 'center',
        backgroundColor: 'white',
        alignSelf: 'center',
        width: "100%",
        borderRadius: 10
    }
});

export const GameScreen = ({navigation}) => {
    const minBet = !tmpState.lastBet ? tmpState.smallBlind : tmpState.lastBet;
    const [ newBet, setNewBet ] = useState(minBet);

    //TODO: Reset navigation so can't go back

    return (
        <View style={{flex: 1, margin: 10, marginTop: 30}}>
            <View style={styles.infoBox}>
                <Text>Chips: £{tmpState.playersChips}</Text>
                <Text>Pot: £{tmpState.pot}</Text>
                <Text>Blinds: £{tmpState.smallBlind}/£{tmpState.smallBlind*2}</Text>
            </View>
            <View style={styles.buttonGroup}>
                <StyledButton 
                    buttonText="Fold"
                    onPress={() => console.log("fold")}
                    style={styles.bigButton}
                    textStyle={styles.bigText}
                />
                {tmpState.lastBet === null ?
                    <StyledButton
                        buttonText="Check"
                        onPress={() => console.log("check")}
                        style={styles.bigButton}
                        textStyle={styles.bigText}    
                    />
                :
                    <StyledButton
                        buttonText="Call"
                        onPress={() => console.log("call")}
                        style={styles.bigButton}
                        textStyle={styles.bigText}
                    />
                }
                <TouchableHighlight onPress={() => console.log("bet")} style={[styles.betButton, styles.bigButton]} underlayColor="#e6e6e6">
                    <View style={{width: "100%", alignItems: 'center'}}>
                        <Text style={{fontSize: 18}}>Bet: £{newBet}</Text>
                        <Slider 
                            minimumValue={minBet}
                            maximumValue={tmpState.playersChips}
                            step={minBet}
                            onValueChange={(n) => setNewBet(n)}
                            value={newBet}
                            style={{width: "75%", marginTop: 10, marginBottom: 10}}
                        />
                        <View style={styles.quickBetRow}>
                            <StyledButton 
                                buttonText = "Min"
                                onPress={() => {setNewBet(minBet)}} 
                                style={{width: "20%"}} 
                                textStyle={{fontWeight: "bold"}}
                            />
                            <StyledButton
                                buttonText = "1/2 Pot"
                                onPress={() => {setNewBet( tmpState.pot/2 <= tmpState.playersChips ? tmpState.pot/2 : tmpState.playersChips)}}
                                style={{width: "20%"}}
                                textStyle={{fontWeight: "bold"}}
                            />
                            <StyledButton
                                buttonText = "Pot"
                                onPress={() => {setNewBet(tmpState.pot <= tmpState.playersChips ? tmpState.pot : tmpState.playersChips)}} 
                                style={{width:"20%"}}
                                textStyle={{fontWeight: "bold"}}
                            />
                            <StyledButton
                                buttonText = "Max"
                                onPress={() => {setNewBet(tmpState.playersChips)}} 
                                style={{width:"20%"}}
                                textStyle={{fontWeight: "bold"}}
                            />
                        </View>
                    </View>
                </TouchableHighlight>
            </View>
        </View>
    );
}