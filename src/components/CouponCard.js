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

export default function CouponCard({ darkMode, onCouponUsed }) {
  const [coupon, setCoupon] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const scaleAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    loadCoupon();
    const interval = setInterval(() => {
      loadCoupon();
      checkExpiration();
    }, 30000); // Verifica a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const loadCoupon = async () => {
    const data = await CouponSystem.getTodayCoupon();
    setCoupon(data);
    
    if (data) {
      const time = CouponSystem.getTimeUntilExpiration();
      setTimeLeft(time);
      
      // Verificar se expirou
      if (time.includes('expirado')) {
        setIsExpired(true);
        setIsVisible(false);
        // Remover cupom após 5 segundos
        setTimeout(() => {
          setCoupon(null);
        }, 5000);
      }
      
      // Se o status for 'used', esconder
      if (data.status === 'used') {
        setIsVisible(false);
        setTimeout(() => {
          setCoupon(null);
        }, 3000);
      }
    } else {
      setIsVisible(false);
    }
  };

  const checkExpiration = () => {
    const now = new Date();
    const expires = new Date();
    expires.setHours(13, 0, 0, 0);
    
    if (now > expires && coupon) {
      setIsExpired(true);
      setIsVisible(false);
      setTimeout(() => {
        setCoupon(null);
      }, 5000);
    }
  };

  const handleGenerateCoupon = async () => {
    const result = await CouponSystem.generateCouponOnOnline('entregador');
    if (result.generated) {
      setCoupon(result.coupon);
      setIsVisible(true);
      setIsExpired(false);
      Alert.alert(
        '🎉 Cupom Gerado!',
        `🍱 Marmitex R$ 10,00 no Dellys Lanches!\n\n📌 ${result.coupon.code}\n⏰ Válido até 13:00`
      );
    } else {
      Alert.alert('⏰', result.message);
    }
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
              // Esconder o cupom imediatamente
              setIsVisible(false);
              setCoupon(null);
              // Notificar o componente pai
              if (onCouponUsed) onCouponUsed();
            }
          }
        }
      ]
    );
  };

  const styles = getStyles(darkMode);

  // Se não houver cupom ou não estiver visível, não renderizar nada
  if (!coupon || !isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.couponActive, darkMode && styles.couponActiveDark]}>
        <View style={styles.couponHeader}>
          <Text style={styles.couponEmoji}>🍱</Text>
          <View style={styles.couponInfo}>
            <Text style={styles.couponTitle}>Marmitex R$ 10,00</Text>
            <Text style={styles.couponSub}>Dellys Lanches</Text>
          </View>
        </View>
        <View style={styles.couponCodeContainer}>
          <Text style={styles.couponCode}>{coupon.code}</Text>
        </View>
        <View style={styles.couponFooter}>
          <Text style={[styles.couponTime, isExpired && styles.expiredText]}>
            {isExpired ? '⏰ Expirado!' : timeLeft}
          </Text>
          {!isExpired && (
            <Pressable style={styles.couponButton} onPress={handleUseCoupon}>
              <Text style={styles.couponButtonText}>🍽️ USAR</Text>
            </Pressable>
          )}
        </View>
        {isExpired && (
          <Text style={styles.expiredMessage}>⏰ Cupom expirado - Válido apenas até 13h</Text>
        )}
      </View>
    </Animated.View>
  );
}

function getStyles(darkMode) {
  const bgSecondary = darkMode ? '#1a2740' : '#ffffff';
  const textPrimary = darkMode ? '#e8edf5' : '#1e2b3a';
  const textSecondary = darkMode ? '#b0c4db' : '#4a5a6e';

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
    expiredText: {
      color: '#f44336',
    },
    expiredMessage: {
      fontSize: 12,
      color: '#f44336',
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 4,
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
    },
  });
}
