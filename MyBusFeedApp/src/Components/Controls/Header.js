import React from 'react'
import { View, Text, TextInput, Button, StyleSheet } from 'react-native'
import tailwind from 'tailwind-rn'
import { WebView } from 'react-native-webview'
import Icon from 'react-native-vector-icons/FontAwesome';

const styles = StyleSheet.create({
    controls: {
        padding: 0, 
        marginTop: 5,
    },
});

const Header = () => {
  
    return (
        <View style={tailwind('m-3 bg-white')}>
            <View style={tailwind('flex flex-row')}>
                <View style={tailwind('w-64')}>
                    <Text style={tailwind('text-xl font-semibold text-gray-600 mx-2')}>
                        Bus Locator
                    </Text>
                </View>
                    <Icon name="search" size={20} color="grey" style={[tailwind("w-1/5"), styles.controls]}/>
                    <Icon name="ellipsis-v" size={20} color="grey" style={[tailwind("w-1/5"), styles.controls]}/>
                <View style={tailwind('w-1/5')}>
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