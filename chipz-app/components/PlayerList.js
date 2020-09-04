import React, { Component } from "react";
import { View, TouchableOpacity, Text, TouchableHighlight } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";

import * as gStyle from './globalStyle';

const tmpData = [
    { name: "Alan Turing" },
    { name: "Charles Babbage" },
    { name: "Dennis Ritchie" },
    { name: "Ken Thompson" },
    { name: "Donald Knuth" },
];

export class PlayerList extends Component {
    state = {
        data: tmpData
    };

    renderItem = ({ item, index, drag, isActive }) => {
        return (
            <View style={{ flex: 1, flexDirection: 'row', backgroundColor: isActive ? "#f2f2f2" : "#fff", alignContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 24, paddingLeft: 10 }}>{index + 1}</Text>
                <TouchableOpacity
                    style={{
                        height: 100,
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                    onLongPress={drag}
                >
                    <Text
                        style={{
                            fontWeight: "bold",
                            color: "black",
                            fontSize: 32
                        }}
                    >
                        {item.name}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    render() {
        return (
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, alignSelf: 'center', marginTop: 10, marginBottom: 10 }}>
                    Order players in the positions they are sitting
        </Text>
                <DraggableFlatList
                    data={this.state.data}
                    renderItem={this.renderItem}
                    keyExtractor={(item, index) => `draggable-item-${index}`}
                    onDragEnd={({ data }) => this.setState({ data })}
                />
                <TouchableHighlight style={gStyle.styles.button} onPress={() => console.log("Begin game")} underlayColor={gStyle.buttonUnderlayColor}>
                    <Text style={gStyle.styles.buttonText}>Begin Game</Text>
                </TouchableHighlight>
            </View>
        );
    }
}