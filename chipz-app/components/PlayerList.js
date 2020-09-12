import React, { Component } from "react";
import { View, TouchableOpacity, Text, TouchableHighlight, FlatList } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";

import * as gStyle from './globalStyle';
import { StyledButton } from './StyledButton';

import Ionicons from 'react-native-vector-icons/Ionicons';

import { AuthContext } from '../AuthContext';

const tmpData = [
    { name: "Alan Turing", key:"1" },
    { name: "Charles Babbage", key:"2" },
    { name: "Dennis Ritchie", key:"3" },
    { name: "Ken Thompson", key:"4" },
    { name: "Donald Knuth", key:"5" },
];

export class PlayerList extends Component {
    static contextType = AuthContext;

    constructor(props) {
        super();
        this.state = {
            data: tmpData,
            dealer: "Alan Turing"
        };
    }

    toggleDealer(name) {
        if (name !== this.state.dealer) {
            this.setState({dealer: name});
        }
    }

    renderItem = ({ item, index, drag, isActive }) => {
        return (
            <View style={{ flex: 1, flexDirection: 'row', backgroundColor: isActive ? "#f2f2f2" : "#fff", alignContent: 'center', alignItems: 'center' }}>
                {/* <Text style={{ fontSize: 24, paddingLeft: 10 }}>{index + 1}</Text> */}
                <TouchableOpacity
                    style={{
                        height: 100,
                        width: "75%",
                        marginLeft: 10,
                        alignItems: "flex-start",
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
                <Ionicons name={item.dealer ? 
                "ios-star" : "ios-star-outline"} size={25} 
                onPress={() => {this.toggleDealer(item.name)}}
                />
            </View>
        );
    };

    renderItemNoMove = ({item, index}) => {
        return (
            <View style={{ flex: 1, flexDirection: 'row', backgroundColor: "#fff", alignContent: 'center', alignItems: 'center' }}>
                {/* <Text style={{ fontSize: 24, paddingLeft: 10 }}>{index + 1}</Text> */}
                <TouchableHighlight
                    style={{
                        height: 100,
                        width: "75%",
                        marginLeft: 10,
                        alignItems: "flex-start",
                        justifyContent: "center"
                    }}
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
                </TouchableHighlight>
                <Ionicons name={item.dealer ? 
                    "ios-star" : "ios-star-outline"} size={25} 
                />
            </View>
        );
    }

    render() {
        const dataToRender = this.state.data.map((p, index) => ({
            ...p,
            dealer: this.state.dealer === p.name
        }));
        // const { method } = this.props.route.params;
        const { method } = this.props;

        return (
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, alignSelf: 'center', textAlign: 'center', marginTop: 10, marginBottom: 10 }}>
                    Order players in the positions they are sitting and star the dealer.
                </Text>
                {method === "create" ?
                <>
                    <DraggableFlatList
                        data={dataToRender}
                        renderItem={this.renderItem}
                        keyExtractor={(item, index) => `draggable-item-${index}`}
                        onDragEnd={({ data }) => this.setState({ data })}
                    />
                    <StyledButton
                        buttonText="Begin Game"
                        // onPress={() => this.props.navigation.navigate("Game Screen")}
                        onPress={this.context.startGame}
                    />
                </>
                :
                    <FlatList
                        data={dataToRender}
                        renderItem={this.renderItemNoMove}
                    />
                }
            </View>
        );
    }
}