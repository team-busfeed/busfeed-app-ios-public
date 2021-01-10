import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { HomeContainer } from '@/Containers'

const Tab = createBottomTabNavigator()

// @refresh reset
const MainNavigator = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Bus Stops" component={HomeContainer} />
            <Tab.Screen name="Favourites" component={HomeContainer} />
        </Tab.Navigator>
    )
}

export default MainNavigator
