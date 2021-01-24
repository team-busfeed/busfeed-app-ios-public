import React, { useState, Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import externalStyle from "../../../style/externalStyle"
import { default as Header } from './Header'
import { default as Map } from './Map'
import { default as Navigation } from './Navigation'
import tailwind from 'tailwind-rn'

class Controls extends Component {

    render() {
        return (
            <View style={tailwind('h-3/5 bg-white px-4 mb-4 mt-4')}>
                <View style={externalStyle.controlsCard}>
                    <Header/>
                    <Map states = {this.props.states}/>
                    {/* <Navigation/> */}
                </View>
            </View>
        )
    }
}

export default Controls