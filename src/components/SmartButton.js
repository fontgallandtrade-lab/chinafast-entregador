import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';

export default function SmartButton({ 
  status, 
  onPress, 
  darkMode,
  disabled 
}) {
  const getConfig = () => {
    const configs = {
      online: { text: '🟢 FICAR ONLINE', color: '#4caf50' },
      offline: { text: '🔴 FICAR OFFLINE', color: '#f44336' },
      waiting: { text: '⏳ AGUARDANDO', color: '#ff9800' },
      enRoute: { text: '🟡 A CAMINHO', color: '#ffc107' },
      arrived: { text: '📍 JÁ CHEGUEI', color: '#2196f3' },
      completed: { text: '✅ FINALIZAR', color: '#4caf50' },
    };
    return configs[status] || configs.offline;
  };

  const config = getConfig();
  const styles = getStyles(darkMode);

  return (
    <Pressable 
      style={[styles.button, { backgroundColor: config.color }, disabled && styles.disabled]} 
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{config.text}</Text>
    </Pressable>
  );
}

function getStyles(darkMode) {
  return StyleSheet.create({
    button: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 52,
      flex: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    text: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 16,
      letterSpacing: 0.5,
    },
    disabled: {
      opacity: 0.5,
    },
  });
}
