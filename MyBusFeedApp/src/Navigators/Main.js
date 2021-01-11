import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { HomeContainer } from '@/Containers'
import tailwind from 'tailwind-rn'

const Tab = createBottomTabNavigator()

// @refresh reset
const MainNavigator = () => {
    return (
        <Tab.Navigator style={tailwind('h-0')}>
            <Tab.Screen name="Bus Stops" component={HomeContainer} />
        </Tab.Navigator>
    )
}

export default MainNavigator
