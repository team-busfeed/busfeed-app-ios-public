import React, { Component } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import externalStyle from '../../../style/externalStyle'
import tailwind from 'tailwind-rn'
import Icon from 'react-native-vector-icons/Entypo'
import Geolocation from '@react-native-community/geolocation'
import axios from 'axios'
import Accordion from './Accordion'

class ListView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      latitude: this.props.states.latitude,
      longitude: this.props.states.longitude,
      userProximity: false,
      isLoading: false,
      busStops: this.props.states.busStops
    }
  }

    getGeoLocation() {
        Geolocation.getCurrentPosition((info) => {
            console.log("========================")
            console.log("Got current geolocation!")
            console.log("========================")
            this.setState({
                latitude: info.coords.latitude,
                longitude: info.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
                updatedGeolocation: true,
            })

            console.log("LAT:" + info.coords.latitude)
            console.log("LONG:" + info.coords.longitude)
            console.log(this.state.updatedGeolocation ? "Updated to real-time geolocation values!" : "Using default geolocation values")


            this.getProximityBusStops()
        }, (error) => console.log('position error!!!', error),
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 0})
    }

    getProximityBusStops() {
        this.props.states.busStops = []
        console.log("========================")
        console.log('Getting data from Location Service API!!')
        console.log("========================")
        const fetchURL = "https://api.mybusfeed.com/location/getListOfBusStopNo/".concat(this.state.latitude, "-", this.state.longitude)
        axios
        .get(fetchURL)
        .then((response) => {
            console.log("Fetched API data: " + JSON.stringify(response.data))

            if (response.data.status === "not_found") {
                this.props.states.busStops = []
                this.setState({
                    isLoading: false
                })
            } else {
                this.props.states.busStops = response.data
                this.setState({
                    isLoading: false
                })
            }
        })
        .catch((error) => {
            console.log('error:', error)
        })
    }


    render() {
        flatList = null
        
        if (this.props.states.isLoading) {
            loading = 
            <View style={tailwind('px-4 my-4')}>
                <Text style={tailwind('text-lg text-center')}>Loading data...</Text>
            </View>
        } else {

            if (this.props.states.busStops.length == 0) {
                localVarBusStops = [{"type": "-1", "message": "No nearby bus stops."}]
                flatList = <FlatList
                data={localVarBusStops}
                onRefresh={() => this.getGeoLocation()}
                refreshing={this.state.isLoading}
                renderItem={({ item }) => (
                    <View style={tailwind('px-4 my-4')}>
                        <Text style={tailwind('text-lg text-center')}>{item.message}</Text>
                    </View>
                )}
                keyExtractor={(item) => item.type}
                />
            } else {
                flatList = <FlatList
                data={this.props.states.busStops}
                onRefresh={() => this.getGeoLocation()}
                refreshing={this.state.isLoading}
                renderItem={({ item }) => (
                    <Accordion title={item} data={item} />
                )}
                keyExtractor={(item) => item.busstop_number}
                />
            }
        }

        return (
        <View style={tailwind('h-64 bg-white px-2 pb-7')}>
            {flatList}
        </View>
        )
    }
}

export default ListView
