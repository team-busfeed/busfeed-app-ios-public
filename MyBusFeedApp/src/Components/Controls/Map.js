import React, { useState, Component } from 'react'
import { View, StyleSheet } from 'react-native'
import MapView from 'react-native-maps'
import tailwind from 'tailwind-rn'
import Geolocation from '@react-native-community/geolocation'

class Map extends Component {

    constructor(props) {
        super(props)
        this.state = {
            latitude: 1.3521,
            longitude: 103.8198,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
        }
    }
    
    getGeoLocation() {
        Geolocation.getCurrentPosition((info) => {
            this.setState({
                latitude: info.coords.latitude,
                longitude: info.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            })
        })
    }

    componentDidMount() {
        this.getGeoLocation()
    }
    
    render() {

        return (
            <View>
                    <MapView
                        style={tailwind('h-5/6')}
                        region={{
                            latitude: this.state.latitude,
                            longitude: this.state.longitude,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        }}
                    />
            </View>
        )
    }
}

export default Map