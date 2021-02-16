import React, { Component } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import externalStyle from '../../../style/externalStyle'
import tailwind from 'tailwind-rn'
import Icon from 'react-native-vector-icons/Entypo'
import Geolocation from '@react-native-community/geolocation'
import axios from 'axios'
import Accordion from './Accordion'
import AsyncStorage from '@react-native-async-storage/async-storage'

class ListView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      latitude: this.props.states.latitude,
      longitude: this.props.states.longitude,
      userProximity: false,
      isLoading: false,
      busStops: this.props.states.busStops,
      busTrackCount: 0,
      isUpdated: false
    }
  }

    didTriggerSearch() {
        this.props.states.isLoading = false
        this.setState({
            isUpdated: true
        })
    }

    didTriggerFavourites = async () => {
        favouriteInStores = await AsyncStorage.getItem('@favouriteBusStops')
        favouriteBusStopsList = JSON.parse(favouriteInStores).favourites

        if (favouriteBusStopsList.length != 0) {
            axios
            .post("https://api.mybusfeed.com/location/returnBusStopInformation/",
            {
                "busStops": favouriteBusStopsList
            })
            .then((response) => {
                console.log(response.data)
                this.props.states.busStops = response.data
                this.updateFlatList()
                this.props.updateMaps()
            }).catch((error) => {
                console.log(error)
            })
        }

        this.props.states.isLoading = false
        this.setState({
            isUpdated: true
        })
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

            this.props.states.isLoading = false

            console.log("LAT:" + info.coords.latitude)
            console.log("LONG:" + info.coords.longitude)
            console.log(this.state.updatedGeolocation ? "Updated to real-time geolocation values!" : "Using default geolocation values")

            this.getProximityBusStops()
        }, (error) => console.log('position error!!!', error),
        {enableHighAccuracy: Platform.OS !== 'android', timeout: 20000, maximumAge: 0})
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

            this.props.states.selected = 0
            this.props.triggerCentreOnRefresh()

            this.props.reloadMaps()
        })
        .catch((error) => {
            console.log('error:', error)
        })
    }

    busTrackCountFunction = () => {
        var count = this.state.busTrackCount
        var count2 = count + 1
        this.setState({
            busTrackCount: count2
        })
        console.log('====================================');
        console.log("busTrackCount => " + this.state.busTrackCount);
        console.log('====================================');
    }

    updateFlatList() {
        if (this.props.states.busStops.length == 0) {
            localVarBusStops = [{"type": "-1", "message": "Nothing to display here..."}]
            flatList = <FlatList
            data={localVarBusStops}
            onRefresh={() => this.getGeoLocation()}
            key={this.props.states.busStops}
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
            key={this.props.states.busStops}
            onRefresh={() => this.getGeoLocation()}
            refreshing={this.state.isLoading}
            renderItem={({ item }) => (
                <Accordion title={item} data={this.props.states} busTrackCountFunction={this.busTrackCountFunction} busTrackCount={this.state.busTrackCount}/>
            )}
            keyExtractor={(item) => item.busstop_number}
            />
        }

        this.setState({
            flatList: flatList
        })
    }


    render() {
        flatList = null
        
        if (this.props.states.isLoading) {
        } else {

            if (this.props.states.busStops.length == 0) {
                localVarBusStops = [{"type": "-1", "message": "Nothing to display here..."}]
                flatList = <FlatList
                data={localVarBusStops}
                onRefresh={() => this.getGeoLocation()}
                key={this.props.states.busStops}
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
                key={this.props.states.busStops}
                onRefresh={() => this.getGeoLocation()}
                refreshing={this.state.isLoading}
                renderItem={({ item }) => (
                    <Accordion title={item} data={this.props.states} busTrackCountFunction={this.busTrackCountFunction} busTrackCount={this.state.busTrackCount}/>
                )}
                keyExtractor={(item) => item.busstop_number}
                />
            }
        }

        return (
        <View style={tailwind('h-1/2 bg-white px-2 pb-8')}>
            {this.isUpdated ? this.state.flatList : flatList}
        </View>
        )
    }
}

export default ListView
