import React, {useState} from 'react';
import { View, Keyboard, TouchableWithoutFeedback, Text, StyleSheet, TextInput, Switch, Slider, KeyboardAvoidingView, Platform } from 'react-native';

import * as gStyle from './globalStyle'; 
import { StyledButton } from './StyledButton';

const styles = StyleSheet.create({
    fieldContainer: {
        flex: 1,
        margin: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    text: {
        height: 40,
        width: "75%",
        margin: 0,
        marginRight: 7,
        paddingLeft: 10
    },
});

export const CreateForm = ({navigation}) => {

    const [startingChips, setStartingChips] = useState(null);
    const [useBlinds, setUseBlinds] = useState(true);
    const [startingBlinds, setStartingBlinds] = useState(0);
    const [blindInterval, setBlindInterval] = useState(15);
    const [ displayName, setDisplayName ] = useState("");

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView style={{flex: 1}}
            behavior={Platform.OS == "ios" ? "padding" : "height"}
        >
            <View style={styles.fieldContainer}>
                <TextInput
                    style={styles.text}
                    keyboardType="numeric"
                    placeholder="Starting chips"
                    spellCheck={false}
                    value={startingChips}
                    onChangeText={(e) => setStartingChips(e)}
                    underlineColorAndroid={gStyle.primary}
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
                <Text>Starting Blinds: £{startingBlinds}/{startingBlinds*2}</Text>
                <Slider 
                    disabled={!useBlinds}
                    minimumValue={0}
                    maximumValue={Number(startingChips/2) || 100}
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
                <TextInput
                    style={styles.text}
                    placeholder="Display Name"
                    spellCheck={false}
                    value={displayName}
                    onChangeText={(e) => setDisplayName(e)}
                    underlineColorAndroid={gStyle.primary}
                />
            </View>
            <StyledButton 
                buttonText="Start Game"
                onPress={() => navigation.navigate("Players", {method: "create"})}
                disabled={!(startingChips && displayName !== "")}
            />
        </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}