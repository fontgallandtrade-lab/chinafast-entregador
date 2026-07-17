import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DailyProgress({ 
  todayDeliveries = 8, 
  goal = 15, 
  earnings = 120,
  darkMode 
}) {
  const percentage = Math.min((todayDeliveries / goal) * 100, 100);
  const remaining = Math.max(goal - todayDeliveries, 0);

  const styles = getStyles(darkMode);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Meta de hoje</Text>
        <Text style={styles.goal}>{todayDeliveries} / {goal} entregas</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${percentage}%` }]} />
      </View>

      <View style={styles.stats}>
        <Text style={styles.statsText}>💰 R$ {earnings.toFixed(2)} ganhos</Text>
        <Text style={styles.statsText}>🏆 Faltam {remaining} para bônus</Text>
      </View>
    </View>
  );
}

function getStyles(darkMode) {
  const bgCard = darkMode ? '#1e2d4a' : '#f9fcff';
  const textPrimary = darkMode ? '#e8edf5' : '#1e2b3a';
  const textSecondary = darkMode ? '#b0c4db' : '#4a5a6e';
  const borderColor = darkMode ? '#2a3a5a' : '#eef4fa';

  return StyleSheet.create({
    container: {
      backgroundColor: bgCard,
      margin: 12,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: borderColor,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: textPrimary,
    },
    goal: {
      fontSize: 14,
      fontWeight: '600',
      color: '#c72a2a',
    },
    progressContainer: {
      height: 8,
      backgroundColor: borderColor,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 10,
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#4caf50',
      borderRadius: 4,
    },
    stats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statsText: {
      fontSize: 13,
      color: textSecondary,
    },
  });
}
