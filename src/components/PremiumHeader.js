import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import colors from '../theme/colors';

export default function PremiumHeader({
  driverName = 'Entregador',
  online = true,
  earningsToday = 'R$ 0,00',
  onMenu,
}) {
  return (
    <View style={styles.container}>

      <View style={styles.topRow}>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={onMenu}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <View style={styles.logoArea}>
          <Text style={styles.logo}>
            ChinaFast
          </Text>
        </View>

        <View style={styles.statusArea}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: online
                  ? colors.success
                  : colors.danger,
              },
            ]}
          />

          <Text style={styles.status}>
            {online ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </View>

      </View>

      <View style={styles.info}>

        <Text style={styles.hello}>
          Boa viagem,
        </Text>

        <Text style={styles.driver}>
          {driverName}
        </Text>

        <Text style={styles.money}>
          Hoje: {earningsToday}
        </Text>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{

    backgroundColor:colors.surface,

    paddingTop:50,

    paddingHorizontal:20,

    paddingBottom:20,

    borderBottomLeftRadius:25,

    borderBottomRightRadius:25

  },

  topRow:{

    flexDirection:'row',

    alignItems:'center',

    justifyContent:'space-between'

  },

  menuButton:{

    width:45,

    height:45,

    borderRadius:22,

    backgroundColor:colors.background,

    justifyContent:'center',

    alignItems:'center'

  },

  menuIcon:{

    color:'#fff',

    fontSize:22

  },

  logoArea:{

    flex:1,

    alignItems:'center'

  },

  logo:{

    color:'#fff',

    fontSize:24,

    fontWeight:'bold'

  },

  statusArea:{

    flexDirection:'row',

    alignItems:'center'

  },

  dot:{

    width:10,

    height:10,

    borderRadius:5,

    marginRight:6

  },

  status:{

    color:'#fff',

    fontWeight:'bold'

  },

  info:{

    marginTop:20

  },

  hello:{

    color:colors.textSecondary,

    fontSize:14

  },

  driver:{

    color:'#fff',

    fontSize:28,

    fontWeight:'bold',

    marginTop:5

  },

  money:{

    color:colors.success,

    fontSize:18,

    marginTop:8,

    fontWeight:'bold'

  }

});
