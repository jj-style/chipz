import React from 'react';
import { TouchableHighlight, Text } from 'react-native';
import * as gStyle from './globalStyle';

export const StyledButton = ({buttonText,onPress, style, textStyle, disabled}) => {
    return (
        <TouchableHighlight style={[gStyle.styles.button, style]} underlayColor={gStyle.buttonUnderlayColor} onPress={onPress?onPress:null} disabled={disabled}>
            <Text style={[gStyle.styles.buttonText, textStyle]}>
                {buttonText}
            </Text>
        </TouchableHighlight>
    );
}