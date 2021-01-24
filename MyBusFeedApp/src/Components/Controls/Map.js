import React, { useState, Component } from 'react'
import { View, StyleSheet, Text } from 'react-native'
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

        if (this.props.states.isLoading) {
            markers = <Text>Maps loading..</Text>
        } else {
            markers = this.props.states.busStops.map(busStop => 
                <MapView.Marker
                    key={busStop.busstop_number}
                    coordinate={{latitude: busStop.busstop_lat ? Number(busStop.busstop_lat) : 0, longitude: busStop.busstop_lng ? Number(busStop.busstop_lng) : 0}}
                    title={busStop.busstop_name}
                    description={"Stop Number: " + busStop.busstop_number}
                />
            )
        }

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
                    {markers}
                </MapView>
                <View style={styles.nav}>
                    <Navigation style={styles.nav}/>
                </View>
            </View>
        )
    }
}

export default Map