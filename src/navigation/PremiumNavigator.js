import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  StyleSheet,
  Text,
} from 'react-native';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

  const bottomSpace = Math.max(
    insets.bottom,
    10
  );

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

        tabBarItemStyle:
          styles.tabItem,

        tabBarStyle: {
          height: 64 + bottomSpace,

          paddingTop: 7,

          paddingBottom:
            bottomSpace,

          backgroundColor:
            colors.surface,

          borderTopWidth: 1,

          borderTopColor:
            colors.border,

          elevation: 18,

          shadowColor: '#000000',

          shadowOffset: {
            width: 0,
            height: -3,
          },

          shadowOpacity: 0.2,

          shadowRadius: 7,
        },
      }}
    >
      <Tab.Screen
        name="Início"
        component={PremiumHomeScreen}
        options={{
          tabBarLabel: 'Início',

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
          tabBarLabel: 'Corrida',

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
          tabBarLabel: 'Carteira',

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
          tabBarLabel: 'Histórico',

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
  tabItem: {
    paddingTop: 1,
  },

  label: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 1,
  },

  icon: {
    color: colors.textSecondary,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
  },

  iconActive: {
    color: colors.primary,
  },
});
