import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { default as Header } from './Header'
import { default as Map } from './Map'
import tailwind from 'tailwind-rn'

const styles = StyleSheet.create({
    card: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,

        elevation: 4,

        backgroundColor: 'white',
        flex: 1,
        borderRadius: 10,
    }
})

const Controls = () => {
    return (
        <View style={tailwind('h-3/5 bg-white px-4 mb-4 mt-4')}>
            <View style={styles.card}>
                <Header/>
                <Map/>
            </View>
        </View>
    )
}

export default Controls