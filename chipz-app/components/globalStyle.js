import React from 'react';
import { StyleSheet, View } from 'react-native';

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
        borderRadius: 10
    },
    buttonText: {
        color: primaryText,
        fontSize: 18
    },
});

export const HorizontalRule = () => {
    return <View 
                style={{
                    borderBottomColor: 'black',
                    borderBottomWidth: 1,
                    marginTop: 15,
                    marginBottom: 15
                }}
    />
}