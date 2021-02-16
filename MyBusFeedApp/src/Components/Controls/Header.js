import React, { Component } from 'react'
import { View, Text, TextInput, Button, StyleSheet, Keyboard } from 'react-native'
import tailwind from 'tailwind-rn'
import axios from 'axios'
import Icon from 'react-native-vector-icons/FontAwesome'
import Geolocation from '@react-native-community/geolocation'

const styles = StyleSheet.create({
    controls: {
        padding: 0, 
        marginTop: 5,
    },
    searchBar: {
        position: "relative"
    }
});

export default class Header extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isSearchInputHidden: true,
            searchText: ""
        }
    }

    didToggleSearchButton() {
        console.log("=======================")
        console.log("Did press search button")
        console.log("=======================")

        this.setState((previousState) => ({
            isSearchInputHidden: !previousState.isSearchInputHidden,
        }))
    }

    didTapCancel() {
        console.log("=======================")
        console.log("Did press cancel button")
        console.log("=======================")

        this.setState((previousState) => ({
            isSearchInputHidden: !previousState.isSearchInputHidden,
        }))

        this.props.triggerRefresh()
        this.props.triggerCentreOnRefresh()
    }

    didTriggerSearch() {
        Keyboard.dismiss()
        console.log(this.state.searchText)

        axios
        .get("https://api.mybusfeed.com/location/getBusStopInformation/" + this.state.searchText)
        .then((response) => {
            console.log(response.data)
            this.props.states.busStops = response.data
            this.props.states.latitude = response.data[0].busstop_lat
            this.props.states.longitude = response.data[0].busstop_lng
            this.props.triggerIndexOnSearch()
            this.props.triggerMapsOnSearch()
        }).catch((error) => {
            console.log(error)
        })
    }

    render() {
        controls = null
        
        if (this.state.isSearchInputHidden) {
            controls =  
            <View style={tailwind('flex flex-row justify-center items-center')}>
                <View style={tailwind('w-4/5')}>
                    <Text style={tailwind('text-xl font-semibold text-gray-600 mx-2')}>
                        MyBusFeed
                    </Text>
                </View>
                <View style={tailwind('flex flex-row w-1/5 justify-around')}>
                    <View>
                        <Icon name="search" size={20} color="grey" onPress={() => this.didToggleSearchButton()}/>
                    </View>
                    <View>
                        <Icon name="ellipsis-v" size={20} color="grey"/>
                    </View>
                </View>
            </View>
        } else {
            controls = <View style={tailwind('flex flex-row justify-between items-center')}>
                <View style={tailwind('w-5/6')}>
                    <TextInput
                        style={[tailwind('py-1 px-2 border border-gray-400 rounded-2xl')]}
                        onChangeText={(text) => this.setState({searchText: text})}
                        onSubmitEditing={() => this.didTriggerSearch()}
                        placeholder={"e.g. Marymount Stn or 05131..."}
                        clearButtonMode={"while-editing"}
                    />
                    {/* <SearchBar
                        placeholder={"e.g. Marymount Stn or 05131..."}
                        onChangeText={(text) => this.setState({searchText: text})}
                        value={this.state.searchText}/> */}
                </View>
                <View style={tailwind('flex justify-end')}>
                    <Text style={tailwind('text-blue-500')} onPress={() => this.didTapCancel()}>Cancel</Text>
                </View>
            </View>
        }
        return (
            <View style={tailwind('m-3 bg-white')}>
                {controls}
            </View>
        )
    }
}