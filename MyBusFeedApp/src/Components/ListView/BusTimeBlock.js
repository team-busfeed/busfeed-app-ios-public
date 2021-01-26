import React, { Component } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import axios from 'axios'
import { FlatList } from 'react-native-gesture-handler'
import Geolocation from '@react-native-community/geolocation'
import Icon from 'react-native-vector-icons/MaterialIcons'
import tailwind from 'tailwind-rn'
export default class BusTimeBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      busTimingContent: true,
      busNumber: this.props.bus_number,
      busStopNumber: this.props.busstop_number,
      userProximity: false,
      latitude: 1.3521,
      longitude: 103.8198,
      nextBus1: {},
      nextBus2: {}
    }
  }

  // Reveal bus timing & make icon disssssapppppear
  componentHideAndShow = () => {
    this.setState((previousState) => ({
      busTimingContent: !previousState.busTimingContent,
    }))
    this.getGeoLocation()
    console.log(this.state.busStopNumber)
    this.getUserProximity()
      .then((data) => {
        this.setState({ userProximity: data })
        console.log('DATA => ' + data)
      })
      .then(this.getBusTiming())
      .catch((error) => console.log(error))
  }

  // Fetch bus timing
  getBusTiming() {
    var url = ''
    if (this.state.userProximity == true) {
      var url = 'https://api.mybusfeed.com/demand/expected/add'
    } else {
      var url = 'https://api.mybusfeed.com/demand/bus-timing'
    }

    // HARDCODED VALUE - To be used when there are no bus available to fetch (when coding late at night)
    const services = {
      services: [
        {
          service_no: '88',
          operator: 'SBST',
          next_bus: {
            origin_code: '77009',
            destination_code: '52009',
            estimated_arrival: '2021-01-24T05:20:00+08:00',
            latitude: '1.379359',
            longitude: '103.92117033333334',
            visit_number: '1',
            load: 'SEA',
            feature: 'WAB',
            type: 'DD',
          },
          next_bus_2: {
            origin_code: '77009',
            destination_code: '52009',
            estimated_arrival: '2021-01-24T05:31:00+08:00',
            latitude: '1.3827318333333334',
            longitude: '103.93599933333333',
            visit_number: '1',
            load: 'SEA',
            feature: 'WAB',
            type: 'DD',
          },
          next_bus_3: {
            origin_code: '77009',
            destination_code: '52009',
            estimated_arrival: '2021-01-24T04:58:00+08:00',
            latitude: '0',
            longitude: '0',
            visit_number: '1',
            load: 'SEA',
            feature: 'WAB',
            type: 'DD',
          },
        },
      ],
    }
    
    // Calling moment library
    const moment = require("moment")

    axios
      .post(url, {
        app_id: 'A1',
        bus_stop_no: this.state.busStopNumber,
        bus_no: this.state.busNumber,
      })
      .then((response) => {
        console.log(response.data.services[0].next_bus.estimated_arrival)
        var nextBus1Timing = moment(response.data.services[0].next_bus.estimated_arrival).diff(moment(), 'minutes')
        var nextBus2Timing = moment(response.data.services[0].next_bus_2.estimated_arrival).diff(moment(), 'minutes')

        var nextBus1 = response.data.services[0].next_bus
        var nextBus2 = response.data.services[0].next_bus_2

        nextBus1.estimated_arrival = nextBus1Timing >= 2 ? nextBus1Timing + " min" : nextBus1Timing < -10 ? "NIL" : "Arr"
        nextBus2.estimated_arrival = nextBus2Timing >= 2 ? nextBus2Timing + " min" : nextBus2Timing < -10 ? "NIL" : "Arr"
        this.setState({
          nextBus1: nextBus1,
          nextBus2: nextBus2,
        })
        console.log("Nextbus1 timing:")
        console.log(nextBus1)
      })
      .catch((error) => {
        console.log(error)
      })
  } 

  // To check current location
  getGeoLocation() {
    Geolocation.getCurrentPosition((info) => {
      console.log('========================')
      console.log('Got current geolocation!')
      console.log('========================')
      this.setState({
        latitude: info.coords.latitude,
        longitude: info.coords.longitude,
      })
      console.log('LAT:' + this.state.latitude)
      console.log('LONG:' + this.state.longitude)
    })
  }

  // To see if user is in range of bus stop
  getUserProximity() {
    const fetchURL = 'https://api.mybusfeed.com/location/getBusStopNo/'.concat(
      this.state.latitude,
      '-',
      this.state.longitude,
      '-',
      this.state.busStopNumber,
    )
    return axios
      .get(fetchURL)
      .then((response) => response.data.status)
      .catch((error) => console.log(error))
  }

  render() {
    return (
      <View style={styles.eachRow}>
        <Text style={styles.busNumber}>{this.state.busNumber}</Text>

        {this.state.busTimingContent ? (
          <TouchableOpacity onPress={() => this.componentHideAndShow()}>
            <Icon name={'lunch-dining'} size={40} color="#4F4F4F" />
          </TouchableOpacity>
        ) : (
          <View style={tailwind('flex flex-row')}>
            <View style={this.state.nextBus1.load == "SEA" ? tailwind('border-b-4 border-green-500 mx-2') : this.state.nextBus1.load == "LSD" ? tailwind('border-b-4 border-red-500 mx-2') : tailwind('border-b-4 border-yellow-500 mx-2') }>
              <Text style={tailwind('text-lg font-medium text-gray-700')}>{this.state.nextBus1.estimated_arrival}</Text>
            </View>
            <View style={this.state.nextBus2.load == "SEA" ? tailwind('border-b-4 border-green-500 mx-2') : this.state.nextBus1.load == "LSD" ? tailwind('border-b-4 border-red-500 mx-2') : tailwind('border-b-4 border-yellow-500 mx-2') }>
              <Text style={tailwind('mt-2 text-gray-700')}>{this.state.nextBus2.estimated_arrival}</Text>
            </View>
            <View>
              <Icon name={'favorite-border'} size={25} color="#000000" />
            </View>
          </View>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  eachRow: {
    padding: 15,
    borderColor: '#cccccc',
    borderBottomWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  busTimingFirst: { 
    marginRight: 70, 
    fontSize: 20,
    borderBottomColor: '#EB5757', 
    borderBottomWidth: 4,  
  }, 
  busTimingSecond: { 
    position: 'absolute', 
    marginRight: 10, 
    bottom: 0, 
    right: 0, 
    borderBottomColor: '#EB5757', 
    borderBottomWidth: 4,  
  }, 
  busNumber: {
    fontSize: 20, 
    color: '#4F4F4F', 
    fontWeight: 'bold',
  }
})
