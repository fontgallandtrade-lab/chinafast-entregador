import 'react-native-gesture-handler';

import { StatusBar } from 'expo-status-bar';

import {
  DarkTheme,
  NavigationContainer,
} from '@react-navigation/native';

import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import {
  AuthProvider,
  useAuth,
} from './src/context/AuthContext';

import {
  DeliveryProvider,
} from './src/context/DeliveryContext';

import LoadingOverlay from './src/components/LoadingOverlay';
import LoginScreen from './src/screens/LoginScreen';
import PremiumNavigator from './src/navigation/PremiumNavigator';

import colors from './src/theme/colors';

const premiumTheme = {
  ...DarkTheme,

  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
};

function AppContent() {
  const {
    signedIn,
    initializing,
  } = useAuth();

  if (initializing) {
    return (
      <LoadingOverlay
        message="Abrindo ChinaFast Premium..."
      />
    );
  }

  if (!signedIn) {
    return <LoginScreen />;
  }

  return (
    <DeliveryProvider>
      <NavigationContainer
        theme={premiumTheme}
      >
        <StatusBar
          style="light"
          backgroundColor={
            colors.background
          }
        />

        <PremiumNavigator />
      </NavigationContainer>
    </DeliveryProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
