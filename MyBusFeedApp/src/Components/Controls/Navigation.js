import React, { Component } from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import tailwind from 'tailwind-rn'

export default class Navigation extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selected: 0,
        }
    }

    didSelectNav = (selected) => {
        this.setState({
            selected: selected
        })

        if (selected === 1) {
            this.props.states.busStops = []
            this.props.triggerFavourites()
        } else {
            this.props.triggerRefresh()
        }

    }

    render() {
        return (
            <View style={tailwind('flex flex-row mt-5 h-full')}>
                <View style={this.state.selected == 0 ? tailwind('w-1/2') : tailwind('w-1/2 h-full')}>
                    <Icon name="location-pin" size={30} style={this.state.selected == 0 ? tailwind('self-center text-blue-300') : tailwind('self-center text-gray-600')} onPress={() => this.didSelectNav(0)}/>
                </View>
                <View style={tailwind('w-1/2')}>
                    <Icon name="favorite" size={30} style={this.state.selected == 1 ? tailwind('self-center text-red-500') : tailwind('self-center text-gray-600')} onPress={() => this.didSelectNav(1)}/>
                </View>
            </View> 
        )
    }
}