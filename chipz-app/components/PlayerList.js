import React, { Component } from "react";
import { View, TouchableOpacity, Text, TouchableHighlight, FlatList } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";

import { StyledButton } from './StyledButton';

import Ionicons from 'react-native-vector-icons/Ionicons';

import { AppContext } from '../AppContext';

import {websocket} from '../socket';

const tmpData = [
    { _name: "Alan Turing", _dealer:true, key:"1" },
    { _name: "Charles Babbage", _dealer:false, key:"2" },
    { _name: "Dennis Ritchie", _dealer:false, key:"3" },
    { _name: "Ken Thompson", _dealer:false, key:"4" },
    { _name: "Donald Knuth", _dealer:false, key:"5" },
];

export class PlayerList extends Component {
    static contextType = AppContext;

    constructor(props) {
        super(props);
        this.state = {
            data: tmpData,
        };

        websocket.off("GETPLAYERINFO").on("GETPLAYERINFO", newdata => {
            console.log("get player info callback");
            this.setState({ data: JSON.parse(newdata)._players})
        });
    }

    componentDidMount() {
        websocket.emit("GETPLAYERLISTINFO", this.props.gameCode);
    }

    toggleDealer(name) {
        let currentDealer = this.state.data.find(obj => obj._dealer == true);
        let newDealer = this.state.data.find(obj => obj._name === name);
    
        if (currentDealer !== newDealer) {
            var currrentStateData = this.state.data;
            currrentStateData[currrentStateData.findIndex(el => el._name === currentDealer._name)] = {...currentDealer, _dealer: false};
            currrentStateData[currrentStateData.findIndex(el => el._name === newDealer._name)] = {...newDealer, _dealer: true};
            this.setState({data: currrentStateData});
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
                        {item._name}
                    </Text>
                </TouchableOpacity>
                <Ionicons name={item._dealer ? 
                "ios-star" : "ios-star-outline"} size={25} 
                onPress={() => {
                    this.toggleDealer(item._name);
                    websocket.emit("SETPLAYERLISTINFO", this.props.gameCode, this.state.data);
                }}
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
                    {item._name}
                </Text>
                </TouchableHighlight>
                <Ionicons name={item._dealer ? 
                    "ios-star" : "ios-star-outline"} size={25} 
                />
            </View>
        );
    }

    render() {
        const { method } = this.props;

        return (
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, alignSelf: 'center', textAlign: 'center', marginTop: 10, marginBottom: 10 }}>
                    {method === "create" ?
                        "Order players in the positions they are sitting and star the dealer."
                    : "Waiting for host to start the game"
                    }
                </Text>
                {method === "create" ?
                <>
                    <DraggableFlatList
                        data={this.state.data}
                        renderItem={this.renderItem}
                        keyExtractor={(item, index) => `draggable-item-${index}`}
                        onDragEnd={({ data }) => {
                            this.setState({ data });
                            websocket.emit("SETPLAYERLISTINFO", this.props.gameCode, this.state.data);
                        }}
                    />
                    <StyledButton
                        buttonText="Begin Game"
                        // onPress={() => this.props.navigation.navigate("Game Screen")}
                        // onPress={this.context.startGame}
                        onPress={() => websocket.emit("STARTGAME", this.props.gameCode)}
                    />
                </>
                :
                    <FlatList
                        data={this.state.data}
                        renderItem={this.renderItemNoMove}
                        keyExtractor={(item, index) => `draggable-item-${index}`}
                    />
                }
            </View>
        );
    }
}