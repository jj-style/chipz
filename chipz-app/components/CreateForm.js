import React, {useState} from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { TextInput, Switch, Headline, Button } from 'react-native-paper';
import Slider from '@react-native-community/slider';

const styles = StyleSheet.create({
    formContainer: {
        flex: 1,
        flexDirection: 'column',
        margin: 10,
        height: "80%",
    },
    formRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingLeft: '5%',
        paddingRight: '5%',
        paddingTop: '5%',
        textAlignVertical: 'center'
    },
    rowElement: {
        height: "20%",
        width: "40%",
    }
});

export const CreateForm = ({navigation}) => {

    const [startingChips, setStartingChips] = useState("");
    const [blindsOn, toggleBlinds] = useState(true);
    const [startBlinds, setStartBlinds] = useState(10);
    const [incBlinds, setIncBlinds] = useState(10);

    return (
        <View style={styles.formContainer}>
            <TextInput
                label="Starting chips"
                value={startingChips}
                onChangeText={text => setStartingChips(text)}
                mode="flat"
            />
            <View style={styles.formRow}>
                <Headline style={styles.rowElement}>Blinds</Headline>
                <Switch
                    style={styles.rowElement}
                    value={blindsOn}
                    onValueChange={() => {toggleBlinds(!blindsOn)}}
                />
            </View>
            <View style={styles.formRow}>
                <Text style={styles.rowElement}>Starting Blinds: £{startBlinds}</Text>
                <Slider
                    style={styles.rowElement}
                    minimumValue={0}
                    maximumValue={Number(startingChips)}
                    minimumTrackTintColor="#248f24"
                    maximumTrackTintColor="#000000"
                    step={10}
                    value={startBlinds}
                    onValueChange={n => {setStartBlinds(n)}}
                    disabled={!blindsOn}
                />
            </View>
            <View style={styles.formRow}>
                <Text style={styles.rowElement}>Blind Increment: {incBlinds} minutes</Text>
                <Slider
                    style={styles.rowElement}
                    minimumValue={0}
                    maximumValue={Number(60)}
                    minimumTrackTintColor="#248f24"
                    maximumTrackTintColor="#000000"
                    step={5}
                    value={incBlinds}
                    onValueChange={n => {setIncBlinds(n)}}
                    disabled={!blindsOn}
                />
            </View>
            <Button mode="text" compact={true} onPress={() => navigation.navigate("Home")}>
                Start Game
            </Button>
        </View>
    );
}