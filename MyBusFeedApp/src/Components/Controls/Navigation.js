import React from 'react'
import { View, Text,     Image, StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { HomeContainer } from '@/Containers'
import tailwind from 'tailwind-rn'

const styles = StyleSheet.create({
    image: {
        // flex: 1, 
        paddingTop: 0,
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
            <Image
                source={require('../../Assets/Images/pin.png')} 
                style={[styles.image, tailwind("mx-20 items-start")]}
            />  
        </View>
        <View style={tailwind('w-1/2')}>
            <Image
                source={require('../../Assets/Images/heart.png')} 
                style={[styles.image, tailwind("mx-20 items-start")]}
            />
        </View>
    </View>
)

export default Navigation