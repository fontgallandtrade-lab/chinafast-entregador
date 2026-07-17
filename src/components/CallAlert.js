import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Vibration,
  Dimensions,
  Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function CallAlert({ 
  visible, 
  delivery, 
  onAccept, 
  onReject,
  darkMode 
}) {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!visible) {
      setTimeLeft(30);
      return;
    }

    // Vibração forte ao receber chamada
    Vibration.vibrate([500, 200, 500, 200, 500]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Timer regressivo
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onReject();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible]);

  const styles = getStyles(darkMode);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>📱</Text>
          <Text style={styles.title}>NOVA CORRIDA!</Text>
          
          <View style={styles.timerContainer}>
            <Text style={styles.timer}>⏱️ {timeLeft}s</Text>
            <View style={[styles.timerBar, { width: `${(timeLeft / 30) * 100}%` }]} />
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>📍 {delivery?.distance || '2.5 km'} de distância</Text>
            <Text style={styles.infoText}>💰 R$ {delivery?.value || '15,00'}</Text>
            <Text style={styles.infoText}>📦 {delivery?.items || '1'} pacote(s)</Text>
          </View>

          <View style={styles.buttons}>
            <Pressable 
              style={[styles.btn, styles.btnAccept]} 
              onPress={() => {
                Vibration.vibrate(100);
                onAccept();
              }}
            >
              <Text style={styles.btnText}>✅ ACEITAR</Text>
            </Pressable>
            <Pressable 
              style={[styles.btn, styles.btnReject]} 
              onPress={() => {
                Vibration.vibrate(200);
                onReject();
              }}
            >
              <Text style={styles.btnText}>❌ RECUSAR</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function getStyles(darkMode) {
  const bgSecondary = darkMode ? '#1a2740' : '#ffffff';
  const textPrimary = darkMode ? '#e8edf5' : '#1e2b3a';
  const textSecondary = darkMode ? '#b0c4db' : '#4a5a6e';
  
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.85)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      backgroundColor: bgSecondary,
      borderRadius: 30,
      padding: 28,
      width: width * 0.88,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#c72a2a',
      shadowColor: '#c72a2a',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    emoji: {
      fontSize: 48,
      marginBottom: 4,
    },
    title: {
      fontSize: 28,
      fontWeight: '900',
      color: '#c72a2a',
      marginBottom: 8,
      letterSpacing: 1,
    },
    timerContainer: {
      width: '100%',
      marginBottom: 16,
    },
    timer: {
      fontSize: 16,
      color: textPrimary,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 4,
    },
    timerBar: {
      height: 4,
      backgroundColor: '#c72a2a',
      borderRadius: 2,
      alignSelf: 'flex-start',
    },
    infoContainer: {
      width: '100%',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: '#eef4fa',
      marginBottom: 16,
    },
    infoText: {
      fontSize: 16,
      color: textPrimary,
      textAlign: 'center',
      paddingVertical: 4,
      fontWeight: '500',
    },
    buttons: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    },
    btn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 30,
      alignItems: 'center',
    },
    btnAccept: {
      backgroundColor: '#4caf50',
    },
    btnReject: {
      backgroundColor: '#f44336',
    },
    btnText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
      letterSpacing: 0.5,
    },
  });
}
