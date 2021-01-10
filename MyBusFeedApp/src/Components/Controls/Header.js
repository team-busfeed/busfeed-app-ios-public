import React from 'react'
import { View, Text, TextInput, Button } from 'react-native'
import tailwind from 'tailwind-rn'
import { WebView } from 'react-native-webview'

const Header = () => {
  
    return (
        <View style={tailwind('m-3 bg-white')}>
            <View style={tailwind('flex flex-row')}>
                <View style={tailwind('w-4/5')}>
                    <Text style={tailwind('text-xl font-semibold text-gray-600 mx-2')}>
                        Bus Locator
                    </Text>
                </View>
                <View style={tailwind('w-1/5')}>
                    
                </View>
                <View style={tailwind('w-1/5')}>
                    
                </View>
            </View>
            
        </View>
    )
}
  
export default Header