import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { HomeContainer } from '@/Containers'
// import { View } from 'react-native'

const Tab = createBottomTabNavigator()

// @refresh reset
const MainNavigator = () => {
    return (
        <HomeContainer/>
    )
}

export default MainNavigator
