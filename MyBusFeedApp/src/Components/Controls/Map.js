import React, { useState, Component } from 'react'
import { View, StyleSheet } from 'react-native'
import MapView from 'react-native-maps'
import tailwind from 'tailwind-rn'

class Map extends Component {
    
    render() {

        return (
            <View>
                <MapView
                    style={tailwind('h-5/6')}
                    region={{
                        latitude: this.props.states.latitude,
                        longitude: this.props.states.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    }}
                />
            </View>
        )
    }
}

export default Map