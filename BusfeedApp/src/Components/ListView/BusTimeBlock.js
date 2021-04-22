import React, { Component } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Timers, TouchableNativeFeedbackBase } from 'react-native'
import axios from 'axios'
import { FlatList } from 'react-native-gesture-handler'
import Geolocation from '@react-native-community/geolocation'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons'
import tailwind from 'tailwind-rn'

export default class BusTimeBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: props.data,
      theme: props.theme,
      busTimingContent: false,
      busNumber: this.props.bus_number,
      busStopNumber: this.props.busstop_number,
      userProximity: this.props.userProximity,
      latitude: props.data.latitude,
      longitude: props.data.longitude,
      nextBus1: {},
      nextBus2: {},
      constantPollOn: false,
      arrivalPause: false,
      expectedBusArrive: false,
      constantPollLimitOn: false,
      busTrackCount: 0,
      specialTimeOut: false,
    }
  }

  componentDidMount(){
    // Configuration of background geolocation library
    // 30s API call
  }

  componentDidUpdate(prevProp, prevState){

  }

  componentWillUnmount(){
    clearInterval(this.state.constantBasicPollintervalId)
  }

  // 30s constant polling for bus timing
  constantBasicPoll = () => {
    console.log('====================================');
    console.log('constantBasicPoll INTERVAL for => Bus' + this.state.busNumber);
    console.log('====================================');

    let constantBasicPollintervalId = setInterval(() => {

      this.getBusTiming()

    }, 30000); //30000 -> 30 sec

    this.setState({ constantBasicPollintervalId: constantBasicPollintervalId })
  }

  // Reveal bus timing & make icon dissappeared; Add 1 count to total bus track count; Retrieve bus timing
  componentHideAndShow = () => {
    console.log('====================================');
    console.log('componentHideAndShow');
    console.log('====================================');
    // Call for bus timing
    this.getBusTiming()

    // Reveal bus timing
    this.setState({
      busTimingContent: true,
    })

    this.constantBasicPoll()
  }

  // Re-fetch bus timing
  refreshBusTiming = () => {
    if(this.state.busTimingContent){
      this.getBusTiming()
    }
  }

  // Fetch bus timing; Add to expected demand accordingly; Based on bus timing, determine the function (constant polling, arrival pause, special timeout) to run.
  getBusTiming() {
    console.log('====================================');
    console.log('getBusTiming => ' + this.state.busNumber);
    console.log('====================================');


    // Calling moment library
    const moment = require("moment")

    axios
      .get('http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=' + this.state.busStopNumber + '&ServiceNo=' + this.state.busNumber, {
      headers: {"AccountKey" : "6FebnHNxTv+PGH/NDKkf/Q=="}})
      .then((response) => {
        //actual values
        var nextBus1Timing = moment(response.data.Services[0].NextBus.EstimatedArrival).diff(moment(), 'minutes')
        var nextBus2Timing = moment(response.data.Services[0].NextBus2.EstimatedArrival).diff(moment(), 'minutes')
        var nextBus1 = response.data.Services[0].NextBus
        var nextBus2 = response.data.Services[0].NextBus2
        console.log(nextBus2Timing)

        nextBus1.estimated_arrival_text = nextBus1Timing > 1 ? nextBus1Timing + " min" : nextBus1Timing < -10 || isNaN(nextBus1Timing) ? "NIL" : "Arr" //0-1 min arr
        nextBus2.estimated_arrival_text = nextBus2Timing > 1 ? nextBus2Timing + " min" : nextBus2Timing < -10 || isNaN(nextBus2Timing) ? "NIL" : "Arr" //0-1 min arr
        console.log(nextBus1)
        this.setState({
          nextBus1: nextBus1,
          nextBus2: nextBus2,
          nextBus1Timing: nextBus1Timing,
          nextBus2Timing: nextBus2Timing
        })

        console.log("nextBus1Timing for " + this.state.busNumber + " => " + nextBus1Timing);
        console.log("nextBus2Timing for " + this.state.busNumber + " => " + nextBus2Timing);

      })
      .catch((error) => {
        console.log("error => " + error)
      })
  }

  render() {
    return (
      <View style={this.props.theme == 'dark' ? styles.eachRowDark : styles.eachRow}>
        <Text style={this.props.theme == 'dark' ? styles.busNumberDark : styles.busNumber}>{this.state.busNumber}</Text>

        {!this.state.busTimingContent ? (
          <TouchableOpacity onPress={() => this.componentHideAndShow()}>
            <Text style={tailwind('text-blue-500')}>Check this bus <Icon name={'chevron-right'} size={15} /></Text>
          </TouchableOpacity>
        ) : (
          <View style={tailwind('flex flex-row')}>
            <View style={this.state.nextBus1.Load == "SEA" ? tailwind('border-b-4 border-green-500 mx-2') : this.state.nextBus1.Load == "LSD" ? tailwind('border-b-4 border-red-500 mx-2') : this.state.nextBus1.Load == "SDA" ? tailwind('border-b-4 border-yellow-500 mx-2') : tailwind('border-b-4 border-gray-500 mx-2')}>
              <Text style={this.props.theme == 'dark' ? tailwind('text-lg font-medium text-gray-300') : tailwind('text-lg font-medium text-gray-700')}>{this.state.nextBus1.estimated_arrival_text} {this.state.nextBus1.Feature == "WAB" ? <Icon style={tailwind('text-blue-500 pl-5')} name={'wheelchair-pickup'} size={20} /> : null} {this.state.nextBus1.Type == "DD" ? <Icon2 style={tailwind('text-blue-500 pl-5')} name={'bus-double-decker'} size={20} /> : this.state.nextBus1.Type == "SD" ? <Icon2 style={tailwind('text-blue-500 pl-5')} name={'bus-side'} size={20} /> : null}</Text>
            </View>
            <View style={this.state.nextBus2.Load == "SEA" ? tailwind('border-b-4 border-green-500 mx-2') : this.state.nextBus2.Load == "LSD" ? tailwind('border-b-4 border-red-500 mx-2') : this.state.nextBus2.Load == "SDA" ? tailwind('border-b-4 border-yellow-500 mx-2') : tailwind('border-b-4 border-gray-500 mx-2')}>
              <Text style={this.props.theme == 'dark' ? tailwind('mt-2 text-gray-300') : tailwind('mt-2 text-gray-700')}>{this.state.nextBus2.estimated_arrival_text} {this.state.nextBus2.Feature == "WAB" ? <Icon style={tailwind('text-blue-500 pl-5')} name={'wheelchair-pickup'} size={15} /> : null} {this.state.nextBus2.Type == "DD" ? <Icon2 style={tailwind('text-blue-500 pl-5')} name={'bus-double-decker'} size={15} /> : this.state.nextBus2.Type == "SD" ? <Icon2 style={tailwind('text-blue-500 pl-5')} name={'bus-side'} size={15} /> : null}</Text>
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
    borderColor: '#eeeeee',
    borderBottomWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eachRowDark: {
    padding: 15,
    borderColor: '#222',
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
  },
  busNumberDark: {
    fontSize: 20, 
    color: '#bbb', 
    fontWeight: 'bold',
  }
})
