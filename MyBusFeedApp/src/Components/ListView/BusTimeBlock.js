import React, { Component } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Timers } from 'react-native'
import axios from 'axios'
import { FlatList } from 'react-native-gesture-handler'
import Geolocation from '@react-native-community/geolocation'
import Icon from 'react-native-vector-icons/MaterialIcons'
import tailwind from 'tailwind-rn'
export default class BusTimeBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: props.data,
      busTimingContent: true,
      busNumber: this.props.bus_number,
      busStopNumber: this.props.busstop_number,
      userProximity: this.props.userProximity,
      latitude: props.data.latitude,
      longitude: props.data.longitude,
      nextBus1: {},
      nextBus2: {},
      constantPollOn: false,
      arrivalPause: false,
      pollURL: "",
      expectedBusArrive: false,
      constantPollLimitOn: false,
      busTrackCount: this.props.busTrackCount,
      // HARDCODED VALUE - To be used when there are no bus available to fetch (when coding late at night)
      hardcodeServices: {
        services: [
          {
            service_no: '88',
            operator: 'SBST',
            next_bus: {
              origin_code: '77009',
              destination_code: '52009',
              estimated_arrival: '2021-02-01T15:31:00+08:00',
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
              estimated_arrival: '2021-01-31T01:45:00+08:00',
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
    }
  }

  componentDidUpdate(prevProp, prevState){
    // console.log('====================================');
    // console.log('COMPONENTDIDUPDATE');
    // console.log("prevState.userProximity => " + prevState.userProximity + " this.state.userProximity => " + this.state.userProximity)
    // console.log("prevState.arrivalPause =>" + prevState.arrivalPause + ' this.state.arrivalPause =>' + this.state.arrivalPause)
    // console.log('====================================');

    if (this.state.constantPollOn != prevState.constantPollOn && this.state.constantPollOn==true){
      // 30s API call
      console.log('====================================');
      console.log('constantBasicPoll ON for => '  + this.state.busNumber);
      console.log('====================================');
      this.constantBasicPoll()
    }else if (this.state.arrivalPause != prevState.arrivalPause && this.state.arrivalPause==true && this.state.userProximity == true) {
      console.log('====================================');
      console.log('arrivalPause ON for => '  + this.state.busNumber);
      console.log('====================================');
      this.arrivalPause()
    }else if (this.state.constantPollOn != prevState.constantPollOn && this.state.constantPollOn==false){
      console.log('====================================');
      console.log('constantBasicPoll OFF for => '  + this.state.busNumber);
      console.log('====================================');
      clearInterval(this.state.intervalId)
    }

    if (this.state.constantPollLimitOn != prevState.constantPollLimitOn && this.state.constantPollLimitOn==true) {
      // if user still not in proximity
      setTimeout(() => {
        if (this.state.userProximity == false){
          clearInterval(this.state.intervalId)
        }
        this.setState({
          constantPollLimitOn: false
        })
      }, 300000); //300000 -> 5 minutes
    }
  }

  constantBasicPoll = () => {
    console.log('====================================');
    console.log('constantBasicPoll INTERVAL for => ' + this.state.busNumber);
    console.log('====================================');

    let intervalId = setInterval(() => {
      // this.getBusTiming()

      // Update proximity status
      this.getUserProximity()
      .then((data) => {
        this.setState({ userProximity: data })
        console.log('userProximity DATA in constantBasicPoll data => ' + data  + this.state.busNumber)
        console.log('userProximity DATA in constantBasicPoll state => ' + this.state.userProximity + this.state.busNumber)

        // Update bus timing
        this.getBusTiming()

        if(this.state.userProximity == false){
          this.setState({
            constantPollLimitOn: true
          })
        }
      })
      // console.log('userProximity DATA in constantBasicPoll state 2 => ' + this.state.userProximity)
    }, 30000); //30000 -> 30 sec

    this.setState({ intervalId: intervalId })
  }

  arrivalPause = () => {
    console.log('++++++++++++++++++++++++++++++++++++');
    console.log('arrivalPause INTERVAL START'  + this.state.busNumber);
    console.log('++++++++++++++++++++++++++++++++++++');

    clearInterval(this.state.intervalId)
    console.log('<><><><><>< constantBasicPoll Cleared <><><><><><'  + this.state.busNumber)
    setTimeout(() => {
      // 1. Get Geolocation
      Geolocation.getCurrentPosition((info) => {
        // console.log('++++++++++++++++++++++++++++++++++++');
        // console.log('1 arrivalPause Geolocation');
        // console.log('++++++++++++++++++++++++++++++++++++');
        // console.log("Component Geo info => " + info.coords.latitude + " " + info.coords.longitude);
        this.setState({
          latitude: info.coords.latitude,
          longitude: info.coords.longitude,
        })

        // 2. Get user Proximity
        this.getUserProximity()
        .then((data) => {
          // console.log('++++++++++++++++++++++++++++++++++++');
          // console.log('2 arrivalPause getUserProximity');
          // console.log('++++++++++++++++++++++++++++++++++++');
          this.setState({ userProximity: data })

          // 3. Geo logic
          // console.log("userProximity data in arrivalPause=> " + data + this.state.busNumber)
          console.log("this.state.userProximity => " + this.state.userProximity + this.state.busNumber)
          if (this.state.userProximity == false){
            // If user left the bus stop
            console.log("user left bus stop " + this.state.busNumber)
            this.addToActualDemand(true)
          } else if (this.state.userProximity == true){
            // If user remains in the bus stop
            console.log("user remains in bus stop "  + this.state.busNumber)
            this.addToActualDemand(false)
            this.setState({
              constantPollOn: true,
            })
            console.log('<><><><><>< constantBasicPoll Resume <><><><><><')
          }
          this.setState({
            arrivalPause: false
          })
          console.log('++++++++++++++++++++++++++++++++++++');
          console.log('arrivalPause INTERVAL END');
          console.log('++++++++++++++++++++++++++++++++++++');

        })
        .catch((error) => console.log("userProximity Error => " + error))
      },error => console.log('Error', JSON.stringify(error)),
        {enableHighAccuracy: true, timeout: 60000, maximumAge: 1000},
      )
    }, 120000) //120000 -> 2 min
  }

  addToActualDemand = (userBoardStatus) => {
    console.log('####################################');
    console.log('addToActualDemand START =>' + userBoardStatus + this.state.busNumber);
    console.log('####################################');

    const moment = require("moment")
    console.log(userBoardStatus)
    axios
    .post("https://api.mybusfeed.com/demand/actual/add", {
      
      app_id: 'A1',
      bus_stop_no: this.state.busStopNumber,
      bus_no: this.state.busNumber,
      has_successfully_board: userBoardStatus,
      created_time: moment()
    })
    .then((response) => {
      console.log(response.data)
      // console.log('userProximity DATA in addToActualDemand => ' + this.state.userProximity)

      console.log('####################################');
      console.log('addToActualDemand END');
      console.log('####################################');
    })
  }

  busTrackCountFunction = () => {
    console.log('====================================');
    console.log("busTrackCountFunction bustimeblock");
    console.log('====================================');
    this.props.busTrackCountFunction()
  }

  // Reveal bus timing & make icon disssssapppppear
  componentHideAndShow = () => {
    console.log('====================================');
    console.log('componentHideAndShow');
    console.log('====================================');

    this.busTrackCountFunction()
    console.log('====================================');
    console.log("busTrackCountFunction bustimeblock componentHideAndShow" + this.state.busTrackCount);
    console.log('====================================');

    if (this.state.busTrackCount <= 3){
      this.setState((previousState) => ({
        busTimingContent: !previousState.busTimingContent,
      }))
    }


    

    Geolocation.getCurrentPosition((info) => {
      console.log("Component Geo info => " + info.coords.latitude + " " + info.coords.longitude);
      this.setState({
        latitude: info.coords.latitude,
        longitude: info.coords.longitude,
      })
    },error => console.log('Error', JSON.stringify(error)),
      {enableHighAccuracy: true, timeout: 60000, maximumAge: 1000},
    ).then(
      this.getUserProximity()
      .then((data) => {
        this.setState({ userProximity: data })
        this.getBusTiming()
        this.setState({
          constantPollOn: true,
          pollLimitOn: true
        })
        if (data == true){
          console.log('====================================');
          console.log('User in bus stop proximity');
          console.log('====================================');
          this.setState({ constantPollOn: true })
        }
      })
      // .then(this.getBusTiming())
      // .then(this.constantBasicPoll())
      .catch((error) => console.log("userProximity Error => "+error))
    )
    .catch((error) => console.log("GeoERROR => " + error))
  }

  // Fetch bus timing
  getBusTiming() {
    console.log('====================================');
    console.log('getBusTiming => ' + this.state.busNumber);
    console.log('====================================');

    var url = ''
    if (this.state.userProximity && this.state.expectedBusArrive == false) {
      var url = 'https://api.mybusfeed.com/demand/expected/add'
      this.setState({
        expectedBusArrive: true
      })
    } else {
      var url = 'https://api.mybusfeed.com/demand/bus-timing'
    }
    console.log(url);

    // Calling moment library
    const moment = require("moment")

    axios
      .post(url, {
        app_id: 'A1',
        bus_stop_no: this.state.busStopNumber,
        bus_no: this.state.busNumber,
      })
      .then((response) => {
        // console.log(response.data.services[0].next_bus.estimated_arrival)

        // for hardcoded values
        // var nextBus1Timing = moment(this.state.hardcodeServices.services[0].next_bus.estimated_arrival).diff(moment(), 'minutes')
        // var nextBus2Timing = moment(this.state.hardcodeServices.services[0].next_bus_2.estimated_arrival).diff(moment(), 'minutes')
        // var nextBus1 = this.state.hardcodeServices.services[0].next_bus
        // var nextBus2 = this.state.hardcodeServices.services[0].next_bus_2

        //actual values
        var nextBus1Timing = moment(response.data.services[0].next_bus.estimated_arrival).diff(moment(), 'minutes')
        var nextBus2Timing = moment(response.data.services[0].next_bus_2.estimated_arrival).diff(moment(), 'minutes')
        var nextBus1 = response.data.services[0].next_bus
        var nextBus2 = response.data.services[0].next_bus_2

        nextBus1.estimated_arrival_text = nextBus1Timing >= 2 ? nextBus1Timing + " min" : nextBus1Timing < -10 ? "NIL" : "Arr"
        nextBus2.estimated_arrival_text = nextBus2Timing >= 2 ? nextBus2Timing + " min" : nextBus2Timing < -10 ? "NIL" : "Arr"
        this.setState({
          nextBus1: nextBus1,
          nextBus2: nextBus2,
        })

        console.log("nextBus1 => " + nextBus1Timing);
        console.log("nextBus2 => " + nextBus2Timing);

        if (nextBus1Timing < 2 && nextBus1Timing > 0){
          this.setState({
            constantPollOn: false,
            arrivalPause: true
          })
          console.log('xxxxxxxxxxxxxxxxxxxxxxxx');
          console.log("Constant Polling stopped");
          console.log('xxxxxxxxxxxxxxxxxxxxxxxx');
        }else{
          this.setState({
            constantPollOn: true,
            arrivalPause: false
          })
        }

        // console.log("Nextbus1 timing:")
        // console.log(nextBus1)
        // console.log("constantPollOn => " + this.state.constantPollOn)
      })
      .catch((error) => {
        console.log("error => " + error)
      })
  }

  // To see if user is in range of bus stop
  getUserProximity() {
    console.log('====================================');
    console.log('getUserProximity');
    console.log('====================================');

    const fetchURL = 'https://api.mybusfeed.com/location/getBusStopNo/'.concat(
      this.state.latitude,
      '-',
      this.state.longitude,
      '-',
      this.state.busStopNumber,
    )
    console.log("fetchURL =>" + fetchURL);
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
            <Icon name={'refresh'} size={30} color="#4F4F4F" />
          </TouchableOpacity>
        ) : (
          <View style={tailwind('flex flex-row')}>
            <View style={this.state.nextBus1.load == "SEA" ? tailwind('border-b-4 border-green-500 mx-2') : this.state.nextBus1.load == "LSD" ? tailwind('border-b-4 border-red-500 mx-2') : tailwind('border-b-4 border-yellow-500 mx-2') }>
              <Text style={tailwind('text-lg font-medium text-gray-700')}>{this.state.nextBus1.estimated_arrival_text}</Text>
            </View>
            <View style={this.state.nextBus2.load == "SEA" ? tailwind('border-b-4 border-green-500 mx-2') : this.state.nextBus1.load == "LSD" ? tailwind('border-b-4 border-red-500 mx-2') : tailwind('border-b-4 border-yellow-500 mx-2') }>
              <Text style={tailwind('mt-2 text-gray-700')}>{this.state.nextBus2.estimated_arrival_text}</Text>
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
