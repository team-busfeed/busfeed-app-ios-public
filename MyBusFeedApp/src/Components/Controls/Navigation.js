import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { HomeContainer } from '@/Containers'
import Icon from 'react-native-vector-icons/FontAwesome';
import tailwind from 'tailwind-rn'

const styles = StyleSheet.create({
    image: {
        // flex: 1, 
        marginTop: 20,
        width: 30, 
        height: 30,
        resizeMode: 'contain',
        alignItems: 'center',
        justifyContent: 'center',
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
            <Icon name="map-marker" size={30} color="black" style={[tailwind("mx-20")]}/>
        </View>
        <View style={tailwind('w-1/2')}>
            <Icon name="heart" size={30} color="black" style={[tailwind("mx-16")]}/>
        </View>
    </View>
)

export default Navigation