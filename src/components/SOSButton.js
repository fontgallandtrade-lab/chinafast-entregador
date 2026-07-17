import React, { useState } from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  Alert, 
  Linking,
  Vibration,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';

export default function SOSButton({ darkMode, location }) {
  const [pressed, setPressed] = useState(false);

  function handleSOS() {
    setPressed(true);
    Vibration.vibrate([300, 100, 300, 100, 300]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    Alert.alert(
      '🆘 EMERGÊNCIA',
      'Esta ação enviará sua localização para a central de segurança e ligará para o número de emergência.',
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => setPressed(false) },
        { 
          text: 'CHAMAR EMERGÊNCIA', 
          style: 'destructive',
          onPress: () => {
            // Enviar localização (simulado)
            console.log('📍 Localização:', location);
            // Ligar para emergência
            Linking.openURL('tel:190');
            setPressed(false);
          }
        }
      ]
    );
  }

  const styles = getStyles(darkMode);

  return (
    <Pressable 
      style={[styles.button, pressed && styles.buttonPressed]} 
      onPress={handleSOS}
    >
      <Text style={styles.icon}>🆘</Text>
      <Text style={styles.text}>SOS</Text>
    </Pressable>
  );
}

function getStyles(darkMode) {
  return StyleSheet.create({
    button: {
      backgroundColor: '#f44336',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 30,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: 2,
      borderColor: '#fff',
    },
    buttonPressed: {
      transform: [{ scale: 0.95 }],
      backgroundColor: '#d32f2f',
    },
    icon: {
      fontSize: 18,
    },
    text: {
      color: '#fff',
      fontWeight: '900',
      fontSize: 14,
      letterSpacing: 1,
    },
  });
}
