import React, { Component } from 'react'
import { FlatList, StyleSheet, Text, View, Alert } from 'react-native'
import tailwind from 'tailwind-rn'
import Geolocation from '@react-native-community/geolocation'
import axios from 'axios'
import Accordion from './Accordion'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Spinner from 'react-native-spinkit'

class ListView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      latitude: this.props.states.latitude,
      longitude: this.props.states.longitude,
      userProximity: false,
      isLoading: false,
      busStops: this.props.states.busStops,
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
            .post("https://mybusfeed.herokuapp.com/location/returnBusStopInformation/",
            {
                "busStops": favouriteBusStopsList
            })
            .then((response) => {
                // console.log(response.data)
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

    // Get user current location, Return list of bus stops around user proximity according to their geolocation
    getGeoLocation() {
        this.props.resetAccordion()
        Geolocation.getCurrentPosition((info) => {
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

            this.getProximityBusStops()
            this.props.resetSearchState()
        }, (error) => console.log('position error!!!', error),
        {enableHighAccuracy: Platform.OS !== 'android', timeout: 20000, maximumAge: 0})
    }

    //  Return list of bus stops around user proximity according to their geolocation
    getProximityBusStops() {
        this.props.states.busStops = []
        console.log("========================")
        console.log('Getting data from Location Service API!!')
        console.log("========================")
        const fetchURL = "https://mybusfeed.herokuapp.com/location/getListOfBusStop/".concat(this.state.latitude, "-", this.state.longitude)
        axios
        .get(fetchURL)
        .then((response) => {
            // console.log("Fetched API data: " + JSON.stringify(response.data))

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
            Alert.alert(
                'No internet connection',
                'Please check if you\'re connected to the internet.',
                [
                    { text: 'OK'}
                ],
                { cancelable: false }
            )
        })
    }

    // Alternative display when there are no bus stop around user proximity
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
                <Accordion title={item} data={this.props.states}/>
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
                        <Text style={tailwind('text-gray-500 text-3xl text-center py-5')} size={60}>😔</Text>
                        <Text style={tailwind('text-gray-500 text-lg text-center')}>{item.message}</Text>
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
                    <Accordion title={item} data={this.props.states}/>
                )}
                keyExtractor={(item) => item.busstop_number}
                />
            }
        }

        return (
        <View style={this.props.states.theme == 'dark' ? tailwind('h-1/2 bg-black px-2 pb-8'):  tailwind('h-1/2 bg-white px-2 pb-8')}>
            {this.props.states.isLoading ? null : this.isUpdated ? this.state.flatList : flatList}
            <View style={styles.container}>
                <Spinner isVisible={this.props.states.isLoading} size={50} type={'ThreeBounce'} color={'#69a197'}/>
                <Text style={this.props.states.theme == 'dark' ? tailwind('text-gray-300') : tailwind('text-gray-800')}>{this.props.states.isLoading ? "Loading" : ""}</Text>
            </View>
        </View>
        )
    }
}

var styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
})

export default ListView
