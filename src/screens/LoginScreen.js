import { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState(
    'entregador@chinafast.com.br'
  );

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert(
        'Atenção',
        'Informe o e-mail e a senha.'
      );

      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert(
        'Erro no login',
        error.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <View style={styles.logo}>
          <Text style={styles.logoText}>
            🚚
          </Text>
        </View>

        <Text style={styles.brand}>
          ChinaFast
        </Text>

        <Text style={styles.title}>
          Entregador
        </Text>

        <Text style={styles.subtitle}>
          Entre para receber corridas e acompanhar
          seus ganhos.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#8b8b8b"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#8b8b8b"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable
          style={[
            styles.button,
            loading && styles.disabled,
          ]}
          disabled={loading}
          onPress={handleLogin}
        >
          {loading ? (
            <ActivityIndicator
              color="#ffffff"
            />
          ) : (
            <Text style={styles.buttonText}>
              ENTRAR
            </Text>
          )}
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111111',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  logo: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d71920',
  },

  logoText: {
    fontSize: 40,
  },

  brand: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 20,
  },

  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
  },

  subtitle: {
    color: '#b8b8b8',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 30,
  },

  input: {
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#ffffff',
    color: '#111111',
    fontSize: 16,
  },

  button: {
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d71920',
    marginTop: 6,
  },

  disabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
  },
});
