import React, { useState, Component } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  View,
  ActivityIndicator,
  Text,
  TextInput,
  Button,
  Alert,
  DeviceEventEmitter,
  PermissionsAndroid,
} from 'react-native'
import { Controls } from '@/Components/Controls'
import { ListView } from '@/Components/ListView'
import tailwind from 'tailwind-rn'
import Geolocation from '@react-native-community/geolocation'
import axios from 'axios'
import DeviceInfo from 'react-native-device-info'

import Beacons from 'react-native-beacons-manager'
import PushNotification from 'react-native-push-notification'
import moment from 'moment'
import BackgroundTimer from 'react-native-background-timer'

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
        BLEState: true,
        uuid: 'fda50693-a4e2-4fb1-afcf-c6eb07647825',
        identifier: 'iBeacon',
        major: 1,
        minor: 1,
        foundBeacon: false,
        bustop: 4121,
    }
  }

    configurePushNotification() {
        PushNotification.configure({
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },
            popInitialNotification: true,
            requestPermissions: true,
        })
    }

    getGeoLocation() {
        Geolocation.getCurrentPosition(
        (info) => {
            console.log('========================')
            console.log('Got current geolocation!')
            console.log('========================')
            this.setState({
            latitude: info.coords.latitude,
            longitude: info.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
            updatedGeolocation: true,
            })

            this.getProximityBusStops()
            console.log('LAT:' + info.coords.latitude)
            console.log('LONG:' + info.coords.longitude)
            console.log(
            this.state.updatedGeolocation
                ? 'Updated to real-time geolocation values!'
                : 'Using default geolocation values',
            )
        },
        (error) => console.log('position error!!!', error),
        {
            enableHighAccuracy: Platform.OS !== 'android',
            timeout: 20000,
            maximumAge: 0,
        },
        )
    }

    refreshGeoLocation() {
        Geolocation.getCurrentPosition(
        (info) => {
            console.log('========================')
            console.log('Got current geolocation!')
            console.log('========================')
            this.setState({
            latitude: info.coords.latitude,
            longitude: info.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
            updatedGeolocation: true,
            })

            console.log('LAT:' + info.coords.latitude)
            console.log('LONG:' + info.coords.longitude)
            console.log(
            this.state.updatedGeolocation
                ? 'Updated to real-time geolocation values!'
                : 'Using default geolocation values',
            )
        },
        (error) => console.log('position error!!!', error),
        {
            enableHighAccuracy: Platform.OS !== 'android',
            timeout: 20000,
            maximumAge: 0,
        },
        )
    }

    getProximityBusStops() {
        console.log('Getting data from Location Service API')
        const fetchURL = 'https://api.mybusfeed.com/location/getListOfBusStopNo/'.concat(
        this.state.latitude,
        '-',
        this.state.longitude,
        )
        axios
        .get(fetchURL)
        .then((response) => {
            console.log('ASD')
            console.log('Fetched API data: ' + JSON.stringify(response.data))

            if (response.data.status === 'not_found') {
            this.setState({
                isLoading: false,
                busStops: [],
            })
            } else {
            this.setState({
                isLoading: false,
                busStops: response.data,
            })
            }
        })
        .catch((error) => {
            console.log('indexjs getProximityBusStops error:', error)
            Alert.alert(
            'No internet connection',
            "Please check if you're connected to the internet.",
            [{ text: 'OK' }],
            { cancelable: false },
            )
        })
    }

    componentDidMount = async () => {
        // if (this.state.BLEState == true){
        //     this.setState({
        //         BLEState: false
        //     })
        // }

        this.getGeoLocation()

        var uniqueId = DeviceInfo.getUniqueId()
        console.log('uniqueId =>' + uniqueId)
        this.setState({
        appID: uniqueId,
        })

        const value = await AsyncStorage.getItem('@favouriteBusStops')
        if (value === null) {
        // value previously stored
        initialSetup = JSON.stringify({ favourites: [] })
        await AsyncStorage.setItem('@favouriteBusStops', initialSetup)
        console.log(value)
        } else {
        await AsyncStorage.setItem('@favouriteBusStops', value)
        }

        if (Platform.OS === 'android') {
        Beacons.detectIBeacons()
        } else {
        Beacons.requestWhenInUseAuthorization()
        }
        //this.configurePushNotification();
        console.log('====================================')
        console.log('BLE componentDidMount')
        console.log('====================================')

        
        this.startDetection()

    }
    startDetection() {
        // BackgroundTimer.setInterval(() => {
        const { foundBeacon } = this.state
        console.log('====================================')
        console.log('BLEreader started')
        console.log('====================================')
        if (foundBeacon) {
            this.startMonitoringBeacon()
        } else {
            this.startRanging()
        }
        // return null

        console.log('====================================')
        console.log('Interval 10000')
        console.log('====================================')

        // }, 10000)
        return null
    }

    async checkPermission() {
        try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
            title: 'Wifi networks',
            message: 'We need your permission in order to find wifi networks',
            },
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Thank you for your permission! :)')
        } else {
            console.log(
            'You will not able to retrieve wifi available networks list',
            )
        }
        } catch (err) {
        console.warn(err)
        }
    }

    startMonitoringBeacon() {
        const regionToMonitor = ({ identifier, uuid, major, minor } = this.state)
        this.doAction(identifier, uuid, minor, major, moment().format(TIME_FORMAT))

        Beacons.startMonitoringForRegion(regionToMonitor)
        .then(() => console.log('Beacons monitoring started succesfully'))
        .catch((error) =>
            console.log(`Beacons monitoring not started, error: ${error}`),
        )

        DeviceEventEmitter.addListener(
        'regionDidExit',
        ({ identifier, uuid, minor, major }) => {
            console.log('Test')
            const time = moment().format(TIME_FORMAT)
            Beacons.stopMonitoringForRegion(regionToMonitor)
            .then(() => console.log('Beacons monitoring stopped succesfully'))
            .catch((error) =>
                console.log(`Beacons monitoring not stopped, error: ${error}`),
            )
            DeviceEventEmitter.removeListener('regionDidEnter')
            console.log('monitoring - regionDidExit data: ', {
            identifier,
            uuid,
            minor,
            major,
            time,
            })
            this.setState({ foundBeacon: false })
        },
        )
    }

    startRanging() {
        const regionToRange = ({ identifier, uuid } = this.state)

        // Range beacons inside the region
        Beacons.startRangingBeaconsInRegion(regionToRange)
        .then(() => console.log('Beacons ranging started succesfully'))
        .catch((error) =>
            console.log(`Beacons ranging not started, error: ${error}`),
        )

        if (Platform.OS !== 'android') {
            Beacons.startUpdatingLocation()
        }

        DeviceEventEmitter.addListener('beaconsDidRange', (data) => {
        console.log('foundBeacon => ' + this.state.foundBeacon)
        console.log('beaconsDidRange data: ', data)
        if (data.beacons.length > 0) {
            const { foundBeacon } = this.state
            const { bustop } = this.state
            if (!foundBeacon) {
            PushNotification.localNotification({
                title: 'BusFeed',
                message:
                'You are near a bus stop ' +
                bustop +
                ', check for your bus timing!',
            })
            }
            Beacons.stopRangingBeaconsInRegion(identifier, uuid)
            .then(() => console.log('Beacons ranging stopped succesfully'))
            .catch((error) =>
                console.log(`Beacons ranging not stopped, error: ${error}`),
            )
            var beacon = this.nearestBeacon(data.beacons)
            console.log('Selected beacon: ', beacon)
            this.setState({
            major: beacon.major,
            minor: beacon.minor,
            foundBeacon: true,
            })
        }
        // console.log('Fk off beacon')
        // Beacons.stopRangingBeaconsInRegion(identifier, uuid)
        // .then(() => console.log('Beacons ranging stopped succesfully'))
        // .catch((error) =>
        //     console.log(`Beacons ranging not stopped, error: ${error}`),
        // )
        // DeviceEventEmitter.removeListener('beaconsDidRange')
        })
    }

    doAction(identifier, uuid, minor, major, time) {
        console.log('GUAN YIN MA BOPI')
        console.log({ identifier, uuid, minor, major, time })
        console.log('Pls WORK')
    }

    nearestBeacon(beacons) {
        console.log('beacons', beacons)
        var i
        var minDistIndex = 0
        var minDist = Number.MAX_VALUE
        for (i = 0; i < beacons.length; i++) {
        if (beacons[i].distance < minDist) {
            minDist = beacons[i].distance
            minDistIndex = i
        }
        }
        return beacons[minDistIndex]
    }

    componentWillUnMount() {
        console.log('UNMOUNT  BEGIN XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
        const { uuid, identifier } = this.state
        const region = { identifier, uuid }

        // stop ranging beacons:
        Beacons.stopRangingBeaconsInRegion(identifier, uuid)
        .then(() => console.log('Beacons ranging stopped succesfully'))
        .catch((error) =>
            console.log(`Beacons ranging not stopped, error: ${error}`),
        )

        // stop monitoring beacons:
        Beacons.stopMonitoringForRegion(region)
        .then(() => console.log('Beacons monitoring stopped succesfully'))
        .catch((error) =>
            console.log(`Beacons monitoring not stopped, error: ${error}`),
        )

        // remove ranging event we registered at componentDidMount
        DeviceEventEmitter.removeListener('beaconsDidRange')
        // remove beacons events we registered at componentDidMount
        DeviceEventEmitter.removeListener('regionDidEnter')
        DeviceEventEmitter.removeListener('regionDidExit')

        console.log('UNMOUNT  END XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
    }

    listViewRef = React.createRef()
    controlsRef = React.createRef()

    didPerformSearch = () => {
        this.setState({
        isLoading: true,
        })
        this.listViewRef.current.didTriggerSearch()
        this.controlsRef.current.didTriggerRefresh()
    }

    triggerReloadLocation = () => {
        this.listViewRef.current.getGeoLocation()
        this.setState({
        isLoading: true,
        })
        this.listViewRef.current.didTriggerSearch()
    }

    centreOnRefresh = () => {
        this.controlsRef.current.didTriggerRefresh()
    }

    didTapOnFavourites = () => {
        this.setState({
        isLoading: true,
        })
        // trigger listview
        this.listViewRef.current.didTriggerFavourites()
        // trigger controls
        this.controlsRef.current.didTriggerRefresh()
    }

    reloadMaps = () => {
        this.refreshGeoLocation()
        this.controlsRef.current.triggerFavouritesMarkers()
    }

    resetSearchState = () => {
        this.controlsRef.current.resetSearchState()
    }

    resetLocation = () => {
        this.listViewRef.current.getGeoLocation()
    }

    render() {
        return (
        <View style={tailwind('bg-white h-full')}>
            {/* {this.state.BLEState && <BLEreader />} */}
            <Controls
            states={this.state}
            ref={this.controlsRef}
            resetLocation={this.resetLocation}
            triggerFavouritesList={this.didTapOnFavourites}
            triggerIndexOnSearch={this.didPerformSearch}
            triggerReloadLocation={this.triggerReloadLocation}
            />
            <ListView
            states={this.state}
            ref={this.listViewRef}
            resetSearchState={this.resetSearchState}
            reloadMaps={this.reloadMaps}
            updateMaps={this.reloadMaps}
            triggerCentreOnRefresh={this.centreOnRefresh}
            />
        </View>
        )
    }
    }

export default HomeContainer
