import React from 'react'
import { View, StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { HomeContainer } from '@/Containers'

const Tab = createBottomTabNavigator()

const Navigation = () => (
    <Tab.Navigator>
        <Tab.Screen name="Bus Stops" component={HomeContainer} />
        <Tab.Screen name="Favourites" component={HomeContainer} />
    </Tab.Navigator>
)

export default Navigation