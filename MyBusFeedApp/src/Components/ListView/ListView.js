import React, { Component } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import externalStyle from '../../../style/externalStyle'
import tailwind from 'tailwind-rn'
import Icon from 'react-native-vector-icons/Entypo'
import Geolocation from '@react-native-community/geolocation'
import axios from 'axios'
import Accordion from './Accordion'

class ListView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      latitude: 1.3521,
      longitude: 103.8198,
      userProximity: false,
      busService: [],
    }
  }

  render() {
    return (
      <View style={tailwind('h-64 bg-white px-2 pb-7')}>
        <FlatList
          data={this.props.states.busStops}
          renderItem={({ item }) => (
            <Accordion title={item} data={item} />
          )}
          keyExtractor={(item) => item.busstop_number}
        />
      </View>
    )
  }
}

export default ListView
