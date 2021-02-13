import React, { useState, Component } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { View, ActivityIndicator, Text, TextInput, Button } from 'react-native'
import { Controls } from '@/Components/Controls'
import { ListView } from '@/Components/ListView'
import tailwind from 'tailwind-rn'
import Geolocation from '@react-native-community/geolocation'
import axios from 'axios'
import DeviceInfo from 'react-native-device-info'

import AsyncStorage from '@react-native-async-storage/async-storage'


class HomeContainer extends Component {


    constructor(props) {
        super(props)
        this.state = {
            latitude: 1.3521,
            longitude: 103.8198,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
            updatedGeolocation: false,
            isLoading: true,
            busStops: [],
            userProximity: false,
            selected: 0,
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

            this.getProximityBusStops()
            console.log("LAT:" + info.coords.latitude)
            console.log("LONG:" + info.coords.longitude)
            console.log(this.state.updatedGeolocation ? "Updated to real-time geolocation values!" : "Using default geolocation values")
        }, (error) => console.log('position error!!!', error),
        {enableHighAccuracy: Platform.OS !== 'android', timeout: 20000, maximumAge: 0})
    }

    getProximityBusStops() {
        console.log('Getting data from Location Service API')
        const fetchURL = "https://api.mybusfeed.com/location/getListOfBusStopNo/".concat(this.state.latitude,"-",this.state.longitude)
        axios
        .get(fetchURL)
        .then((response) => {
            console.log("Fetched API data: " + JSON.stringify(response.data))

            if (response.data.status === "not_found") {
                this.setState({
                    isLoading: false,
                    busStops: []
                })
            } else {
                this.setState({
                    isLoading: false,
                    busStops: response.data
                })
            }
        })
        .catch((error) => {
            console.log('error:', error)
        })
    }

    componentDidMount = async () => {
        this.getGeoLocation()

        var uniqueId = DeviceInfo.getUniqueId();
        console.log("uniqueId =>" + uniqueId);
        this.setState({
            appID: uniqueId
        })

        const value = await AsyncStorage.getItem('@favouriteBusStops')
        if (value === null) {
            // value previously stored
            initialSetup = JSON.stringify({"favourites": []})
            await AsyncStorage.setItem('@favouriteBusStops', initialSetup)
            console.log(value)
        } else {
            await AsyncStorage.setItem('@favouriteBusStops', value)
        }
    }

    listViewRef = React.createRef()
    controlsRef = React.createRef()

    didPerformSearch = () => {
        this.setState({
            isLoading: true
        })
        this.listViewRef.current.didTriggerSearch()
        this.controlsRef.current.didTriggerRefresh()
    }

    triggerReloadLocation = () => {
        this.listViewRef.current.getGeoLocation()
        this.setState({
            isLoading: true
        })
        this.listViewRef.current.didTriggerSearch()
    }

    centreOnRefresh = () => {
        this.controlsRef.current.didTriggerRefresh()
    }

    didTapOnFavourites = () => {
        this.setState({
            isLoading: true
        })
        this.listViewRef.current.didTriggerFavourites()
        this.controlsRef.current.didTriggerRefresh()
    }

    render() {
        return (
            <View style={tailwind('bg-white h-full')}>
                <Controls states = { this.state } ref={this.controlsRef} triggerFavouritesList={this.didTapOnFavourites} triggerIndexOnSearch={this.didPerformSearch} triggerReloadLocation={this.triggerReloadLocation} />
                <ListView states = { this.state } ref={this.listViewRef} triggerCentreOnRefresh={this.centreOnRefresh}/>
            </View>
        )
    }
}

export default HomeContainer