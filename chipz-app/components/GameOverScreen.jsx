import React, { useContext } from "react";
import * as gStyle from "./globalStyle";
import { StyledButton } from "./StyledButton";
import { View, Text } from "react-native";

export const GameOverScreen = ({ winner, contextProvider }) => {
  const { reload } = useContext(contextProvider);
  return (
    <View
      style={{
        flex: 1,
        margin: 10,
        marginTop: 30,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 32 }}>{winner._name} is the winner</Text>
      <StyledButton
        underlayColor={gStyle.buttonUnderlayColor}
        buttonText="Return Home"
        onPress={reload}
      />
    </View>
  );
};
