import React, { Component } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import externalStyle from "../../../style/externalStyle"
import tailwind from 'tailwind-rn'    

class ListView extends Component {
    render() {

        return (
            <View style={tailwind('h-64 bg-white px-2 pb-7')}>
                <FlatList
                data={
                    this.props.states.busStops
                }
                renderItem={({item}) => 
                <View style={externalStyle.listViewCard}>
                    <Text>{item.busstop_number} {item.busstop_name}</Text>
                </View>}
                keyExtractor={item => item.busstop_number}
                />
            </View>
        )
    }
}
  
  export default ListView