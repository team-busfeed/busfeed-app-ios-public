import React, { Component } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import axios from 'axios'
import { FlatList } from 'react-native-gesture-handler'
import Geolocation from '@react-native-community/geolocation'
import Icon from 'react-native-vector-icons/MaterialIcons'

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
      nextBusTiming: 0,
      nextBusTiming2: 0
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
        this.setState({
          nextBusTiming: moment(response.data.services[0].next_bus.estimated_arrival).diff(moment(), 'minutes'),
          nextBusTiming2: moment(response.data.services[0].next_bus_2.estimated_arrival).diff(moment(), 'minutes'),

          //for hardcoded service data
          // nextBusTiming: moment(services.services[0].next_bus.estimated_arrival).diff(moment(), 'minutes'),
          // nextBusTiming2: moment(services.services[0].next_bus_2.estimated_arrival).diff(moment(), 'minutes'),
        })
        console.log("Next bus timing")
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
        <Text>{this.state.busNumber}</Text>

        {this.state.busTimingContent ? (
          <TouchableOpacity onPress={() => this.componentHideAndShow()}>
            <Icon name={'lunch-dining'} size={40} color="#000000" />
          </TouchableOpacity>
        ) : (
          <View>
            <Text>{this.state.nextBusTiming}</Text>
            <Text>{this.state.nextBusTiming2}</Text>
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
})
