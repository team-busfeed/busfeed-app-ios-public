import React from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import tailwind from 'tailwind-rn'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 22
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },
})

const ListView = () => {
    return (
      <View style={tailwind('h-2/6 bg-white px-2')}>
        <FlatList
          data={[
            {key: 'Devin', name: 'aaa'},
            {key: 'Dan'},
            {key: 'Dominic'},
            {key: 'Jackson'},
            {key: 'James'},
            {key: 'Joel'},
            {key: 'John'},
            {key: 'Jillian'},
            {key: 'Jimmy'},
            {key: 'Julie'},
          ]}
          renderItem={({item}) => <Text style={styles.item}>{item.key}{item.name}</Text>}
        />
      </View>
    )
}
  
  export default ListView