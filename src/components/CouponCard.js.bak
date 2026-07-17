import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Animated,
} from 'react-native';
import { CouponSystem } from '../utils/CouponSystem';

export default function CouponCard({ darkMode, onDeliveryComplete }) {
  const [coupon, setCoupon] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [showCoupon, setShowCoupon] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    loadCoupon();
    const interval = setInterval(loadCoupon, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadCoupon = async () => {
    const data = await CouponSystem.getTodayCoupon();
    setCoupon(data);
    
    if (data) {
      setTimeLeft(CouponSystem.getTimeUntilExpiration());
    }
  };

  const handleGenerateCoupon = async () => {
    const result = await CouponSystem.generateCouponOnOnline('entregador');
    
    if (result.generated) {
      setCoupon(result.coupon);
      Alert.alert(
        '🎉 Cupom Gerado!',
        `🍱 Você ganhou um marmitex de R$ 10,00 no Dellys Lanches!\n\n📌 Código: ${result.coupon.code}\n⏰ Válido até as 13:00\n📍 Dellys Lanches`
      );
    } else {
      Alert.alert('⏰', result.message);
    }
  };

  const handleUseCoupon = () => {
    Alert.alert(
      '🍱 Usar Cupom',
      `Você está usando o cupom:\n📌 ${coupon?.code}\n💰 R$ 10,00\n📍 Dellys Lanches\n\nConfirme com o estabelecimento?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: '✅ Usar', 
          onPress: async () => {
            const result = await CouponSystem.useCoupon(coupon?.code);
            Alert.alert(result.success ? '✅ Sucesso!' : '❌ Erro', result.message);
            if (result.success) {
              setCoupon(null);
            }
          }
        }
      ]
    );
  };

  const styles = getStyles(darkMode);

  useEffect(() => {
    if (coupon) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [coupon]);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      {coupon ? (
        <View style={[styles.couponActive, darkMode && styles.couponActiveDark]}>
          <View style={styles.couponHeader}>
            <Text style={styles.couponEmoji}>🍱</Text>
            <View style={styles.couponInfo}>
              <Text style={[styles.couponTitle, darkMode && styles.textLight]}>
                Marmitex R$ 10,00
              </Text>
              <Text style={[styles.couponSub, darkMode && styles.textSecondary]}>
                Dellys Lanches
              </Text>
            </View>
          </View>
          
          <View style={styles.couponCodeContainer}>
            <Text style={[styles.couponCode, darkMode && styles.textLight]}>
              {coupon.code}
            </Text>
          </View>
          
          <View style={styles.couponFooter}>
            <Text style={[styles.couponTime, darkMode && styles.textSecondary]}>
              {timeLeft}
            </Text>
            <Pressable style={styles.couponButton} onPress={handleUseCoupon}>
              <Text style={styles.couponButtonText}>🍽️ USAR</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={[styles.couponInactive, darkMode && styles.couponInactiveDark]}>
          <Text style={styles.couponEmoji}>🎯</Text>
          <Text style={[styles.couponInactiveTitle, darkMode && styles.textLight]}>
            Complete uma entrega antes das 13h
          </Text>
          <Text style={[styles.couponInactiveSub, darkMode && styles.textSecondary]}>
            Ganhe um marmitex de R$ 10,00 no Dellys Lanches!
          </Text>
          <Pressable style={styles.couponGenerateButton} onPress={handleGenerateCoupon}>
            <Text style={styles.couponGenerateButtonText}>🍱 GERAR CUPOM</Text>
          </Pressable>
        </View>
      )}
    </Animated.View>
  );
}

function getStyles(darkMode) {
  const bgCard = darkMode ? '#1e2d4a' : '#f9fcff';
  const bgSecondary = darkMode ? '#1a2740' : '#ffffff';
  const textPrimary = darkMode ? '#e8edf5' : '#1e2b3a';
  const textSecondary = darkMode ? '#b0c4db' : '#4a5a6e';
  const borderColor = darkMode ? '#2a3a5a' : '#eef4fa';

  return StyleSheet.create({
    container: {
      marginHorizontal: 12,
      marginVertical: 8,
    },
    couponActive: {
      backgroundColor: '#fff3e0',
      borderRadius: 16,
      padding: 16,
      borderWidth: 2,
      borderColor: '#ff6f00',
      borderStyle: 'dashed',
    },
    couponActiveDark: {
      backgroundColor: '#2a1f0a',
      borderColor: '#ff8f00',
    },
    couponInactive: {
      backgroundColor: bgCard,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: borderColor,
      alignItems: 'center',
    },
    couponInactiveDark: {
      backgroundColor: bgSecondary,
    },
    couponHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 8,
    },
    couponEmoji: {
      fontSize: 28,
    },
    couponInfo: {
      flex: 1,
    },
    couponTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#e65100',
    },
    couponSub: {
      fontSize: 13,
      color: textSecondary,
    },
    couponCodeContainer: {
      backgroundColor: '#fff8e1',
      borderRadius: 8,
      padding: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: '#ffcc02',
    },
    couponCode: {
      fontSize: 18,
      fontWeight: '800',
      color: '#e65100',
      textAlign: 'center',
      letterSpacing: 1,
    },
    couponFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    couponTime: {
      fontSize: 13,
      color: textSecondary,
      fontWeight: '600',
    },
    couponButton: {
      backgroundColor: '#ff6f00',
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 30,
    },
    couponButtonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 13,
      letterSpacing: 0.5,
    },
    couponInactiveTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: textPrimary,
      textAlign: 'center',
      marginTop: 4,
    },
    couponInactiveSub: {
      fontSize: 13,
      color: textSecondary,
      textAlign: 'center',
      marginTop: 2,
      marginBottom: 12,
    },
    couponGenerateButton: {
      backgroundColor: '#c72a2a',
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 30,
    },
    couponGenerateButtonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 14,
      letterSpacing: 0.5,
    },
    textLight: {
      color: textPrimary,
    },
    textSecondary: {
      color: textSecondary,
    },
  });
}
