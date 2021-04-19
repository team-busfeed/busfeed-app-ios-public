import React, { Component } from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
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

        this.props.states.selected = selected

        if (selected === 1) {
            this.props.states.busStops = []
            this.props.triggerFavourites()
        } else {
            this.props.triggerRefresh()
        }

    }

    render() {
        return (
            <View style={tailwind('flex flex-row h-full')}>
                <TouchableOpacity onPress={() => this.didSelectNav(0)} style={tailwind('w-1/2 pt-5')}>
                    <Icon name="location-pin" size={30} style={this.props.states.selected == 0 ? tailwind('self-center text-blue-500') : tailwind('self-center text-gray-600')} onPress={() => this.didSelectNav(0)}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.didSelectNav(1)} style={tailwind('w-1/2 pt-5')}>
                    <Icon name="favorite" size={30} style={this.props.states.selected ? tailwind('self-center text-red-500') : tailwind('self-center text-gray-600')} onPress={() => this.didSelectNav(1)}/>
                </TouchableOpacity>
            </View> 
        )
    }
}