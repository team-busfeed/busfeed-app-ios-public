import React from 'react'
import { View, Text } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { HomeContainer } from '@/Containers'
import tailwind from 'tailwind-rn'


const Navigation = () => (
    <View style={tailwind('flex flex-row')}>
        <View style={tailwind('w-1/2')}>
            <Text style={tailwind('text-gray-600 mx-2')}>
                Bus Stops
            </Text>
        </View>
        <View style={tailwind('w-1/2')}>
            <Text style={tailwind('text-gray-600 mx-2')}>
                Watchlist
            </Text>
        </View>
    </View>
)

export default Navigation