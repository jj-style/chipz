import React, { Component } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { StyledButton } from "./StyledButton";
import * as gStyle from "./globalStyle";

class ChooseSidePotOrder extends Component {
  constructor(props) {
    super(props);
    this.state = { data: [], confirmCallback: null };
  }

  componentDidMount() {
    this.setState({
      data: this.props.data.map((o) => o["_name"]),
      confirmCallback: this.props.confirmCallback,
    });
  }

  renderItem = ({ item, index, drag, isActive }) => {
    return (
      <TouchableOpacity
        style={{
          height: 100,
          backgroundColor: isActive ? "lightgray" : item.backgroundColor,
          alignItems: "center",
          justifyContent: "center",
        }}
        onLongPress={drag}
      >
        <Text
          style={{
            fontWeight: "bold",
            color: "black",
            fontSize: 32,
          }}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <DraggableFlatList
          data={this.state.data}
          renderItem={this.renderItem}
          keyExtractor={(_, index) => `draggable-item-${index}`}
          onDragEnd={({ data }) => this.setState({ data })}
        />
        <StyledButton
          buttonText="Confirm Order"
          underlayColor={gStyle.buttonUnderlayColor}
          onPress={() => this.state.confirmCallback(this.state.data)}
        />
      </View>
    );
  }
}

export default ChooseSidePotOrder;
