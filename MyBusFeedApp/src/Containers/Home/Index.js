import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { View, ActivityIndicator, Text, TextInput, Button } from 'react-native'
import { Controls } from '@/Components/Controls'
import { ListView } from '@/Components/ListView'
import FetchOne from '@/Store/User/FetchOne'
import { useTranslation } from 'react-i18next'
import ChangeTheme from '@/Store/Theme/ChangeTheme'
import tailwind from 'tailwind-rn'

const HomeContainer = () => {

    return (
        <View style={tailwind('bg-white h-full')}>
            <Controls/>
            <ListView/>
        </View>
    )
}

export default HomeContainer
