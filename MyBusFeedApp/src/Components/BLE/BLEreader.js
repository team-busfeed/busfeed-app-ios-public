/* eslint-disable */

import React, { Component } from 'react'
import {
  Text,
  View,
  DeviceEventEmitter,
  PermissionsAndroid,

} from 'react-native'

import Beacons from 'react-native-beacons-manager'
import PushNotification from 'react-native-push-notification'
import moment from 'moment'
import BackgroundTimer from 'react-native-background-timer';


const TIME_FORMAT = 'MM/DD/YYYY HH:mm:ss'

export default class BLEreader extends Component {
  constructor(props) {
    super(props)

    this.state = {
      // region information
      uuid: 'fda50693-a4e2-4fb1-afcf-c6eb07647825',
      identifier: 'iBeacon',
      major: 1,
      minor: 1,
      foundBeacon: false,
      bustop: 4121,
			foundBeacon2: false
    }
  }

  configurePushNotification() {
    PushNotification.configure({
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    })
  }

  componentDidMount() {
    
    if (Platform.OS === 'android') {
      Beacons.detectIBeacons()
    } else {
      Beacons.requestWhenInUseAuthorization();
    }
    //this.configurePushNotification();
    console.log('====================================');
    console.log("BLE componentDidMount");
    console.log('====================================');
  }

  componentWillUnMount() {
    console.log('UNMOUNT  BEGIN XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
    const { uuid, identifier } = this.state
    const region = { identifier, uuid }

    // stop ranging beacons:
    Beacons.stopRangingBeaconsInRegion(identifier, uuid)
      .then(() => console.log('Beacons ranging stopped succesfully'))
      .catch((error) =>
        console.log(`Beacons ranging not stopped, error: ${error}`),
      )

    // stop monitoring beacons:
    Beacons.stopMonitoringForRegion(region)
      .then(() => console.log('Beacons monitoring stopped succesfully'))
      .catch((error) =>
        console.log(`Beacons monitoring not stopped, error: ${error}`),
      )

    // remove ranging event we registered at componentDidMount
    DeviceEventEmitter.removeListener('beaconsDidRange')
    // remove beacons events we registered at componentDidMount
    DeviceEventEmitter.removeListener('regionDidEnter')
    DeviceEventEmitter.removeListener('regionDidExit')

    console.log('UNMOUNT  END XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
  }

  render() {
    return this.startDetection()
  }

  changefoundBeacon2() {
		console.log("changefoundBeacon2 changed")
		this.setState({
			foundBeacon2: true
		})
	}

  startDetection() {
    // BackgroundTimer.setInterval(() => {
      const { foundBeacon } = this.state
      Beacons.requestWhenInUseAuthorization();
      console.log('====================================')
      console.log('BLEreader started')
      console.log('====================================')
      if (foundBeacon) {
        this.startMonitoringBeacon()
      } else {
        this.startRanging()
      }
      // return null

      console.log('====================================');
      console.log("Interval 10000");
      console.log('====================================');

    // }, 10000)
    return null
  }

  async checkPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Wifi networks',
          message: 'We need your permission in order to find wifi networks',
        },
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Thank you for your permission! :)')
      } else {
        console.log(
          'You will not able to retrieve wifi available networks list',
        )
      }
    } catch (err) {
      console.warn(err)
    }
  }

  startMonitoringBeacon() {
    const regionToMonitor = ({ identifier, uuid, major, minor } = this.state)
    this.doAction(identifier, uuid, minor, major, moment().format(TIME_FORMAT))

    Beacons.startMonitoringForRegion(regionToMonitor)
      .then(() => console.log('Beacons monitoring started succesfully'))
      .catch((error) =>
        console.log(`Beacons monitoring not started, error: ${error}`),
      )

    DeviceEventEmitter.addListener(
      'regionDidExit',
      ({ identifier, uuid, minor, major }) => {
        console.log('Test')
        const time = moment().format(TIME_FORMAT)
        Beacons.stopMonitoringForRegion(regionToMonitor)
          .then(() => console.log('Beacons monitoring stopped succesfully'))
          .catch((error) =>
            console.log(`Beacons monitoring not stopped, error: ${error}`),
          )
        DeviceEventEmitter.removeListener('regionDidEnter')
        console.log('monitoring - regionDidExit data: ', {
          identifier,
          uuid,
          minor,
          major,
          time,
        })
        this.setState({ foundBeacon: false })
      },
    )
  }

  startRanging() {
    const regionToRange = ({ identifier, uuid } = this.state)


    // Range beacons inside the region
    Beacons.startRangingBeaconsInRegion(regionToRange)
      .then(() => console.log('Beacons ranging started succesfully'))
      .catch((error) =>
        console.log(`Beacons ranging not started, error: ${error}`),
      )

    Beacons.startUpdatingLocation();
    
    DeviceEventEmitter.addListener('beaconsDidRange', (data) => {
      console.log('foundBeacon => ' + this.state.foundBeacon)
			console.log('foundBeacon2 => ' + this.state.foundBeacon2)
      console.log('beaconsDidRange data: ', data)
      if (data.beacons.length > 0) {
        const { foundBeacon } = this.state
        const { bustop } = this.state
        if (!foundBeacon) {
          PushNotification.localNotification({
            title: 'BusFeed',
            message:
              'You are near a bus stop ' +
              bustop +
              ', check for your bus timing!',
          })
        }
        Beacons.stopRangingBeaconsInRegion(identifier, uuid)
          .then(() => console.log('Beacons ranging stopped succesfully'))
          .catch((error) =>
            console.log(`Beacons ranging not stopped, error: ${error}`),
          )
        var beacon = this.nearestBeacon(data.beacons)
        console.log('Selected beacon: ', beacon)
        this.setState({
          major: beacon.major,
          minor: beacon.minor,
          foundBeacon: true,
        })
				this.changefoundBeacon2()
      }
      // console.log('Fk off beacon')
      // Beacons.stopRangingBeaconsInRegion(identifier, uuid)
      // .then(() => console.log('Beacons ranging stopped succesfully'))
      // .catch((error) =>
      //   console.log(`Beacons ranging not stopped, error: ${error}`),
      // )
      // DeviceEventEmitter.removeListener('beaconsDidRange')
    })


  }

  doAction(identifier, uuid, minor, major, time) {
    console.log('GUAN YIN MA BOPI')
    console.log({ identifier, uuid, minor, major, time })
    console.log('Pls WORK')
  }

  nearestBeacon(beacons) {
    console.log('beacons', beacons)
    var i
    var minDistIndex = 0
    var minDist = Number.MAX_VALUE
    for (i = 0; i < beacons.length; i++) {
      if (beacons[i].distance < minDist) {
        minDist = beacons[i].distance
        minDistIndex = i
      }
    }
    return beacons[minDistIndex]
  }
}
