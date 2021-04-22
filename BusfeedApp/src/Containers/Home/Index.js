import React, { useState, Component } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    View,
    Text,
    Alert,
    Modal,
    StyleSheet,
    Pressable,
    Appearance,
    useColorScheme,
    Button
} from 'react-native'
import { Controls } from '@/Components/Controls'
import { ListView } from '@/Components/ListView'
import tailwind from 'tailwind-rn'
import Geolocation from '@react-native-community/geolocation'
import axios from 'axios'
import { useTheme } from '@react-navigation/native'

import AsyncStorage from '@react-native-async-storage/async-storage'

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
            bustop: null,
            tutorialState: 0,
            modalVisible: false,
            theme: Appearance.getColorScheme(),
        }
    }
    componentWillUnmount() {
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = (state,callback)=>{
            return
        }
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
        const fetchURL = 'https://mybusfeed.herokuapp.com/location/getListOfBusStop/'.concat(this.state.latitude,'-',this.state.longitude)
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

        // Get user current location, call function to set list of bus stops around user proximity
        this.getGeoLocation()

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
        this.setState({
            isLoading: true,
            busStops: [],
        })
        this.listViewRef.current.getGeoLocation()
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
        this.controlsRef.current.triggerMarkerReload()
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

    resetAccordion = () => {

        this.setState({
            busStops: [],
            isLoading: true,
        })
    }

    resetAppearance = () => {
        this.setState({
            theme: this.props.theme
        })
        this.resetLocation()
    }

    render() {
        // set tutorial title here
        titles = ["About Busfeed 😍"]


        // set tutorial content here
        content = ["Busfeed tells you when your next bus will arrive at any bus stop in Singapore using the data provided from Land Transport Authority (LTA)’s Datamall*.\n\n\
Busfeed is an offshoot application from MyBusFeed of Project Busfeed."]

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
            <View style={tailwind("bottom-0"), styles.centeredView}>
                <View style={tailwind("pt-10"), this.props.theme == 'dark' ? styles.modalViewDark : styles.modalView}>
                    <Text style={this.props.theme == 'dark' ? tailwind("text-xl font-semibold text-blue-600 pt-5") : tailwind("text-xl font-semibold text-blue-600 pt-5")}>{titles[this.state.tutorialState]}</Text>
                    <Text style={this.props.theme == 'dark' ? tailwind("text-xs text-gray-200 my-5 text-justify") : tailwind("text-xs text-gray-600 my-5 text-justify")}>{content[this.state.tutorialState]}</Text>
                    <Text style={this.props.theme == 'dark' ? tailwind("text-xs text-gray-200 mb-5 italic text-justify") : tailwind("text-xs text-gray-600 mb-5 italic text-justify")}>*LTA occassionally does maintenance which might return no results to bus timings. {'\n\n\n\n\n\n\n\n\n\n\n'}</Text>
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
        // 
        return (
        <View style={this.props.theme == 'dark' ? tailwind('bg-black h-full') : tailwind('bg-white h-full')}>
            {aboutUs}
            <Controls
            states={this.state}
            ref={this.controlsRef}
            resetLocation={this.resetLocation}
            triggerFavouritesList={this.didTapOnFavourites}
            triggerIndexOnSearch={this.didPerformSearch}
            triggerReloadLocation={this.triggerReloadLocation}
            setModalVisible={this.setModalVisible}
            resetAccordion={this.resetAccordion}
            theme={this.props.theme}
            />
            <ListView
            states={this.state}
            ref={this.listViewRef}
            resetSearchState={this.resetSearchState}
            reloadMaps={this.reloadMaps}
            updateMaps={this.reloadMaps}
            triggerCentreOnRefresh={this.centreOnRefresh}
            resetAccordion={this.resetAccordion}
            theme={this.props.theme}
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
    modalViewDark: {
        backgroundColor: "#222",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#333",
        shadowOffset: {
            width: 0,
            height: -8
        },
        shadowOpacity: 0.35,
        shadowRadius: 4,
        elevation: 5
    },
})

function homeHook(Component) {
    return function WrappedComponent(props) {
        const colourScheme = useColorScheme()
        return <Component ref={this.componentRef} theme={colourScheme}/>
    }
}

export default homeHook(HomeContainer)