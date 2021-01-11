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
        marginTop: 5,
        paddingTop: 8,
        marginBottom: 5,
        paddingBottom: 8,
        marginLeft: 8,
        paddingLeft: 8,
        marginRight: 8,
        paddingRight: 8,
        height: 50
    }
})

const ListView = () => {
    return (
      <View style={tailwind('h-64 bg-white px-2 pb-7')}>
        <FlatList
          data={[
            {key: '03019', name: 'Blk 319'},
            {key: '04019', name: 'Marymount View'},
            {key: '05019', name: 'Shunfu Est'},
            {key: '06019', name: 'aaa'},
            {key: '07019', name: 'aaa'},
            {key: '08019', name: 'aaa'},
            {key: '09019', name: 'aaa'},
            {key: '10019', name: 'aaa'},
            {key: '11019', name: 'aaa'},
            {key: '12019', name: 'aaa'},
          ]}
          renderItem={({item}) => 
          <View style={styles.card}>
            <Text>{item.key} {item.name}</Text>
          </View>}
        />
      </View>
    )
}
  
  export default ListView