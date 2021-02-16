import {StyleSheet} from 'react-native' 

const externalStyle=StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 22
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },
    listViewCard: {
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
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    },
    
    controlsCard: {
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

export default externalStyle;