import React, { Component } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Timers, TouchableNativeFeedbackBase } from 'react-native'
import axios from 'axios'
import { FlatList } from 'react-native-gesture-handler'
import Geolocation from '@react-native-community/geolocation'
import Icon from 'react-native-vector-icons/MaterialIcons'
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
      busTrackCount: this.props.busTrackCount,
      specialTimeOut: false,
      testState: true,
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

  componentDidMount(){
    console.log('====================================');
    console.log("bustimeblock this.state.data.appID -> " + this.state.data.appID);
    console.log('====================================');

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


    

    BackgroundGeolocation.checkStatus(status => {
      // console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
      // console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
      // console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);

      // you don't need to check status before start (this is just the example)
      if (!status.isRunning) {
        BackgroundGeolocation.start(); //triggers start on start event
      }
    });

    // you can also just start without checking for status
    // BackgroundGeolocation.start();

    BackgroundGeolocation.on('background', () => {
      console.log('[INFO] App is in background');
    });

    BackgroundGeolocation.on('start', () => {
      // service started successfully
      // you should adjust your app UI for example change switch element to indicate
      // that service is running
      console.log('[DEBUG] BackgroundGeolocation has been started');
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
      BackgroundTimer.setTimeout(() => {
        if (this.state.userProximity == false){
          this.setState({
            constantPollOn: false
          })
        }
        this.setState({
          constantPollLimitOn: false
        })
      }, 300000); //300000 -> 5 minutes
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

      BackgroundTimer.setTimeout(() => {
        console.log('specialTimeOut Interval kicks in');
        this.setState({
          specialTimeOut: false
        })
        this.getBusTiming()

        console.log('====================================');
        console.log("specialTimeOut OFF => " + this.state.specialTimeOut);
        console.log('====================================');
      }, timeoutMin);

    }
  }

  constantBasicPoll = () => {
    console.log('====================================');
    console.log('constantBasicPoll INTERVAL for => ' + this.state.busNumber);
    console.log('====================================');

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

      },error => console.log('Error', JSON.stringify(error)),
        {enableHighAccuracy: true, timeout: 60000, maximumAge: 1000},
      )
      // console.log('userProximity DATA in constantBasicPoll state 2 => ' + this.state.userProximity)
    }, 30000); //30000 -> 30 sec

    this.setState({ intervalId: intervalId })
  }

  arrivalPause = () => {
    console.log('++++++++++++++++++++++++++++++++++++');
    console.log('arrivalPause INTERVAL START => '  + this.state.busNumber);
    console.log('++++++++++++++++++++++++++++++++++++');

    BackgroundTimer.clearInterval(this.state.intervalId)
    console.log('<><><><><>< constantBasicPoll Cleared <><><><><><'  + this.state.busNumber)
    BackgroundTimer.setTimeout(() => {
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
    }, 180000) //120000 -> 2 min
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

  getTeleBot = () => {
    axios
    .post(`https://api.telegram.org/bot${TELE_TOKEN}/sendMessage`, {
      chat_id: "-538084552",
      text: `User <${this.state.data.appID}> queried for <${this.state.busNumber}> at <${this.state.busStopNumber}>`,
    })
    .then((response) => {
      console.log("Telebot msg sent");
      console.log(response)
    })
  }

  // Reveal bus timing & make icon disssssapppppear
  componentHideAndShow = () => {
    console.log('====================================');
    console.log('componentHideAndShow');
    console.log('====================================');

    this.busTrackCountFunction()
    this.getTeleBot()
    console.log('#############################################');
    console.log("Total bus polling => " + this.props.busTrackCount);
    console.log('#############################################');

    BackgroundGeolocation.getCurrentLocation((info) => {
      console.log("Component Geo info => " + info.latitude + " " + info.longitude);
      this.setState({
        latitude: info.latitude,
        longitude: info.longitude,
      })

      this.getUserProximity()
      .then((data) => {
        this.setState({ userProximity: data })
        
        // Call for bus timing
        this.getBusTiming()

        // Reveal bus timing
        this.setState((previousState) => ({
          busTimingContent: !previousState.busTimingContent,
        }))

      }).catch((error) => console.log("userProximity Error => "+error))

    },error => console.log('Error', JSON.stringify(error)),
      {enableHighAccuracy: true, timeout: 60000, maximumAge: 1000},
    )
  }

  refreshBusTiming = () => {
    console.log("refreshBusTiming => " + this.state.busNumber);
    console.log(this.state.busTimingContent);
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
    if ((this.props.foundBeacon || this.state.userProximity) && this.state.expectedBusArrive == false) {
      var url = 'https://api.mybusfeed.com/demand/expected/add'
      // To ensure expected count is added once only
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
        app_id: this.state.data.appID,
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
        }else if (this.props.busTrackCount <= 3){

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
          console.log('Max polling hit =>' + this.props.busTrackCount);
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

        {!this.state.busTimingContent ? (
          <TouchableOpacity onPress={() => this.componentHideAndShow()}>
            <Text style={tailwind('text-blue-500')}>Check this bus <Icon name={'chevron-right'} size={15} /></Text>
          </TouchableOpacity>
        ) : (
          <View style={tailwind('flex flex-row')}>
            <View style={this.state.nextBus1.load == "SEA" ? tailwind('border-b-4 border-green-500 mx-2') : this.state.nextBus1.load == "LSD" ? tailwind('border-b-4 border-red-500 mx-2') : this.state.nextBus1.load == "SDA" ? tailwind('border-b-4 border-yellow-500 mx-2') : tailwind('border-b-4 border-gray-500 mx-2')}>
              <Text style={tailwind('text-lg font-medium text-gray-700')}>{this.state.nextBus1.estimated_arrival_text} {this.state.nextBus1.feature == "WAB" ? <Icon style={tailwind('text-blue-500 pl-5')} name={'wheelchair-pickup'} size={20} /> : null}</Text>
              
            </View>
            <View style={this.state.nextBus2.load == "SEA" ? tailwind('border-b-4 border-green-500 mx-2') : this.state.nextBus2.load == "LSD" ? tailwind('border-b-4 border-red-500 mx-2') : this.state.nextBus2.load == "SDA" ? tailwind('border-b-4 border-yellow-500 mx-2') : tailwind('border-b-4 border-gray-500 mx-2')}>
              <Text style={tailwind('mt-2 text-gray-700')}>{this.state.nextBus2.estimated_arrival_text} {this.state.nextBus2.feature == "WAB" ? <Icon style={tailwind('text-blue-500 pl-5')} name={'wheelchair-pickup'} size={15} /> : null}</Text>
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
