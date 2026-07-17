import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function PremiumHeader({
  driverName,
  online,
  earningsToday,
  onMenu,
  onThemeToggle,
  darkMode,
}) {
  const styles = getStyles(darkMode);

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <Pressable onPress={onMenu} style={styles.menuButton}>
        <Text style={[styles.menuIcon, darkMode && styles.textLight]}>☰</Text>
      </Pressable>
      <View style={styles.center}>
        <Text style={[styles.name, darkMode && styles.textLight]}>{driverName}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, online ? styles.greenDot : styles.redDot]} />
          <Text style={[styles.statusText, darkMode && styles.textSecondary]}>
            {online ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>
      <View style={styles.rightActions}>
        <Pressable onPress={onThemeToggle} style={styles.themeButton}>
          <Text style={[styles.themeIcon, darkMode && styles.textLight]}>
            {darkMode ? '☀️' : '🌙'}
          </Text>
        </Pressable>
        <Text style={[styles.earnings, darkMode && styles.textLight]}>
          {earningsToday}
        </Text>
      </View>
    </View>
  );
}

function getStyles(darkMode) {
  const bgSecondary = darkMode ? '#1a2740' : '#ffffff';
  const textPrimary = darkMode ? '#e8edf5' : '#1e2b3a';
  const textSecondary = darkMode ? '#b0c4db' : '#4a5a6e';
  const borderColor = darkMode ? '#2a3a5a' : '#eef4fa';

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: bgSecondary,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
    },
    containerDark: { backgroundColor: '#1a2740' },
    menuButton: { padding: 4 },
    menuIcon: { fontSize: 22, color: textPrimary },
    center: { alignItems: 'center' },
    name: { fontSize: 15, fontWeight: '700', color: textPrimary },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 },
    statusDot: { width: 7, height: 7, borderRadius: 3.5 },
    greenDot: { backgroundColor: '#4caf50' },
    redDot: { backgroundColor: '#f44336' },
    statusText: { fontSize: 11, color: textSecondary, fontWeight: '500' },
    rightActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    themeButton: { padding: 4 },
    themeIcon: { fontSize: 18, color: textPrimary },
    earnings: { fontSize: 13, fontWeight: '700', color: textPrimary },
    textLight: { color: textPrimary },
    textSecondary: { color: textSecondary },
  });
}
