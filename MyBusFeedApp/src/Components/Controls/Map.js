import React, { useState, Component } from 'react'
import { View, StyleSheet, Text, TouchableNativeFeedbackBase } from 'react-native'
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
        flex: 1, 
        position: "relative", 
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

    constructor(props) {
        super(props)
        this.state = {
            markers: null,
            isUpdated: false
        }
    }

    didMapsTriggerOnSearch() {
        this.setState({
            isUpdated: true
        })
        this.refreshMarker()
    }

    didMapsTriggerOnRefresh() {
        this.setState({
            isUpdated: true
        })
        this.refreshMarker()
    }

    refreshMarker() {

        markers = null

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
                            <View style={tailwind('flex flex-row justify-center items-center')}>
                                <View style={tailwind("w-10")}>
                                    <Icon name="bus" size={30} color="black" style={[tailwind("flex"), styles.image]}/>
                                </View>
                                <View>
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
            console.log(error)
            markers = null
        }


        this.setState({
            isUpdated: true,
            markers: markers
        })
    }

    refreshLocation = () => {
        this.map.animateToRegion({
            latitude: this.props.states.latitude,
            longitude: this.props.states.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        })
    }

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
                                <View style={tailwind('flex flex-row justify-center items-center')}>
                                    <View style={tailwind("w-10")}>
                                        <Icon name="bus" size={30} color="black" style={[tailwind("flex"), styles.image]}/>
                                    </View>
                                    <View>
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
                    style={tailwind('h-4/5')}
                    region={{
                        latitude: this.props.states.latitude,
                        longitude: this.props.states.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    }}
                    showsUserLocation={true}
                    followsUserLocation={true}
                    showsMyLocationButton={true}
                    ref={map => {this.map = map}}
                >
                    {this.state.isUpdated ? this.state.markers : markers}
                </MapView>
                <View style={styles.nav}>
                    <Navigation style={[tailwind('h-1/5'), styles.nav]}/>
                </View>
            </View>
        )
    }
}

export default Map