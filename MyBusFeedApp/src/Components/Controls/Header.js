import React, { Component } from 'react'
import { View, Text, TextInput, Button, StyleSheet, Keyboard } from 'react-native'
import tailwind from 'tailwind-rn'
import { WebView } from 'react-native-webview'
import Icon from 'react-native-vector-icons/FontAwesome'
import { SearchBar } from 'react-native-elements'

const styles = StyleSheet.create({
    controls: {
        padding: 0, 
        marginTop: 5,
    },
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

    didTriggerSearch() {
        Keyboard.dismiss()
        console.log(this.state.searchText)
    }

    render() {
        controls = null
        
        if (this.state.isSearchInputHidden) {
            controls =  
            <View style={tailwind('flex flex-row')}>
                <View style={tailwind('w-64')}>
                    <Text style={tailwind('text-xl font-semibold text-gray-600 mx-2')}>
                        MyBusFeed
                    </Text>
                </View>
                <View style={tailwind('w-1/5')}>
                    <Icon name="search" size={20} color="grey" onPress={() => this.didToggleSearchButton()}/>
                </View>
                <View style={tailwind('w-1/5')}>
                    <Icon name="ellipsis-v" size={20} color="grey"/>
                </View>
            </View>
        } else {
            controls = <View style={tailwind('flex flex-row')}>
                <View style={tailwind('w-5/6')}>
                    <TextInput
                        style={tailwind('h-8 border border-gray-400 rounded-2xl px-3')}
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
                <View style={tailwind('w-1/6 p-1 ml-2 mt-2')}>
                    <Text style={tailwind('text-blue-500')} onPress={() => this.didToggleSearchButton()}>Cancel</Text>
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