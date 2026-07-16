import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  StyleSheet,
  Text,
} from 'react-native';

import PremiumHomeScreen from '../screens/PremiumHomeScreen';
import DeliveryScreen from '../screens/DeliveryScreen';
import WalletScreen from '../screens/WalletScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

import colors from '../theme/colors';

const Tab = createBottomTabNavigator();

function TabIcon({
  icon,
  focused,
}) {
  return (
    <Text
      style={[
        styles.icon,
        focused && styles.iconActive,
      ]}
    >
      {icon}
    </Text>
  );
}

export default function PremiumNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor:
          colors.text,
        tabBarInactiveTintColor:
          colors.textSecondary,

        tabBarLabelStyle:
          styles.label,

        tabBarStyle: {
          height: 74,
          paddingTop: 7,
          paddingBottom: 10,
          backgroundColor:
            colors.surface,
          borderTopColor:
            colors.border,
        },
      }}
    >
      <Tab.Screen
        name="Início"
        component={PremiumHomeScreen}
        options={{
          tabBarIcon: ({
            focused,
          }) => (
            <TabIcon
              icon="⌂"
              focused={focused}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Corrida"
        component={DeliveryScreen}
        options={{
          tabBarIcon: ({
            focused,
          }) => (
            <TabIcon
              icon="🚚"
              focused={focused}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Carteira"
        component={WalletScreen}
        options={{
          tabBarIcon: ({
            focused,
          }) => (
            <TabIcon
              icon="R$"
              focused={focused}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Histórico"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({
            focused,
          }) => (
            <TabIcon
              icon="☷"
              focused={focused}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: '800',
  },

  icon: {
    color: colors.textSecondary,
    fontSize: 20,
    fontWeight: '900',
  },

  iconActive: {
    color: colors.primary,
  },
});
