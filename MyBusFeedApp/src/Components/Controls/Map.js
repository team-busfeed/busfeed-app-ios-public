import React from 'react'
import { View, StyleSheet } from 'react-native'
import MapView from 'react-native-maps'
import tailwind from 'tailwind-rn'

const Map = () => (
   <View>
        <MapView
            style={tailwind('h-80')}
            initialRegion={{
                latitude: 1.3521,
                longitude: 103.8198,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }}
        />
   </View>
)

export default Map