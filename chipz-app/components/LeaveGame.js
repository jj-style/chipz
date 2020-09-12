import React from 'react';
import { Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const LeaveGameIcon = ({onPress}) => {
    return <Icon name="exit-run" size={25} onPress={onPress} color='#fff'/>
}

export const leaveGameAlert = (cancelOnPress, okOnPress) => {
    Alert.alert(
    "Warning",
    "Are you sure you want to leave the game?",
    [
        {
        text: "Cancel",
        onPress: () => cancelOnPress(),
        style: "cancel"
        },
        { text: "OK", onPress: () => okOnPress() }
    ],
    { cancelable: true }
    );
}