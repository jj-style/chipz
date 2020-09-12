import React, { useState } from 'react';
import {    View, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, 
            StyleSheet, TextInput, Platform, Modal, Text, TouchableHighlight } from 'react-native';
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
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
});

export const JoinForm = ({navigation}) => {
    
    const [gameCode, setGameCode] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalText, setModalText] = useState("");
    
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView style={{flex: 1}}
                behavior={Platform.OS == "ios" ? "padding" : "height"}
            >
                <View style={styles.fieldContainer}>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showModal}
                    >
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>{modalText}</Text>
                            <TouchableHighlight
                                style={{ ...styles.openButton, backgroundColor: gStyle.primary }}
                                underlayColor={gStyle.buttonUnderlayColor}
                                onPress={() => {
                                    console.log("closing modal");
                                    setShowModal(false);
                                }}
                            >
                                <Text style={styles.textStyle}>Hide Modal</Text>
                            </TouchableHighlight>
                        </View>
                    </Modal>
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
                <TouchableHighlight onPress={() => { setModalText("Error name already taken"); setShowModal(true)}} style={{alignSelf:'center'}} underlayColor="#fff">
                    <Text>Show example error modal</Text>
                </TouchableHighlight>
                <StyledButton 
                    buttonText="Join Game"
                    onPress={() => navigation.navigate("Players", {method: "join"})} // this will need to make fetch then if error, modal, otherwise navigate
                    disabled={!(gameCode.length > 0) && (displayName.length > 0)}
                />
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}