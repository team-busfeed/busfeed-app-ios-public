import React, { useState, Component } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import MapView, {Marker, Callout} from 'react-native-maps'
import { default as Navigation } from './Navigation'
import tailwind from 'tailwind-rn'
import Icon from 'react-native-vector-icons/FontAwesome';

// import CustomCallout from './CustomCallout'
// import { Icon } from 'react-native-vector-icons/Icon'


const styles = StyleSheet.create({
    nav: {
        marginTop: 20
    },
    callout: {
        backgroundColor: "white",
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
        padding: 10, 
      },
    title: {
        color: "#4F4F4F",
        fontSize: 14,
        lineHeight: 18,
        flex: 1,
        fontWeight: "bold"
    },
    description: {
        color: "#707070",
        fontSize: 12,
        lineHeight: 16,
        flex: 1,
    }

});
class Map extends Component {
    
    render() {

        markers = null

        if (!this.props.states.isLoading) {
            try {
                if (this.props.states.busStops !== undefined) {
                    markers = this.props.states.busStops.map(busStop => 
                        <Marker
                            key={busStop.busstop_number}
                            coordinate={{latitude: busStop.busstop_lat ? Number(busStop.busstop_lat) : 0, longitude: busStop.busstop_lng ? Number(busStop.busstop_lng) : 0}}
                            title={busStop.busstop_name}
                            description={"Stop Number: " + busStop.busstop_number}
                        >
                            <Callout
                            tooltip={true}
                            style={styles.callout}
                            >
                                <View style={tailwind('flex flex-row')}>
                                    <View style={tailwind('w-1/5')}>
                                        <Icon name="bus" size={20} color="black" style={[tailwind("my-2"), styles.image]}/>
                                    </View>
                                    <View style={tailwind('w-4/5')}>
                                        <Text style={styles.title}>
                                            {busStop.busstop_name}
                                        </Text>
                                        <Text style={styles.description}>
                                            {"Stop Number: " + busStop.busstop_number}
                                        </Text>
                                    </View>
                                </View>
                          </Callout>
                        </Marker>
                    )
                }
            } catch (error) {
                markers = null
            }
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