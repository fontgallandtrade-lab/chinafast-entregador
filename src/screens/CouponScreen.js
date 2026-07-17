import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CouponSystem } from '../utils/CouponSystem';

export default function CouponScreen({ darkMode }) {
  const [coupon, setCoupon] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadCoupon();
    loadHistory();
    const interval = setInterval(() => {
      loadCoupon();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadCoupon = async () => {
    const data = await CouponSystem.getTodayCoupon();
    setCoupon(data);
    if (data) {
      setTimeLeft(CouponSystem.getTimeUntilExpiration());
    }
  };

  const loadHistory = async () => {
    // Simular histórico de cupons
    const mockHistory = [
      { code: 'MARMI-20260716-001', usedAt: '16/07/2026 12:30', status: 'used' },
      { code: 'MARMI-20260715-002', usedAt: '15/07/2026 11:45', status: 'used' },
      { code: 'MARMI-20260714-003', usedAt: '14/07/2026 10:15', status: 'used' },
    ];
    setHistory(mockHistory);
  };

  const handleUseCoupon = async () => {
    if (!coupon) return;
    
    Alert.alert(
      '🍱 Usar Cupom',
      `Cupom: ${coupon.code}\n💰 R$ 10,00\n📍 Dellys Lanches\n\nConfirmar uso?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: '✅ Usar', 
          onPress: async () => {
            const result = await CouponSystem.useCoupon(coupon.code);
            Alert.alert(result.success ? '✅ Sucesso!' : '❌ Erro', result.message);
            if (result.success) {
              loadCoupon();
            }
          }
        }
      ]
    );
  };

  const handleGenerateCoupon = async () => {
    const result = await CouponSystem.generateCouponOnOnline('entregador');
    if (result.generated) {
      setCoupon(result.coupon);
      Alert.alert('🎉', 'Cupom gerado com sucesso!');
    } else {
      Alert.alert('⏰', result.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCoupon();
    await loadHistory();
    setRefreshing(false);
  };

  const styles = getStyles(darkMode);

  const isExpired = () => {
    if (!coupon) return true;
    const now = new Date();
    const expires = new Date(coupon.expiresAt);
    return now > expires || coupon.status === 'used';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, darkMode && styles.textLight]}>🍱 Meu Cupom</Text>
          <Text style={[styles.subtitle, darkMode && styles.textSecondary]}>
            Ganhe um marmitex de R$ 10,00 no Dellys Lanches
          </Text>
        </View>

        {/* Status do Cupom */}
        <View style={[styles.statusCard, darkMode && styles.statusCardDark]}>
          <Text style={[styles.statusLabel, darkMode && styles.textSecondary]}>Status</Text>
          {coupon && !isExpired() ? (
            <View style={styles.statusActive}>
              <Text style={styles.statusEmoji}>✅</Text>
              <Text style={styles.statusText}>Cupom Ativo</Text>
            </View>
          ) : (
            <View style={styles.statusInactive}>
              <Text style={styles.statusEmoji}>📭</Text>
              <Text style={[styles.statusText, styles.statusInactiveText]}>
                {coupon?.status === 'used' ? 'Cupom já utilizado' : 'Nenhum cupom disponível'}
              </Text>
            </View>
          )}
        </View>

        {/* Cupom Atual */}
        {coupon && !isExpired() ? (
          <View style={[styles.couponCard, darkMode && styles.couponCardDark]}>
            <Text style={styles.couponEmoji}>🍱</Text>
            <Text style={[styles.couponValue, darkMode && styles.textLight]}>R$ 10,00</Text>
            <Text style={[styles.couponRestaurant, darkMode && styles.textSecondary]}>
              Dellys Lanches
            </Text>
            <View style={[styles.couponCodeContainer, darkMode && styles.couponCodeContainerDark]}>
              <Text style={[styles.couponCode, darkMode && styles.textLight]}>
                {coupon.code}
              </Text>
            </View>
            <Text style={[styles.couponTime, darkMode && styles.textSecondary]}>
              {timeLeft}
            </Text>
            <TouchableOpacity style={styles.useButton} onPress={handleUseCoupon}>
              <Text style={styles.useButtonText}>🍽️ USAR CUPOM</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.emptyCard, darkMode && styles.emptyCardDark]}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={[styles.emptyTitle, darkMode && styles.textLight]}>
              Nenhum cupom disponível hoje
            </Text>
            <Text style={[styles.emptySub, darkMode && styles.textSecondary]}>
              Fique online antes das 13h para garantir seu marmitex!
            </Text>
            <TouchableOpacity style={styles.generateButton} onPress={handleGenerateCoupon}>
              <Text style={styles.generateButtonText}>🔄 GERAR CUPOM</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Histórico */}
        <View style={styles.historyContainer}>
          <Text style={[styles.historyTitle, darkMode && styles.textLight]}>
            📋 Histórico de Cupons
          </Text>
          {history.map((item, index) => (
            <View key={index} style={[styles.historyItem, darkMode && styles.historyItemDark]}>
              <View style={styles.historyLeft}>
                <Text style={[styles.historyCode, darkMode && styles.textLight]}>
                  {item.code}
                </Text>
                <Text style={[styles.historyDate, darkMode && styles.textSecondary]}>
                  {item.usedAt}
                </Text>
              </View>
              <View style={[styles.historyStatus, styles.historyStatusUsed]}>
                <Text style={styles.historyStatusText}>✅ Usado</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(darkMode) {
  const bgPrimary = darkMode ? '#0f1a2b' : '#f4f7fc';
  const bgSecondary = darkMode ? '#1a2740' : '#ffffff';
  const bgCard = darkMode ? '#1e2d4a' : '#f9fcff';
  const textPrimary = darkMode ? '#e8edf5' : '#1e2b3a';
  const textSecondary = darkMode ? '#b0c4db' : '#4a5a6e';
  const borderColor = darkMode ? '#2a3a5a' : '#eef4fa';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: bgPrimary,
    },
    header: {
      padding: 20,
      paddingBottom: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: textPrimary,
    },
    subtitle: {
      fontSize: 14,
      color: textSecondary,
      marginTop: 4,
    },
    statusCard: {
      backgroundColor: bgSecondary,
      marginHorizontal: 16,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: borderColor,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusCardDark: {
      backgroundColor: bgCard,
    },
    statusLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: textSecondary,
    },
    statusActive: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statusInactive: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statusEmoji: {
      fontSize: 20,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#4caf50',
    },
    statusInactiveText: {
      color: textSecondary,
    },
    couponCard: {
      backgroundColor: '#fff3e0',
      marginHorizontal: 16,
      marginTop: 16,
      padding: 24,
      borderRadius: 16,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#ff6f00',
      borderStyle: 'dashed',
    },
    couponCardDark: {
      backgroundColor: '#2a1f0a',
      borderColor: '#ff8f00',
    },
    couponEmoji: {
      fontSize: 48,
      marginBottom: 8,
    },
    couponValue: {
      fontSize: 32,
      fontWeight: '800',
      color: '#e65100',
    },
    couponRestaurant: {
      fontSize: 16,
      color: textSecondary,
      marginTop: 4,
    },
    couponCodeContainer: {
      backgroundColor: '#fff8e1',
      borderRadius: 8,
      padding: 10,
      marginTop: 12,
      borderWidth: 1,
      borderColor: '#ffcc02',
    },
    couponCodeContainerDark: {
      backgroundColor: '#1a0f00',
      borderColor: '#ff8f00',
    },
    couponCode: {
      fontSize: 18,
      fontWeight: '800',
      color: '#e65100',
      letterSpacing: 1,
    },
    couponTime: {
      fontSize: 14,
      color: textSecondary,
      marginTop: 8,
    },
    useButton: {
      backgroundColor: '#ff6f00',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 30,
      marginTop: 16,
    },
    useButtonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
    emptyCard: {
      backgroundColor: bgSecondary,
      marginHorizontal: 16,
      marginTop: 16,
      padding: 24,
      borderRadius: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: borderColor,
    },
    emptyCardDark: {
      backgroundColor: bgCard,
    },
    emptyEmoji: {
      fontSize: 48,
      marginBottom: 8,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: textPrimary,
      textAlign: 'center',
    },
    emptySub: {
      fontSize: 14,
      color: textSecondary,
      textAlign: 'center',
      marginTop: 4,
      marginBottom: 16,
    },
    generateButton: {
      backgroundColor: '#c72a2a',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 30,
    },
    generateButtonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
    historyContainer: {
      marginHorizontal: 16,
      marginTop: 20,
    },
    historyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: textPrimary,
      marginBottom: 12,
    },
    historyItem: {
      backgroundColor: bgSecondary,
      padding: 12,
      borderRadius: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
      borderWidth: 1,
      borderColor: borderColor,
    },
    historyItemDark: {
      backgroundColor: bgCard,
    },
    historyLeft: {
      flex: 1,
    },
    historyCode: {
      fontSize: 13,
      fontWeight: '600',
      color: textPrimary,
    },
    historyDate: {
      fontSize: 12,
      color: textSecondary,
      marginTop: 2,
    },
    historyStatus: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },
    historyStatusUsed: {
      backgroundColor: '#e8f5e9',
    },
    historyStatusText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#4caf50',
    },
    textLight: { color: textPrimary },
    textSecondary: { color: textSecondary },
  });
}
