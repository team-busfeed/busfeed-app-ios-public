import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { default as Header } from './Header'
import { default as Map } from './Map'
import tailwind from 'tailwind-rn'

const Controls = () => {
    return (
        <View style={tailwind('h-4/6 bg-white px-2')}>
            <View style={tailwind('h-full bg-white border-gray-800 border-2 w-full rounded-lg')}>
                <Header/>
                <Map/>
            </View>
        </View>
    )
}

export default Controls