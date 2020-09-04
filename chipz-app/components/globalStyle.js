import { StyleSheet } from 'react-native';

export const buttonUnderlayColor = '#7ecff1';
export const primary = '#48BBEC';
const borderColor = '#48BBEC';
export const primaryText = '#fff';

export const styles = StyleSheet.create({
    button: {
        height: 50,
        backgroundColor: primary,
        borderColor: borderColor,
        alignSelf: 'stretch',
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5
    },
    buttonText: {
        color: primaryText,
        fontSize: 18
    },
});