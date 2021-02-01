import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';
import tailwind from 'tailwind-rn'

const styles = StyleSheet.create({
    image: {
        textAlign: 'center',
        // tintColor: 'black', # to be used to change colour of logos   
    },
    test: {
        borderColor: 'black', 
        borderWidth: 5,
    }
})  

const Navigation = () => (
    <View style={tailwind('flex flex-row')}>
        <View style={tailwind('w-1/2')}>
            <Icon name="map-marker" size={30} color="black" style={[tailwind("my-2"), styles.image]}/>
        </View>
        <View style={tailwind('w-1/2')}>
            <Icon name="heart" size={30} color="black" style={[tailwind("my-2"), styles.image]}/>
        </View>
    </View> 
)

export default Navigation