import React, { Component } from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import axios from 'axios'
import { FlatList } from 'react-native-gesture-handler'
import BusTimeBlock from './BusTimeBlock'
import tailwind from 'tailwind-rn'
import AsyncStorage from '@react-native-async-storage/async-storage'


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
      allBusesDidLeave: false,
      theme: props.theme,
    }

    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
  }

  // Execute functions when user press the component
  onPressToggle = () => {
    this.toggleExpand()
    this.GetBus()
  }

  // Set bust stop list (accordion) toggle state
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
    const baseFetchURL = 'https://mybusfeed.herokuapp.com/demand/bus-stop/'

    // Retrieve all bus number for a bus stop
    axios
      .get(baseFetchURL.concat(this.props.title.busstop_number))
      .then((response) => {

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
          busStops: response.data,
        })

        if (this.state.busStops.services === null) {
            this.setState({
                allBusesDidLeave: true
            })
        }
      })
      .catch((error) => {
        console.log('error:', error)
        this.setState({
            allBusesDidLeave: true
        })
      })

    console.log('onPressGetBus API Exit')
  }

  // Function to add busstop to favourite storage
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

      // console.log(this.props.title.busstop_number)
      let favouriteInStores = await AsyncStorage.getItem('@favouriteBusStops')
      // console.log("this is in store " + favouriteInStores)
      let favouriteBusStopsList = JSON.parse(favouriteInStores).favourites
      // console.log("THIS IS FAV BUS STOP LIST " + favouriteBusStopsList)

      if (favouriteBusStopsList.indexOf(this.props.title.busstop_number) == -1) {
        // console.log("false")
      } else {
        this.setState({favIcon: "favorite"})
        // console.log("true")
      }

    } catch (e) {
      // console.log ("error : " + e)  
    }
  }

  // To hold busses, that arrives at similar timing, in an temp array to determine which bus user has left with & add to actual demand count accordingly
  // Assumption - user will leave the with the least crowded bus; if crowd level is the same, user will leave with the first bus.
  // @param - bus number

  render() {
      

    if (this.state.allBusesDidLeave) {
        var refreshButton = null
        var flatList = <View><Text style={tailwind("font-bold text-gray-500 text-lg text-center")}>No buses left to display... 😭</Text></View>
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
            data={this.state.data}
            theme={this.props.theme}
            />
            )}
            keyExtractor={(item) => item}
        />
    }

    return (
      <View>
        <TouchableOpacity
          ref={this.accordian}
          style={this.props.theme == 'dark' ? styles.rowDark : styles.row}
          onPress={() => this.onPressToggle()}
        >
          <TouchableOpacity style={
              this.props.theme == 'dark' ? 
              this.state.favIcon === "favorite-border" ? tailwind("bg-gray-600 px-1 py-1 rounded-lg") : tailwind("bg-gray-700 px-1 py-1 rounded-lg")
              : this.state.favIcon === "favorite-border" ? tailwind("bg-gray-200 px-1 py-1 rounded-lg") : tailwind("bg-gray-100 px-1 py-1 rounded-lg") 
              }>
            <Icon
                // style={tailwind("text-gray-700")}
                name={
                  this.state.favIcon
                }
                size={20}
                // style={{ color: "green[500]" }}
                style={
                    this.props.theme == 'dark' ? 
                    this.state.favIcon === "favorite-border" ? tailwind("text-gray-400") : tailwind("text-red-700")
                    : this.state.favIcon === "favorite-border" ? tailwind("text-gray-700") : tailwind("text-red-700")}
                onPress={() => this.favouriteThisStop(this.props.title.busstop_number)}
            />
          </TouchableOpacity>
          <Text style={this.props.theme == 'dark' ? [styles.titleDark, styles.font] : [styles.title, styles.font]}>
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
        <View style={this.props.theme == 'dark' ? styles.parentHrDark : styles.parentHr} />
        {this.state.expanded && (
          <View style={this.props.theme == 'dark' ? styles.childDark : styles.child}>
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
  titleDark: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#bbb',
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
  rowDark: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 56,
    paddingLeft: 25,
    paddingRight: 18,
    alignItems: 'center',
    shadowColor: "#333",
    shadowOffset: {
        width: 0,
        height: 3,
    },
    shadowOpacity: 1,
    shadowRadius: 2,

    elevation: 10,

    backgroundColor: '#222',
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
  parentHrDark: {
    height: 1,
    color: '#fff',
    width: '100%',
  },
  child: {
    backgroundColor: '#ffffff',
    padding: 16,
  },
  childDark: {
    backgroundColor: '#000',
    padding: 16,
  },
})
