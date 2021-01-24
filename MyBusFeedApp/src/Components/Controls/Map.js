import React, { useState, Component } from 'react'
import { View, StyleSheet } from 'react-native'
import MapView from 'react-native-maps'
import { default as Navigation } from './Navigation'
import tailwind from 'tailwind-rn'

const styles = StyleSheet.create({
    nav: {
        marginTop: 20
    },
});
class Map extends Component {
    
    render() {

        return (
            <View>
                <MapView
                    style={tailwind('h-80')}
                    region={{
                        latitude: this.props.states.latitude,
                        longitude: this.props.states.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    }}
                    showsUserLocation={true}
                >
                </MapView>
                    
                <View style={styles.nav}>
                    <Navigation style={styles.nav}/>
                </View>
            </View>
        )
    }
}

export default Map