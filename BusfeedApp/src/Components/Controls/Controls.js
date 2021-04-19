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
    headerRef = React.createRef()

    triggerMaps = () => {
        this.mapsRef.current.didTriggerMarkerReload()
    }

    didTriggerRefresh = () => {
        this.mapsRef.current.didTriggerMarkerReload()
    }

    didTriggerReloadLocation = () => {
        this.props.triggerReloadLocation()
    }

    didTriggerFavourites = () => {
        this.props.triggerFavouritesList()
    }

    triggerMarkerReload = () => {
        this.mapsRef.current.didTriggerMarkerReload()
    }

    centreMap = () => {
        this.props.triggerReloadLocation()
    }

    resetSearchState = () => {
        this.headerRef.current.resetSearchState()
    }

    resetLocation = () => {
        this.props.resetLocation()
    }

    setModalVisible = () => {
        this.props.setModalVisible()
    }


    render() {
        return (
            <View style={tailwind('h-3/6 bg-white px-4 mb-4 mt-4')}>
                <View style={externalStyle.controlsCard}>
                    <Header states = {this.props.states} ref={this.headerRef} setModalVisible={this.setModalVisible} resetLocation={this.resetLocation} triggerCentreOnRefresh={this.centreMap} triggerMapsOnSearch={this.triggerMaps} triggerRefresh={this.didTriggerReloadLocation} triggerIndexOnSearch={this.props.triggerIndexOnSearch} />
                    <Map states = {this.props.states} ref={this.mapsRef} triggerCentreOnRefresh={this.props.triggerCentreOnRefresh} triggerIndexOnSearch={this.props.triggerIndexOnSearch} />
                    <Navigation states = {this.props.states} triggerFavourites={this.didTriggerFavourites} triggerMapsOnSearch={this.triggerMaps} triggerRefresh={this.didTriggerReloadLocation}/>
                </View>
            </View>
        )
    }
}

export default Controls