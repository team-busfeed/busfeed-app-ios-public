import React, { Component } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Timers, TouchableNativeFeedbackBase } from 'react-native'
import axios from 'axios'
import { FlatList } from 'react-native-gesture-handler'
import Geolocation from '@react-native-community/geolocation'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons'
import tailwind from 'tailwind-rn'
import BackgroundTimer from 'react-native-background-timer';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import { TELE_TOKEN } from '@env'



export default class BusTimeBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: props.data,
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
      pollURL: "",
      expectedBusArrive: false,
      constantPollLimitOn: false,
      busTrackCount: 0,
      specialTimeOut: false,
      testState: true,
    }
  }

  componentDidMount(){

    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 50,
      notificationTitle: 'Background tracking',
      notificationText: 'enabled',
      debug: false,
      startOnBoot: true,
      stopOnTerminate: true,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
      stopOnStillActivity: false,
      startForeground: true,
      notificationsEnabled: false
    });
  }

  componentDidUpdate(prevProp, prevState){
    if (this.state.constantPollOn != prevState.constantPollOn && this.state.constantPollOn==true){
      // 30s API call
      console.log('====================================');
      console.log('constantBasicPoll ON for => '  + this.state.busNumber);
      console.log('====================================');
      this.constantBasicPoll()
    }else if (this.state.constantPollOn != prevState.constantPollOn && this.state.constantPollOn==false){
      console.log('====================================');
      console.log('constantBasicPoll OFF for => '  + this.state.busNumber);
      console.log('====================================');
      BackgroundTimer.clearInterval(this.state.intervalId)
    }
    
    if (this.state.arrivalPause != prevState.arrivalPause && this.state.arrivalPause==true && this.state.userProximity == true) {
      console.log('====================================');
      console.log('arrivalPause ON for => '  + this.state.busNumber);
      console.log('====================================');
      this.arrivalPause()
    }

    if (this.state.constantPollLimitOn != prevState.constantPollLimitOn && this.state.constantPollLimitOn==true) {
      // if user still not in proximity
      console.log('====================================');
      console.log("constantPollLimitOn 5min for => " + this.state.busNumber);
      console.log('====================================');
      console.log("Start > 5 mins timer move within range")
      BackgroundTimer.runBackgroundTimer(() => {
        console.log("End >5 mins timer")
        if (this.state.userProximity == false){
          this.setState({
            constantPollOn: false
          })
        }
        this.setState({
          constantPollLimitOn: false
        })
      }, 300000); //300000 -> 5 minutes
    BackgroundTimer.stopBackgroundTimer();
    }


    if (this.state.specialTimeOut != prevState.specialTimeOut && this.state.specialTimeOut==true){
      console.log('====================================');
      console.log("specialTimeOut ON for => " + this.state.busNumber);
      console.log('====================================');
      var timeoutMin = 4 * 1000 * 60 //default timeout 4 min
      if (this.state.nextBus1Timing > 4){
        var timeoutMin = Math.abs(Math.min( ((this.state.nextBus1Timing - 4) * 1000 * 60), (5 * 1000 * 60) ))
      }
      console.log("timeoutMin => " + timeoutMin)

      console.log("Start timer till 4 mins")
      BackgroundTimer.runBackgroundTimer(() => {
        console.log("End timer till 4 mins")
        console.log('specialTimeOut Interval kicks in');
        this.setState({
          specialTimeOut: false
        })
        this.getBusTiming()

        console.log('====================================');
        console.log("specialTimeOut OFF => " + this.state.specialTimeOut);
        console.log('====================================');
      }, timeoutMin);
    BackgroundTimer.stopBackgroundTimer();
    }
  }

  constantBasicPoll = () => {
    console.log('====================================');
    console.log('constantBasicPoll INTERVAL for => ' + this.state.busNumber);
    console.log('====================================');
    if (Platform.OS =="ios") {
        BackgroundTimer.start();
    }
    let intervalId = BackgroundTimer.setInterval(() => {
      BackgroundGeolocation.getCurrentLocation((info) => {
        console.log("Component Geo info => " + info.latitude + " " + info.longitude);
        this.setState({
          latitude: info.latitude,
          longitude: info.longitude,
        })

        // Update proximity status
        this.getUserProximity()
        .then((data) => {
          this.setState({ userProximity: data })
          console.log('userProximity DATA in constantBasicPoll data => ' + data  + this.state.busNumber)
          console.log('userProximity DATA in constantBasicPoll state => ' + this.state.userProximity + this.state.busNumber)

          // Update bus timing
          this.getBusTiming()

          // If user not in proximity
          if(data == false ){
            this.setState({
              constantPollLimitOn: true
            })
          }
        })

      },error => console.log('Geolocation in bustimeblock Error', JSON.stringify(error)),
        {enableHighAccuracy: true, timeout: 60000, maximumAge: 1000},
      )
      // console.log('userProximity DATA in constantBasicPoll state 2 => ' + this.state.userProximity)
    }, 30000); //30000 -> 30 sec

    this.setState({ intervalId: intervalId })
  }

  arrivalPause = () => {
    console.log('++++++++++++++++++++++++++++++++++++');
    console.log('3min arrivalPause INTERVAL START => '  + this.state.busNumber);
    console.log('++++++++++++++++++++++++++++++++++++');

    BackgroundTimer.clearInterval(this.state.intervalId)
    BackgroundTimer.stopBackgroundTimer();
    
    console.log('<><><><><>< constantBasicPoll Cleared <><><><><><'  + this.state.busNumber)
    BackgroundTimer.runBackgroundTimer(() => {
      // 1. Get Geolocation
      BackgroundGeolocation.getCurrentLocation((info) => {
        this.setState({
          latitude: info.latitude,
          longitude: info.longitude,
        })

        // 2. Get user Proximity
        this.getUserProximity()
        .then((data) => {
          this.setState({ 
            userProximity: data,
            arrivalPause: false
          })

          // 3. Geo logic
          console.log("this.state.userProximity => " + this.state.userProximity + this.state.busNumber)
          console.log("this.props.foundBeacon => " + this.props.foundBeacon)
          if (this.state.userProximity == false || (this.props.foundBeacon == false && this.props.beaconStart)){
            // If user left the bus stop
            // console.log("user left bus stop on bus " + this.state.busNumber)
            // this.addToActualDemand(true)
            this.props.actualBusStackFunction([this.state.busNumber, this.state.nextBus1.load])

          } else if (this.state.userProximity == true || (this.props.foundBeacon == true && this.props.beaconStart)){
            if (this.state.nextBus1.load == "LSD"){
              // If user remains in the bus stop + bus crowded
              console.log("user cannot board bus "  + this.state.busNumber)
              this.addToActualDemand(false)
            } else {
              console.log("user not boarding bus " + this.state.busNumber)
            }

            this.setState({
              constantPollOn: true,
            })
            console.log('<><><><><>< constantBasicPoll Resume <><><><><><')
          }

          console.log('++++++++++++++++++++++++++++++++++++');
          console.log('arrivalPause INTERVAL END');
          console.log('++++++++++++++++++++++++++++++++++++');

        })
        .catch((error) => console.log("userProximity Error => " + error))
      },error => console.log('Error', JSON.stringify(error)),
        {enableHighAccuracy: true, timeout: 60000, maximumAge: 1000},
      )
    }, 180000) //180000 -> 3 min
  }

  addToActualDemand = (userBoardStatus) => {
    console.log('####################################');
    console.log('addToActualDemand START => ' + userBoardStatus + this.state.busNumber);
    console.log('####################################');

    const moment = require("moment")
    console.log("moment => " + moment().utcOffset("+08:00").format("YYYY-MM-DD HH:mm:ss"))

    axios
    .post("https://api.mybusfeed.com/demand/actual/add", {
      
      app_id: this.state.data.appID,
      bus_stop_no: this.state.busStopNumber,
      bus_no: this.state.busNumber,
      has_successfully_board: userBoardStatus,
      created_time: moment().utcOffset("+08:00").format("YYYY-MM-DD HH:mm:ss")
    })
    .then((response) => {
      console.log(response.data)
      var msg = `[ACTUAL DEMAND]: User <${this.state.data.appID}> for <${this.state.busNumber}> at <${this.state.busStopNumber}>`
      this.getTeleBot(msg)

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

    this.setState({
      busTrackCount: this.props.busTrackCount
    })
  }

  getTeleBot = (msg) => {
    axios
    .post(`https://api.telegram.org/bot${TELE_TOKEN}/sendMessage`, {
      chat_id: "-538084552",
      text: msg,
    })
    .then((response) => {
      console.log("Telebot msg sent");
      // console.log(response)
    })
  }

  // Reveal bus timing & make icon disssssapppppear
  componentHideAndShow = () => {
    console.log('====================================');
    console.log('componentHideAndShow');
    console.log('====================================');

    this.busTrackCountFunction()
    console.log('#############################################');
    console.log("Total bus polling => " + this.state.busTrackCount);
    console.log('#############################################');

    Geolocation.getCurrentPosition((info) => {
      console.log('====================================');
      console.log("GEOLOCATION");
      console.log('====================================');
      console.log("Component Geo info => " + info.coords.latitude + " " + info.coords.longitude);
      this.setState({
        latitude: info.coords.latitude,
        longitude: info.coords.longitude,
      })

      this.getUserProximity()
      .then((data) => {
        this.setState({ userProximity: data })
        
        // Call for bus timing
        this.getBusTiming()

        // Reveal bus timing
        this.setState({
          busTimingContent: true,
        })
      })
    }
    ,(error) => console.log('position error!!!', error),
    {
      enableHighAccuracy: Platform.OS !== 'android', //set to true if android emulator have location issues
      timeout: 60000,
      maximumAge: 0,
    })
  }

  refreshBusTiming = () => {
    if(this.state.busTimingContent){
      this.getBusTiming()
    }
  }

  // Fetch bus timing
  getBusTiming() {
    console.log('====================================');
    console.log('getBusTiming => ' + this.state.busNumber);
    console.log('====================================');

    var url = ''
    console.log("this.props.foundBeacon => " + this.props.foundBeacon)
    if ( (this.props.foundBeacon || this.state.userProximity) && this.state.expectedBusArrive == false && this.state.busTrackCount <= 2) {
      var url = 'https://api.mybusfeed.com/demand/expected/add'
      // To ensure expected count is added once only
      this.setState({
        expectedBusArrive: true
      })
      var msg = `<EXPECTED DEMAND <${this.state.busTrackCount}>>: User <${this.state.data.appID}> queried for <${this.state.busNumber}> at <${this.state.busStopNumber}>`
      this.getTeleBot(msg)
    } else {
      var url = 'https://api.mybusfeed.com/demand/bus-timing'
    }
    console.log(url);

    // Calling moment library
    const moment = require("moment")

    axios
      .post(url, {
        app_id: this.state.data.appID,
        bus_stop_no: this.state.busStopNumber,
        bus_no: this.state.busNumber,
      })
      .then((response) => {

        //actual values
        var nextBus1Timing = moment(response.data.services[0].next_bus.estimated_arrival).diff(moment(), 'minutes')
        var nextBus2Timing = moment(response.data.services[0].next_bus_2.estimated_arrival).diff(moment(), 'minutes')
        var nextBus1 = response.data.services[0].next_bus
        var nextBus2 = response.data.services[0].next_bus_2

        nextBus1.estimated_arrival_text = nextBus1Timing > 2 ? nextBus1Timing + " min" : nextBus1Timing < -10 ? "NIL" : "Arr"
        nextBus2.estimated_arrival_text = nextBus2Timing > 2 ? nextBus2Timing + " min" : nextBus2Timing < -10 ? "NIL" : "Arr"
        this.setState({
          nextBus1: nextBus1,
          nextBus2: nextBus2,
          nextBus1Timing: nextBus1Timing,
          nextBus2Timing: nextBus2Timing
        })

        console.log("nextBus1Timing for " + this.state.busNumber + " => " + nextBus1Timing);
        console.log("nextBus2Timing for " + this.state.busNumber + " => " + nextBus2Timing);

        // Bus "Arr" State
        if (nextBus1Timing <= 2 && nextBus1Timing >= 0){
          this.setState({
            constantPollOn: false,
            arrivalPause: true,
            specialTimeOut: false
          })

        // Only poll for 3 bus max
        }else if (this.state.busTrackCount <= 2){

          // Constant poll from 4 min to "Arr" State
          if (nextBus1Timing <= 4 && nextBus1Timing >= 2){
            this.setState({
              constantPollOn: true,
              arrivalPause: false,
              specialTimeOut: false
            })

          // Constant polling paused until 4 min reached
          } else if (nextBus1Timing > 4){
            this.setState({
              specialTimeOut: true,
              constantPollOn: false,
            })
          }
        }else{
          console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
          console.log('Max polling hit =>' + this.state.busTrackCount);
          console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        }
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
    // console.log("fetchURL =>" + fetchURL);
    return axios
      .get(fetchURL)
      .then((response) => response.data.status)
      .catch((error) => console.log(error))
  }

  render() {
    return (
      <View style={styles.eachRow}>
        <Text style={styles.busNumber}>{this.state.busNumber}</Text>

        {!this.state.busTimingContent ? (
          <TouchableOpacity onPress={() => this.componentHideAndShow()}>
            <Text style={tailwind('text-blue-500')}>Check this bus <Icon name={'chevron-right'} size={15} /></Text>
          </TouchableOpacity>
        ) : (
          <View style={tailwind('flex flex-row')}>
            <View style={this.state.nextBus1.load == "SEA" ? tailwind('border-b-4 border-green-500 mx-2') : this.state.nextBus1.load == "LSD" ? tailwind('border-b-4 border-red-500 mx-2') : this.state.nextBus1.load == "SDA" ? tailwind('border-b-4 border-yellow-500 mx-2') : tailwind('border-b-4 border-gray-500 mx-2')}>
              <Text style={tailwind('text-lg font-medium text-gray-700')}>{this.state.nextBus1.estimated_arrival_text} {this.state.nextBus1.feature == "WAB" ? <Icon style={tailwind('text-blue-500 pl-5')} name={'wheelchair-pickup'} size={20} /> : null} {this.state.nextBus1.type == "DD" ? <Icon2 style={tailwind('text-blue-500 pl-5')} name={'bus-double-decker'} size={20} /> : <Icon2 style={tailwind('text-blue-500 pl-5')} name={'bus-side'} size={20} /> }</Text>
            </View>
            <View style={this.state.nextBus2.load == "SEA" ? tailwind('border-b-4 border-green-500 mx-2') : this.state.nextBus2.load == "LSD" ? tailwind('border-b-4 border-red-500 mx-2') : this.state.nextBus2.load == "SDA" ? tailwind('border-b-4 border-yellow-500 mx-2') : tailwind('border-b-4 border-gray-500 mx-2')}>
              <Text style={tailwind('mt-2 text-gray-700')}>{this.state.nextBus2.estimated_arrival_text} {this.state.nextBus2.feature == "WAB" ? <Icon style={tailwind('text-blue-500 pl-5')} name={'wheelchair-pickup'} size={15} /> : null} {this.state.nextBus2.type == "DD" ? <Icon2 style={tailwind('text-blue-500 pl-5')} name={'bus-double-decker'} size={15} /> : <Icon2 style={tailwind('text-blue-500 pl-5')} name={'bus-side'} size={15} /> }</Text>
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
