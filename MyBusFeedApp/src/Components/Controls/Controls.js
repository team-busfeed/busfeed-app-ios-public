import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import externalStyle from "../../../style/externalStyle"
import { default as Header } from './Header'
import { default as Map } from './Map'
import { default as Navigation } from './Navigation'
import tailwind from 'tailwind-rn'

class Controls extends Component {

    constructor(props) {
        super(props)
        this.state = {
            nothing: null
        }
    }

    mapsRef = React.createRef()

    triggerMaps = () => {
        this.mapsRef.current.didMapsTriggerOnSearch()
    }

    didTriggerRefresh = () => {
        this.mapsRef.current.didMapsTriggerOnRefresh()
    }

    didTriggerReloadLocation = () => {
        this.props.triggerReloadLocation()
    }

    didTriggerFavourites = () => {
        this.props.triggerFavouritesList()
    }


    render() {
        return (
            <View style={tailwind('h-3/6 bg-white px-4 mb-4 mt-4')}>
                <View style={externalStyle.controlsCard}>
                    <Header states = {this.props.states} triggerMapsOnSearch={this.triggerMaps} triggerIndexOnSearch={this.props.triggerIndexOnSearch} />
                    <Map states = {this.props.states} ref={this.mapsRef} triggerCentreOnRefresh={this.props.triggerCentreOnRefresh} />
                    <Navigation states = {this.props.states} triggerFavourites={this.didTriggerFavourites} triggerRefresh={this.didTriggerReloadLocation}/>
                </View>
            </View>
        )
    }
}

export default Controls