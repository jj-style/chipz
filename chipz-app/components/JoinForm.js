import React, { useState, useContext } from 'react';
import {    View, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, 
            StyleSheet, TextInput, Platform, Modal, Text, TouchableHighlight, Alert } from 'react-native';
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

export const JoinForm = ({navigation, contextProvider}) => {
    
    const [gameCode, setGameCode] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [alertText, setAlertText] = useState("");
    
    const { joinGame } = useContext(contextProvider);

    const showAlert = () => Alert.alert(
        "Error",
        alertText,
        [
          { text: "OK", onPress: () => console.log("OK Pressed") }
        ],
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView style={{flex: 1}}
                behavior={Platform.OS == "ios" ? "padding" : "height"}
            >
                <View style={styles.fieldContainer}>
                    <TextInput
                        style={styles.text}
                        placeholder="Game Code"
                        spellCheck={false}
                        value={gameCode}
                        onChangeText={(e) => setGameCode(e)}
                        underlineColorAndroid={gStyle.primary}
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
                <TouchableHighlight onPress={() => { setAlertText("Error name already taken"); showAlert();}} style={{alignSelf:'center'}} underlayColor="#fff">
                    <Text>Show example error modal</Text>
                </TouchableHighlight>
                <StyledButton 
                    buttonText="Join Game"
                    // onPress={() => navigation.navigate("Players", {method: "join"})} // this will need to make fetch then if error, modal, otherwise navigate
                    onPress={() => joinGame({gameCode, displayName})}
                    disabled={!(gameCode.length > 0) && (displayName.length > 0)}
                />
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}