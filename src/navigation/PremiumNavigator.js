import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

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

import VehicleScreen from '../screens/VehicleScreen';
import PixKeyScreen from '../screens/PixKeyScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import OperationsScreen from '../screens/OperationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpScreen from '../screens/HelpScreen';

import colors from '../theme/colors';

const Tab =
  createBottomTabNavigator();

const Stack =
  createNativeStackNavigator();

function TabIcon({
  icon,
  focused,
}) {
  return (
    <Text
      style={[
        styles.icon,
        focused &&
          styles.iconActive,
      ]}
    >
      {icon}
    </Text>
  );
}

function MainTabs() {
  const insets =
    useSafeAreaInsets();

  const bottomSpace =
    Math.max(
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
          height:
            64 + bottomSpace,

          paddingTop: 7,

          paddingBottom:
            bottomSpace,

          backgroundColor:
            colors.surface,

          borderTopWidth: 1,

          borderTopColor:
            colors.border,

          elevation: 18,
        },
      }}
    >
      <Tab.Screen
        name="Início"
        component={
          PremiumHomeScreen
        }
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
        component={
          DeliveryScreen
        }
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
        component={
          WalletScreen
        }
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
        component={
          HistoryScreen
        }
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
        component={
          ProfileScreen
        }
        options={{
          tabBarButton:
            () => null,
        }}
      />
    </Tab.Navigator>
  );
}

export default function PremiumNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation:
          'slide_from_right',
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
      />

      <Stack.Screen
        name="Veículo"
        component={VehicleScreen}
      />

      <Stack.Screen
        name="Chave Pix"
        component={PixKeyScreen}
      />

      <Stack.Screen
        name="Documentos"
        component={DocumentsScreen}
      />

      <Stack.Screen
        name="Central Operacional"
        component={OperationsScreen}
      />

      <Stack.Screen
        name="Configurações"
        component={SettingsScreen}
      />

      <Stack.Screen
        name="Ajuda"
        component={HelpScreen}
      />
    </Stack.Navigator>
  );
}

const styles =
  StyleSheet.create({
    tabItem: {
      paddingTop: 1,
    },

    label: {
      fontSize: 11,
      fontWeight: '800',
      marginTop: 1,
    },

    icon: {
      color:
        colors.textSecondary,
      fontSize: 20,
      lineHeight: 24,
      fontWeight: '900',
    },

    iconActive: {
      color:
        colors.primary,
    },
  });
