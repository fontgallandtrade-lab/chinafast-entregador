import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PremiumHomeScreen from '../screens/PremiumHomeScreen';
import DeliveryScreen from '../screens/DeliveryScreen';
import WalletScreen from '../screens/WalletScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CouponScreen from '../screens/CouponScreen';
import VehicleScreen from '../screens/VehicleScreen';
import PixKeyScreen from '../screens/PixKeyScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import OperationsScreen from '../screens/OperationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpScreen from '../screens/HelpScreen';

import colors from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ icon, focused }) {
  return (
    <Text style={[styles.icon, focused && styles.iconActive]}>
      {icon}
    </Text>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#eef4fa',
          paddingBottom: insets.bottom || 8,
          paddingTop: 8,
          height: 60 + (insets.bottom || 0),
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#7a8fa5',
      }}
    >
      <Tab.Screen
        name="Home"
        component={PremiumHomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Corrida"
        component={DeliveryScreen}
        options={{
          tabBarLabel: 'Corrida',
          tabBarIcon: ({ focused }) => <TabIcon icon="🛵" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Carteira"
        component={WalletScreen}
        options={{
          tabBarLabel: 'Carteira',
          tabBarIcon: ({ focused }) => <TabIcon icon="💰" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Histórico"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'Histórico',
          tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Cupom"
        component={CouponScreen}
        options={{
          tabBarLabel: 'Cupom',
          tabBarIcon: ({ focused }) => (
            <View style={styles.couponTab}>
              <Text style={[styles.icon, focused && styles.iconActive]}>🍱</Text>
              {focused && <View style={styles.couponActiveIndicator} />}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function PremiumNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Veículo" component={VehicleScreen} />
      <Stack.Screen name="Chave Pix" component={PixKeyScreen} />
      <Stack.Screen name="Documentos" component={DocumentsScreen} />
      <Stack.Screen name="Central Operacional" component={OperationsScreen} />
      <Stack.Screen name="Configurações" component={SettingsScreen} />
      <Stack.Screen name="Ajuda" component={HelpScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 22,
  },
  iconActive: {
    color: colors.primary,
  },
  couponTab: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  couponActiveIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});
