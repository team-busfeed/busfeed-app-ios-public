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
    Modal,
    StyleSheet,
    Pressable,
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

import PushNotificationIOS from '@react-native-community/push-notification-ios';

import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';


const TIME_FORMAT = 'MM/DD/YYYY HH:mm:ss'

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
        BLEState: true,
        uuid: 'fda50693-a4e2-4fb1-afcf-c6eb07647825',
        identifier: 'iBeacon',
        major: 1,
        minor: 1,
        foundBeacon: false,
        bustop: null,
        notificationPushed: false,
        BLEstarted: false,
        beaconStart: false,
        tutorialState: 0,
        modalVisible: false,
    }
  }

    // Push notification configuration
    configurePushNotification() {
        PushNotification.configure({
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },
            popInitialNotification: true,
            requestPermissions: Platform.OS === 'ios'
        })
    }

    // Get user current location, call function to set list of bus stops around user proximity
    getGeoLocation() {
        Geolocation.getCurrentPosition(
        (info) => {

            this.setState({
            latitude: info.coords.latitude,
            longitude: info.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
            updatedGeolocation: true,
            })

            this.getProximityBusStops()

        },
        (error) => console.log('position error!!!', error),
            {
                enableHighAccuracy: Platform.OS !== 'android', //set to true if android emulator have location issues
                timeout: 20000,
                maximumAge: 0,
            },
        )
    }

    // Re-fetch and update user current location
    refreshGeoLocation() {
        Geolocation.getCurrentPosition(
        (info) => {

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

    //  Return list of bus stops around user proximity according to their geolocation
    getProximityBusStops() {
        const fetchURL = 'https://api.mybusfeed.com/location/getListOfBusStopNo/'.concat(
        this.state.latitude,
        '-',
        this.state.longitude,
        )
        axios
        .get(fetchURL)
        .then((response) => {
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

        // Start background timer for IOS
        if (Platform.OS =="ios") {
            BackgroundTimer.start();
        }

        // Get user current location, call function to set list of bus stops around user proximity
        this.getGeoLocation()

        // Get user mobile id
        var uniqueId = DeviceInfo.getUniqueId()
        this.setState({
            appID: uniqueId,
        })

        // Retrieve user favourite bus stops
        const value = await AsyncStorage.getItem('@favouriteBusStops')
        if (value === null) {
            // value previously stored
            initialSetup = JSON.stringify({ favourites: [] })
            await AsyncStorage.setItem('@favouriteBusStops', initialSetup)
        } else {
            await AsyncStorage.setItem('@favouriteBusStops', value)
        }

        const didNotLaunchBefore = await AsyncStorage.getItem('@firstLaunch')
        if (didNotLaunchBefore === null) {
            // value previously stored
            await AsyncStorage.setItem('@firstLaunch', "true")
            this.setState({modalVisible: true})
        }

        // Start iBeacon detecting logic
        if (Platform.OS === 'android') {
            Beacons.detectIBeacons()
        } else {
            Beacons.requestWhenInUseAuthorization()
        }
        this.configurePushNotification();

        BackgroundGeolocation.checkStatus(status => {
      
            // you don't need to check status before start (this is just the example)
            if (!status.isRunning) {
              BackgroundGeolocation.start(); //triggers start on start event
            }
          });

        BackgroundGeolocation.on('background', () => {
            console.log('[INFO] App is in background index');
        });

        BackgroundGeolocation.on('foreground', () => {
            console.log('[INFO] App is in foreground');
        });

        BackgroundGeolocation.on('start', () => {
            // service started successfully
            // you should adjust your app UI for example change switch element to indicate
            // that service is running
            console.log('[DEBUG] BackgroundGeolocation has been started');
        });

        this.startDetection()
    }

    // iBeacon BLE detecting logic; Detect any surround BLE
    startDetection() {
        console.log('====================================')
        console.log('BLEreader started')
        console.log('====================================')

        if (!this.state.BLEstarted){
            if (this.state.foundBeacon) {
                this.startMonitoringBeacon()
            } else {
                this.startRanging()
            }

            this.setState({
                BLEstarted: true
            })
        }

        return null
    }

    // Request permission - Deprecated
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

    // iBeacon BLE monitoring logic; Adds a listener to track user within the BLE range;
    startMonitoringBeacon() {
        const regionToMonitor = ({ identifier, uuid, major, minor } = this.state)

        Beacons.startMonitoringForRegion(regionToMonitor)
        .then(() => console.log('Beacons monitoring started succesfully'))
        .catch((error) =>
            console.log(`Beacons monitoring not started, error: ${error}`),
        )

        Beacons.BeaconsEventEmitter.addListener(
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

            console.log('====================================');
            console.log("notificationPushed - AFter => " + this.state.notificationPushed);
            console.log('====================================');
            this.setState({ 
                foundBeacon: false,
                notificationPushed: false,
            })
            this.startRanging();
        },
        )
    }

    // iBeacon BLE monitoring logic; Adds a listener to track user within the BLE range; Check if iBeacon detected is valid and user is within BLE range
    startRanging() {
        const regionToRange = ({ identifier, uuid } = this.state)

        if (Platform.OS !== 'android') {
            Beacons.requestWhenInUseAuthorization()
        }
        // Range beacons inside the region
        Beacons.startRangingBeaconsInRegion(regionToRange)
        .then(() => console.log('Beacons ranging started succesfully'))
        .catch((error) =>
            console.log(`Beacons ranging not started, error: ${error}`),
        )

        if (Platform.OS !== 'android') {
            Beacons.startUpdatingLocation()
        }

        Beacons.BeaconsEventEmitter.addListener('beaconsDidRange', (data) => {
        // console.log('foundBeacon => ' + this.state.foundBeacon)
        // console.log('beaconsDidRange data: ', data)
        if (data.beacons.length > 0 ){
            // Run a for loop based on scan output - data.beacons
            for (var i = 0; i < data.beacons.length; i++){
                var tempUUID = data.beacons[i].uuid
                var tempdist = data.beacons[i].distance
                var beaconMajor = data.beacons[i].major
                var beaconMinor = data.beacons[i].minor

                var truncatedTempUUID = tempUUID.replace(/-/g, "")
                var url = "https://api.mybusfeed.com/beacon/getBeaconStatus/" + truncatedTempUUID

                // Make a request for a user with a given ID
                axios.get('https://api.mybusfeed.com/beacon/getBeaconStatus/' + truncatedTempUUID)
                .then( (res) => {
                    // handle success
                    console.log('====================================');
                    console.log("res.data " + res.data.BeaconRange)
                    console.log('====================================');

                    // Check that is it not empty
                    if (res.data.Status != "Failed"){
                        // Take the Beacon Range - data.beacons[i].distance < beaconRange
                        if (tempdist < res.data.BeaconRange){

                            // Set bus stop into global
                            this.setState({
                                bustop: res.data.BusStop_num,
                                major: beaconMajor,
                                minor: beaconMinor,
                                foundBeacon: true,
                            })

                            this.pushNoti()

                            Beacons.stopRangingBeaconsInRegion(regionToRange)
                            .then(() => console.log('Beacons ranging stopped succesfully'))
                            .catch((error) =>
                                console.log(`Beacons ranging not stopped, error: ${error}`),
                            )
                            this.startMonitoringBeacon()
                        }
                    }
                })
                .catch( (error) => {
                    console.log("BLE Error" + error);
                })
            }
        }
        })
    }

    // Push notification to user (Maximum 1 notification per app launch)
    pushNoti() {
        if (this.state.foundBeacon && !this.state.notificationPushed ) {
            if (Platform.OS !== 'android') {
                
                PushNotificationIOS.presentLocalNotification({
                    alertTitle: 'Bus stop detected!',
                    alertBody: 'You are near a bus stop ' +
                        this.state.bustop +
                    ', check for your bus timing!',
                });

            } else {
                PushNotification.localNotification({
                    title: 'Bus stop detected!',
                    message:
                    'You are near a bus stop ' +
                    this.state.bustop +
                    ', check for your bus timing!',
                })
            }

            this.setState({
                notificationPushed: true
            })
        }

        const { bustop } = this.state
        this.setState({
            beaconStart: true
        })
    }

    componentWillUnMount() {
        console.log('UNMOUNT BEGIN XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
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
        Beacons.BeaconsEventEmitter.removeListener('beaconsDidRange')
        // remove beacons events we registered at componentDidMount
        Beacons.BeaconsEventEmitter.removeListener('regionDidEnter')
        Beacons.BeaconsEventEmitter.removeListener('regionDidExit')

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

    setFirstLaunchFalse = async () => {
        await AsyncStorage.setItem('@firstLaunch', "false")
    }

    // Maintain modal state
    setModalVisible = () => {
        this.setState({modalVisible: true})
    }

    render() {

        // set tutorial title here
        titles = ["About MyBusFeed 😍"]

        // set tutorial content here
        content = ["MyBusFeed is an application that tells you when your next bus will arrive at any bus stop in Singapore using the data provided from Land Transport Authority (LTA)’s Datamall*.\n\n\
The application is developed with your experience in mind. Additionally, we aim to transform your inputs into crowdsourced analytics in a non-intrusive manner. The additional steps that require you to click on multiple buses to check for bus arrival timings is a form of data crowdsourcing to measure the demand for each bus.\n\n\
Your inputs will provide valuable insights for us to better plan bus dispatch frequencies to serve you better.\n\nPlease be aware that this application requires an internet connection, with bluetooth enabled, and location services set to “always allowed” for full functionality."]

        aboutUs = <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.modalVisible}
        onRequestClose={() => {
            Alert.alert("Modal has been closed.")
            this.setState({modalVisible: false})
            this.setFirstLaunchFalse()
        }}
        >
            <View style={tailwind("my-10"), styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={tailwind("text-xl font-semibold text-blue-600 pt-5")}>{titles[this.state.tutorialState]}</Text>
                    <Text style={tailwind("text-xs text-gray-600 my-5 text-justify")}>{content[this.state.tutorialState]}</Text>
                    <Text style={tailwind("text-xs text-gray-600 mb-5 italic text-justify")}>*LTA occassionally does maintenance which might return no results to bus timings.</Text>
                    <View style={tailwind("flex")}>
                        <Pressable
                            style={tailwind("bg-blue-600 py-2 px-5 rounded-lg mt-2 mb-5")}
                            onPress={() => {

                                if (this.state.tutorialState == titles.length - 1) {
                                    this.setState({modalVisible: false})
                                }
                            }}
                        >
                            <Text style={tailwind("rounded-xl text-white text-center px-5 py-2")}>{this.state.tutorialState == titles.length - 1 ? "Done" : "Next"}</Text>
                        </Pressable>
                        <Pressable
                            style={this.state.tutorialState == titles.length - 1 ? tailwind("hidden") : tailwind("bg-gray-900 py-2 px-5 rounded-lg")}
                            onPress={() => this.setState({modalVisible: false})}
                        >
                            <Text style={tailwind("rounded-xl text-white text-center")}>Skip Overview</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
        
        return (
        <View style={tailwind('bg-white h-full')}>
            {/* {this.state.BLEState && <BLEreader />} */}
            {aboutUs}
            <Controls
            states={this.state}
            ref={this.controlsRef}
            resetLocation={this.resetLocation}
            triggerFavouritesList={this.didTapOnFavourites}
            triggerIndexOnSearch={this.didPerformSearch}
            triggerReloadLocation={this.triggerReloadLocation}
            setModalVisible={this.setModalVisible}
            />
            <ListView
            states={this.state}
            ref={this.listViewRef}
            resetSearchState={this.resetSearchState}
            reloadMaps={this.reloadMaps}
            updateMaps={this.reloadMaps}
            triggerCentreOnRefresh={this.centreOnRefresh}
            foundBeacon = {this.state.foundBeacon}
            beaconStart = {this.state.beaconStart}
            />
        </View>
        )
    }
}

const styles = StyleSheet.create({
    centeredView: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: "35%",
        height: "100%"
    },
    modalView: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#888",
        shadowOffset: {
            width: 0,
            height: -8
        },
        shadowOpacity: 0.35,
        shadowRadius: 4,
        elevation: 5
    },
})

export default HomeContainer
