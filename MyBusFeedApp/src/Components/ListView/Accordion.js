import React, { Component } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Button,
  ProgressViewIOSComponent,
  Alert,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import externalStyle from '../../../style/externalStyle'
import axios from 'axios'
import { FlatList } from 'react-native-gesture-handler'
import BusTimeBlock from './BusTimeBlock'
import tailwind from 'tailwind-rn'
import AsyncStorage from '@react-native-async-storage/async-storage'
import BackgroundTimer from 'react-native-background-timer';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

export default class Accordion extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: props.data,
      expanded: false,
      busStops: [],
      newServices: {},
      latitude: props.data.latitude,
      longitude: props.data.longitude,
      favIcon: "favorite-border",
      actualBusStack: [],
      actualBusStackTimer: false,
      busCrowdStatus: {
        "SEA": 1,
        "SDA": 2,
        "LSD": 3
      },
      allBusesDidLeave: false,
    }

    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
  }

  onPressToggle = () => {
    this.toggleExpand()
    this.GetBus()
  }

  // Set accordion toggle state
  toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    this.setState({ expanded: !this.state.expanded })
  }

  callBusAPI = () => {
    Object.keys(services).map((function(key) {
        services[key].getBusTiming()
    }))
  }

  didTapRefresh = () => {
      console.log("This is for async while the data loads...")
  }

  // Fetch the list of bus based on busstop_number given
  GetBus = () => {
    console.log('onPressGetBus API')
    const baseFetchURL = 'https://api.mybusfeed.com/demand/bus-stop/'
    console.log(this.props.title.busstop_number)
    axios
      .get(baseFetchURL.concat(this.props.title.busstop_number))
      .then((response) => {
        console.log("Fetched bus API data: " + JSON.stringify(response.data))

        var comparator = function(a, b) {
            return parseInt(a) - parseInt(b);
        }

        var resp = response.data.services.sort(comparator)

        var loadedServices = {}

        resp.map(function(service) {
            loadedServices[service] = React.createRef()
        })
        this.setState({
            newServices: loadedServices
        })

        this.didTapRefresh = () => Object.keys(loadedServices).forEach(function(key) {
            loadedServices[key].current.refreshBusTiming()
        })

        this.setState({
          // ACTUAL VALUE
          busStops: response.data,

          // HARDCODED VALUE - use when bus services is null
          // busStops: {
          //   services: ['169', '860', '811'],
          // },
        })
        console.log(this.state.busStops)

        if (this.state.busStops.services === null) {
            this.setState({
                allBusesDidLeave: true
            })
        }
      })
      .catch((error) => {
        console.log('error:', error)
      })

    console.log('onPressGetBus API Exit')
  }

  busTrackCountFunction = () => {
    console.log('====================================');
    console.log("busTrackCountFunction accordion");
    console.log('====================================');
    this.props.busTrackCountFunction()
  }

    favouriteThisStop = async (busStopNumber) => {
        try {
            // await AsyncStorage.setItem('@favouriteBusStops', busStopNumber)
            let favouriteInStores = await AsyncStorage.getItem('@favouriteBusStops')
            let favouriteBusStopsList = JSON.parse(favouriteInStores).favourites

            var indexOfFavourite = favouriteBusStopsList.indexOf(busStopNumber)

            if (indexOfFavourite == -1) {
                favouriteBusStopsList.push(busStopNumber)
                console.log("Favourited " + busStopNumber + "!")
                this.setState({favIcon: "favorite"})
                var paddedStopNumber = busStopNumber.length == 4 ? "0" + busStopNumber : busStopNumber
                
                Alert.alert(
                    'Favourite bus stop',
                    'Bus stop ' + paddedStopNumber + ' added to your favourites!',
                    [
                        { text: 'OK'}
                    ],
                    { cancelable: false }
                )
            } else {
                var paddedStopNumber = busStopNumber.length == 4 ? "0" + busStopNumber : busStopNumber
                Alert.alert(
                    'Removing from favourites',
                    'Bus stop ' + paddedStopNumber + ' removed from favourites!',
                    [
                        { text: 'OK'}
                    ],
                    { cancelable: false }
                )
                favouriteBusStopsList.splice(indexOfFavourite, 1)

                this.setState({favIcon: "favorite-border"})
            }

            await AsyncStorage.setItem('@favouriteBusStops', JSON.stringify({"favourites": favouriteBusStopsList}))
            // const value = await AsyncStorage.getItem('@storage_Key')
            // if (value !== null) {
            //     // value previously stored
            //     console.log(value)
            // }
        } catch (e) {
            // saving error
            console.log("Error favouriting bus stop. Debug: " + e)
        }
    }



    async componentDidMount() {
        
        try {
            // AsyncStorage.setItem('@favouriteBusStops', 1012)
            console.log("here")

            console.log(this.props.title.busstop_number)
            let favouriteInStores = await AsyncStorage.getItem('@favouriteBusStops')
            console.log("this is in store " + favouriteInStores)
            let favouriteBusStopsList = JSON.parse(favouriteInStores).favourites
            console.log("THIS IS FAV BUS STOP LIST " + favouriteBusStopsList)

            if (favouriteBusStopsList.indexOf(this.props.title.busstop_number) == -1) {
              console.log("false")
            } else {
              this.setState({favIcon: "favorite"})
              console.log("true")
            }

        } catch (e) {
            console.log ("error : " + e)  
        }

        // if (favouriteBusStopsList.indexOf(busStopNumber) == -1) {
        //   console.log ("fetched")
        // }
    }

    addToActualDemand = (busNumber) => {
      console.log('####################################');
      console.log('addToActualDemand START => ' + busNumber);
      console.log('####################################');
  
      const moment = require("moment")
      console.log("moment => " + moment().utcOffset("+08:00").format("YYYY-MM-DD HH:mm:ss"))
  
      axios
      .post("https://api.mybusfeed.com/demand/actual/add", {
        
        app_id: this.state.data.appID,
        bus_stop_no: this.props.title.busstop_number,
        bus_no: busNumber,
        has_successfully_board: true,
        created_time: moment().utcOffset("+08:00").format("YYYY-MM-DD HH:mm:ss")
      })
      .then((response) => {
        console.log(response.data)
  
        console.log('####################################');
        console.log('addToActualDemand END');
        console.log('####################################');
      })
    }

    actualBusStackFunction = (bus) => {
      console.log('====================================');
      console.log("actualBusStackFunction for => " + bus);
      console.log('====================================');
      if (!this.state.actualBusStack.includes(bus)){
        this.state.actualBusStack.push(bus)
        console.log(this.state.actualBusStack);

        // Start 30s timer
        if (!this.state.actualBusStackTimer){
          this.setState({
            actualBusStackTimer: true
          })

          console.log('====================================');
          console.log("actualBusStackFunction timer start");

          BackgroundTimer.setTimeout(() => {
            var actualBusStack = this.state.actualBusStack
            var leastCrowdBus = actualBusStack[0][0]
            var leastCrowdBusStatus = actualBusStack[0][1]
            for (i = 1; i < actualBusStack.length; i++){
              if ( this.state.busCrowdStatus[actualBusStack[i][1]] < leastCrowdBusStatus ){
                leastCrowdBus = actualBusStack[i][0]
                leastCrowdBusStatus = this.state.busCrowdStatus[actualBusStack[i][1]]
              }
            }

            console.log("leastCrowdBus => " + leastCrowdBus);
            console.log('====================================');

            this.state.actualBusStack = []
            this.addToActualDemand(leastCrowdBus)
          }, 30000); //300000 -> 5 minutes
        }
      }
    }

  render() {

    if (this.state.allBusesDidLeave) {
        var refreshButton = null
        var flatList = <View><Text style={tailwind("font-bold text-gray-500 text-lg text-center")}>All buses had left... 😭</Text></View>
    } else {
        var refreshButton = <TouchableOpacity style={tailwind('flex flex-row')} onPress={() => this.didTapRefresh()}>
        <Text style={tailwind('text-blue-500 font-semibold')}>Refresh all bus timings</Text>
        <Icon
          name={
          'autorenew'
          }
          size={18}
          style={tailwind('text-blue-500')}
        />
      </TouchableOpacity>
        var flatList = <FlatList
        data={this.state.busStops.services}
        renderItem={({ item }) => (
        <BusTimeBlock ref={this.state.newServices[item]} 
            bus_number={item} busstop_number={this.props.title.busstop_number} 
            data={this.state.data} busTrackCountFunction={this.busTrackCountFunction} 
            busTrackCount={this.props.busTrackCount} foundBeacon={this.props.foundBeacon} beaconStart={this.props.beaconStart} actualBusStackFunction={this.actualBusStackFunction} />
            )}
            keyExtractor={(item) => item}
        />
    }

    return (
      <View>
        <TouchableOpacity
          ref={this.accordian}
          style={styles.row}
          onPress={() => this.onPressToggle()}
        >
          <TouchableOpacity style={this.state.favIcon === "favorite-border" ? tailwind("bg-gray-200 px-1 py-1 rounded-lg") : tailwind("bg-gray-100 px-1 py-1 rounded-lg") }>
            <Icon
                // style={tailwind("text-gray-700")}
                name={
                  this.state.favIcon
                }
                size={20}
                // style={{ color: "green[500]" }}
                style={this.state.favIcon === "favorite-border" ? tailwind("text-gray-700") : tailwind("text-red-700")}
                onPress={() => this.favouriteThisStop(this.props.title.busstop_number)}
            />
          </TouchableOpacity>
          <Text style={[styles.title, styles.font]}>
            {this.props.title.busstop_number.length == 4 ? "0" + this.props.title.busstop_number : this.props.title.busstop_number}  –  {this.props.title.busstop_name}
          </Text>
          <Icon
            name={
              this.state.expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
            }
            size={30}
            color="#5E5E5E"
          />
        </TouchableOpacity>
        <View style={styles.parentHr} />
        {this.state.expanded && (
          <View style={styles.child}>
            {refreshButton}

            {flatList}
          </View>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({

  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5E5E5E',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 56,
    paddingLeft: 25,
    paddingRight: 18,
    alignItems: 'center',
    backgroundColor: '#ffffff',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    borderRadius: 10,
    marginTop: 5,
    paddingTop: 12,
    marginBottom: 5,
    paddingBottom: 12,
    marginLeft: 8,
    paddingLeft: 8,
    marginRight: 8,
    paddingRight: 8,
    height: 50,
  },
  parentHr: {
    height: 1,
    color: '#000000',
    width: '100%',
  },
  child: {
    backgroundColor: '#ffffff',
    padding: 16,
  },
})
