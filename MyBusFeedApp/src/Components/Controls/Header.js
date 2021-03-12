import React, { Component } from 'react'
import { View, Text, TextInput, Button, StyleSheet, Keyboard, TouchableOpacity } from 'react-native'
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
            searchText: "",
            setKeyboardOnFocus: false
        }
    }

    searchInputField = React.createRef()

    resetSearchState() {
        if (!this.state.isSearchInputHidden) {
            this.setState(() => ({
                isSearchInputHidden: true,
            }))
        }
    }

    didToggleSearchButton() {
        console.log("=======================")
        console.log("Did press search button")
        console.log("=======================")

        this.setState((previousState) => ({
            isSearchInputHidden: !previousState.isSearchInputHidden,
        }))

        this.setState({
            setKeyboardOnFocus: true
        })
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

        this.setState({
            setKeyboardOnFocus: false
        })
    }

    didTriggerSearch() {
        Keyboard.dismiss()
        console.log(this.state.searchText)

        axios
        .get("https://api.mybusfeed.com/location/getBusStopInformation/" + this.state.searchText)
        .then((response) => {
            console.log(response.data)
            this.props.states.busStops = response.data
            this.props.states.latitude = parseFloat(response.data[0].busstop_lat)
            this.props.states.longitude = parseFloat(response.data[0].busstop_lng)
            this.props.triggerIndexOnSearch()
            this.props.triggerMapsOnSearch()
            this.resetSearchState()
        }).catch((error) => {
            console.log(error)
            this.props.states.busStops = []
            this.props.triggerIndexOnSearch()
            this.props.triggerMapsOnSearch()
            this.resetSearchState()
        })
    }

    render() {
        controls = null
        
        if (this.state.isSearchInputHidden) {
            controls =  
            <View style={tailwind('flex flex-row justify-center items-center')}>
                <View style={tailwind('flex flex-row w-4/6 py-1')}>
                    <Text style={tailwind('text-xl font-semibold text-gray-600 mx-2')}>
                        MyBusFeed
                    </Text>
                </View>
                <View style={tailwind('flex flex-row w-1/3 justify-around')}>
                    <TouchableOpacity onPress={() => this.didToggleSearchButton()}>
                        <Icon name="search" size={20} color="grey"/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.props.resetLocation()}>
                        <Icon name="location-arrow" size={20} style={tailwind('text-blue-500')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.props.setModalVisible()}>
                        <Icon style={tailwind("pl-2")} name="ellipsis-v" size={20} color="grey"/>
                    </TouchableOpacity>
                </View>
            </View>
        } else {
            controls = <View style={tailwind('flex flex-row justify-between items-center')}>
                <View style={tailwind('w-5/6')}>
                    <TextInput
                        style={[tailwind('py-2 px-2 border border-gray-200 rounded-2xl bg-gray-100')]}
                        onChangeText={(text) => this.setState({searchText: text})}
                        onSubmitEditing={() => this.didTriggerSearch()}
                        placeholder={"e.g. Marymount Stn or 05131..."}
                        clearButtonMode={"while-editing"}
                        autoFocus={this.state.setKeyboardOnFocus}
                    />
                    {/* <SearchBar
                        placeholder={"e.g. Marymount Stn or 05131..."}
                        onChangeText={(text) => this.setState({searchText: text})}
                        value={this.state.searchText}/> */}
                </View>
                <TouchableOpacity style={tailwind('flex justify-end')} onPress={() => this.didTapCancel()}>
                    <Text style={tailwind('text-blue-500')}>Cancel</Text>
                </TouchableOpacity>
            </View>
        }
        return (
            <View style={tailwind('m-3 bg-white')}>
                {controls}
            </View>
        )
    }
}