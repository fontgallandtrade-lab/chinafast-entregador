import { StatusBar } from 'expo-status-bar';

import {
  NavigationContainer,
  DarkTheme,
} from '@react-navigation/native';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  StyleSheet,
  Text,
} from 'react-native';

import {
  AuthProvider,
  useAuth,
} from './src/context/AuthContext';

import {
  DeliveryProvider,
} from './src/context/DeliveryContext';

import LoadingOverlay from './src/components/LoadingOverlay';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import DeliveryScreen from './src/screens/DeliveryScreen';
import WalletScreen from './src/screens/WalletScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#d71920',
    background: '#111111',
    card: '#191919',
    text: '#ffffff',
    border: '#2d2d2d',
  },
};

function TabIcon({ icon, focused }) {
  return (
    <Text
      style={[
        styles.tabIcon,
        focused && styles.tabIconActive,
      ]}
    >
      {icon}
    </Text>
  );
}

function AppNavigation() {
  const {
    signedIn,
    initializing,
  } = useAuth();

  if (initializing) {
    return (
      <LoadingOverlay message="Abrindo ChinaFast..." />
    );
  }

  if (!signedIn) {
    return <LoginScreen />;
  }

  return (
    <DeliveryProvider>
      <NavigationContainer
        theme={navigationTheme}
      >
        <StatusBar style="light" />

        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: '#ffffff',
            tabBarInactiveTintColor: '#8d8d8d',
            tabBarLabelStyle:
              styles.tabLabel,
          }}
        >
          <Tab.Screen
            name="Início"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ focused }) => (
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
              tabBarIcon: ({ focused }) => (
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
              tabBarIcon: ({ focused }) => (
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
              tabBarIcon: ({ focused }) => (
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
              tabBarIcon: ({ focused }) => (
                <TabIcon
                  icon="●"
                  focused={focused}
                />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </DeliveryProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 72,
    paddingTop: 7,
    paddingBottom: 8,
    backgroundColor: '#191919',
    borderTopColor: '#2b2b2b',
  },

  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
  },

  tabIcon: {
    color: '#8d8d8d',
    fontSize: 20,
    fontWeight: '900',
  },

  tabIconActive: {
    color: '#d71920',
  },
});
