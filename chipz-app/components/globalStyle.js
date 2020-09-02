import { StyleSheet } from 'react-native';

export const buttonUnderlayColor = '#7ecff1';
const buttonColor = '#48BBEC';
const borderColor = '#48BBEC';
const buttonTextColor = '#fff';

export const gStyle = StyleSheet.create({
    button: {
        height: 50,
        backgroundColor: buttonColor,
        borderColor: borderColor,
        alignSelf: 'stretch',
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5
    },
    buttonText: {
        color: buttonTextColor,
        fontSize: 18
    },
});