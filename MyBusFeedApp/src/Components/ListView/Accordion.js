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
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import externalStyle from '../../../style/externalStyle'
import axios from 'axios'
import { FlatList } from 'react-native-gesture-handler'
import BusTimeBlock from './BusTimeBlock'
import tailwind from 'tailwind-rn'

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
      userProximity: null,
    }

    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
  }

  componentDidMount(){
    this.getUserProximity().then( (data) => {
      console.log("getUserProximity response =>" + data)
      this.setState({
        userProximity: data
      })
    })
    .catch((error) => console.log("error: " + error))
    console.log("ONPRESSTOGGLE -=>" + this.state.userProximity)
  }

  onPressToggle = () => {
    this.toggleExpand()
    this.GetBus()

  }

  // To see if user is in range of bus stop
  getUserProximity() {
    console.log('====================================');
    console.log('getUserProximity');
    console.log(this.state.longitude);
    console.log('====================================');

    const fetchURL = 'https://api.mybusfeed.com/location/getBusStopNo/'.concat(
      this.state.latitude,
      '-',
      this.state.longitude,
      '-',
      this.state.busStopNumber,
    )
    return axios
      .get(fetchURL)
      .then((response) => response.data.status )
      .catch((error) => console.log(error))
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

        var resp = response.data.services

        var loadedServices = {}

        // resp.map(function(service) {
        //     loadedServices[service] = React.createRef()
        // })
        // this.setState({
        //     newServices: loadedServices
        // })

        this.didTapRefresh = () => Object.keys(loadedServices).forEach(function(key) {
            loadedServices[key].current.getBusTiming()
        })

        this.setState({
          // ACTUAL VALUE
          // busStops: response.data,

          // HARDCODED VALUE - use when bus services is null
          busStops: {
            services: ['169', '860', '811'],
          },
        })
        console.log(this.state.busStops)
        console.log(this.state.newServices)
      })
      .catch((error) => {
        console.log('error:', error)
      })

    console.log('onPressGetBus API Exit')
  }

  

  render() {
        var flatList = <FlatList
        data={this.state.busStops.services}
        renderItem={({ item }) => (
        <BusTimeBlock ref={this.state.newServices[item]
        } bus_number={item} busstop_number={this.props.title.busstop_number} data={this.state.data} userProximity={this.state.userProximity}/>
        )}
        keyExtractor={(item) => item}
        />

    return (
      <View>
        <TouchableOpacity
          ref={this.accordian}
          style={styles.row}
          onPress={() => this.onPressToggle()}
        >
          <Text style={[styles.title, styles.font]}>
            {this.props.title.busstop_number} {this.props.title.busstop_name}
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
            <View style={tailwind('flex flex-row')}>
              <Text
                onPress={() => this.didTapRefresh()}>Refresh</Text>
              <Icon
                name={
                'autorenew'
                }
                size={18}
                color="#5E5E5E"
                onPress={() => this.didTapRefresh()}
              />
            </View>

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
