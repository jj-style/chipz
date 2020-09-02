import React, {useState} from 'react';
import { View, Text, StyleSheet, TextInput, Switch, Slider, TouchableHighlight } from 'react-native';

const styles = StyleSheet.create({
    fieldContainer: {
        flex: 1,
        marginTop: 20,
        marginBottom: 20,
        marginRight: 10,
        marginLeft: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    text: {
        height: 40,
        width: 130,
        margin: 0,
        marginRight: 7,
        paddingLeft: 10
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

export const CreateForm = () => {

    const [startingChips, setStartingChips] = useState(0);
    const [useBlinds, setUseBlinds] = useState(true);
    const [startingBlinds, setStartingBlinds] = useState(0);
    const [blindInterval, setBlindInterval] = useState(15);

    return (
        <View style={{flex: 1}}>
            <View style={styles.fieldContainer}>
                <TextInput
                    style={styles.text}
                    keyboardType="numeric"
                    placeholder="Starting chips"
                    spellCheck={false}
                    value={startingChips}
                    onChangeText={(e) => setStartingChips(Number(e))}
                    underlineColorAndroid="#48BBEC"
                />
                <View style={{flexDirection:'row', alignItems:'stretch'}}>
                    <Text style={{marginRight: 30}}>Blinds</Text>
                    <Switch
                        trackColor={{ false: "maroon", true: "darkgreen" }}
                        thumbColor={useBlinds ? "green" : "red"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => setUseBlinds(!useBlinds)}
                        value={useBlinds}
                    />
                </View>
                <Text>Starting Blinds: £{startingBlinds}</Text>
                <Slider 
                    disabled={!useBlinds}
                    minimumValue={0}
                    maximumValue={startingChips || 1000}
                    step={10}
                    onValueChange={(n) => setStartingBlinds(n)}
                    value={startingBlinds}
                    style={{width: "75%"}}
                />
                <Text>Blind interval: {blindInterval} minutes {!blindInterval?"(Blinds won't increase)":""}</Text>
                <Slider 
                    disabled={!useBlinds}
                    minimumValue={0}
                    maximumValue={60}
                    step={5}
                    onValueChange={(n) => setBlindInterval(n)}
                    value={blindInterval}
                    style={{width: "75%"}}
                />
            </View>
            <TouchableHighlight style={styles.button} onPress={() => console.log("Starting Game")}>
                <Text style={styles.buttonText}>Start Game</Text>
            </TouchableHighlight>
        </View>
    );
}