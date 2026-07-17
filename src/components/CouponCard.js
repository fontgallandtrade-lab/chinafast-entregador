import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Animated,
  TouchableOpacity,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CouponSystem } from '../utils/CouponSystem';

const COUPON_VIEWED_KEY = '@chinafast:coupon_viewed';

export default function CouponCard({ darkMode }) {
  const [coupon, setCoupon] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [showFullCard, setShowFullCard] = useState(false);
  const [hasBeenViewed, setHasBeenViewed] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Verificar se já viu o cupom hoje
  useEffect(() => {
    checkIfViewedToday();
    loadCoupon();
    
    const interval = setInterval(() => {
      loadCoupon();
      checkExpiration();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkIfViewedToday = async () => {
    try {
      const today = new Date().toDateString();
      const viewed = await AsyncStorage.getItem(COUPON_VIEWED_KEY);
      if (viewed === today) {
        setHasBeenViewed(true);
        setShowFullCard(false);
      } else {
        setHasBeenViewed(false);
      }
    } catch (error) {
      console.log('Erro ao verificar visualização:', error);
    }
  };

  const markAsViewedToday = async () => {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem(COUPON_VIEWED_KEY, today);
      setHasBeenViewed(true);
    } catch (error) {
      console.log('Erro ao marcar visualização:', error);
    }
  };

  const loadCoupon = async () => {
    const data = await CouponSystem.getTodayCoupon();
    setCoupon(data);
    
    if (data) {
      const time = CouponSystem.getTimeUntilExpiration();
      setTimeLeft(time);
      
      // Verificar se expirou
      if (time.includes('expirado') || data.status === 'used') {
        setIsExpired(true);
        // Se expirou, não mostrar mais
        if (showFullCard) {
          setShowFullCard(false);
        }
      } else {
        setIsExpired(false);
        // Se não foi visto hoje e tem cupom válido, mostrar animação
        if (!hasBeenViewed && !showFullCard) {
          showCouponAnimation();
        }
      }
    } else {
      setShowFullCard(false);
    }
  };

  const checkExpiration = () => {
    const now = new Date();
    const expires = new Date();
    expires.setHours(13, 0, 0, 0);
    
    if (now > expires && coupon) {
      setIsExpired(true);
      setShowFullCard(false);
    }
  };

  // Animação de entrada do cupom
  const showCouponAnimation = () => {
    setShowFullCard(true);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Marcar como visto
    markAsViewedToday();

    // Esconder após 5 segundos
    setTimeout(() => {
      hideCouponAnimation();
    }, 5000);
  };

  // Animação de saída do cupom
  const hideCouponAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowFullCard(false);
      // Mostrar ícone no rodapé
      startPulseAnimation();
    });
  };

  // Animação de pulso para o ícone do rodapé
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Abrir modal com detalhes do cupom
  const openCouponModal = () => {
    setModalVisible(true);
  };

  const handleGenerateCoupon = async () => {
    const result = await CouponSystem.generateCouponOnOnline('entregador');
    if (result.generated) {
      setCoupon(result.coupon);
      setIsExpired(false);
      Alert.alert(
        '🎉 Cupom Gerado!',
        `🍱 Marmitex R$ 10,00 no Dellys Lanches!\n\n📌 ${result.coupon.code}\n⏰ Válido até 13:00`
      );
      // Mostrar animação novamente
      showCouponAnimation();
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
              setIsExpired(true);
              setShowFullCard(false);
              setModalVisible(false);
            }
          }
        }
      ]
    );
  };

  const styles = getStyles(darkMode);

  // Se não houver cupom e não estiver visível, mostrar apenas ícone mínimo
  if (!coupon && !showFullCard) {
    return (
      <View style={styles.footerIconContainer}>
        <TouchableOpacity onPress={handleGenerateCoupon} style={styles.footerIcon}>
          <Animated.Text style={[styles.footerIconEmoji, { transform: [{ scale: pulseAnim }] }]}>
            🍱
          </Animated.Text>
          <Text style={[styles.footerIconText, darkMode && styles.textSecondary]}>
            Cupom
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Se tiver cupom mas estiver expirado, mostrar ícone normal
  if (isExpired) {
    return (
      <View style={styles.footerIconContainer}>
        <TouchableOpacity onPress={openCouponModal} style={styles.footerIcon}>
          <Text style={styles.footerIconEmoji}>🍱</Text>
          <Text style={[styles.footerIconText, darkMode && styles.textSecondary]}>
            Expirado
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // CARD COMPLETO COM ANIMAÇÃO
  if (showFullCard && coupon && !isExpired) {
    return (
      <>
        <Animated.View 
          style={[
            styles.fullCardContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <View style={[styles.couponActive, darkMode && styles.couponActiveDark]}>
            <View style={styles.couponHeader}>
              <Text style={styles.couponEmoji}>🍱</Text>
              <View style={styles.couponInfo}>
                <Text style={styles.couponTitle}>🎉 Cupom do Dia!</Text>
                <Text style={styles.couponSub}>Marmitex R$ 10,00 - Dellys Lanches</Text>
              </View>
              <TouchableOpacity onPress={hideCouponAnimation} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.couponCodeContainer}>
              <Text style={styles.couponCode}>{coupon.code}</Text>
            </View>
            <View style={styles.couponFooter}>
              <Text style={[styles.couponTime, darkMode && styles.textSecondary]}>
                {timeLeft}
              </Text>
              <TouchableOpacity style={styles.couponButton} onPress={handleUseCoupon}>
                <Text style={styles.couponButtonText}>🍽️ USAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Ícone no rodapé enquanto o card está visível */}
        <View style={styles.footerIconContainer}>
          <TouchableOpacity onPress={openCouponModal} style={styles.footerIcon}>
            <Text style={styles.footerIconEmoji}>🍱</Text>
            <Text style={[styles.footerIconText, darkMode && styles.textSecondary]}>
              Cupom
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modal de Detalhes do Cupom */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, darkMode && styles.modalBoxDark]}>
              <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalCloseText, darkMode && styles.textLight]}>✕</Text>
              </TouchableOpacity>
              
              <Text style={[styles.modalTitle, darkMode && styles.textLight]}>🍱 Meu Cupom</Text>
              
              {coupon && !isExpired ? (
                <>
                  <View style={styles.modalCouponCard}>
                    <Text style={styles.modalCouponValue}>R$ 10,00</Text>
                    <Text style={[styles.modalCouponSub, darkMode && styles.textSecondary]}>
                      Marmitex no Dellys Lanches
                    </Text>
                    <View style={styles.modalCouponCode}>
                      <Text style={styles.modalCouponCodeText}>{coupon.code}</Text>
                    </View>
                    <Text style={[styles.modalCouponTime, darkMode && styles.textSecondary]}>
                      {timeLeft}
                    </Text>
                  </View>
                  
                  <TouchableOpacity style={styles.modalButton} onPress={handleUseCoupon}>
                    <Text style={styles.modalButtonText}>🍽️ USAR CUPOM</Text>
                  </TouchableOpacity>
                  
                  <Text style={[styles.modalInfo, darkMode && styles.textSecondary]}>
                    ⏰ Válido apenas hoje até às 13:00
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.modalEmpty, darkMode && styles.textLight]}>
                    📭 Nenhum cupom disponível hoje
                  </Text>
                  <Text style={[styles.modalEmptySub, darkMode && styles.textSecondary]}>
                    Fique online antes das 13h para garantir seu marmitex!
                  </Text>
                  <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ff6f00' }]} onPress={handleGenerateCoupon}>
                    <Text style={styles.modalButtonText}>🔄 GERAR CUPOM</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </>
    );
  }

  // Ícone no rodapé (quando o card não está visível)
  return (
    <>
      <View style={styles.footerIconContainer}>
        <TouchableOpacity onPress={openCouponModal} style={styles.footerIcon}>
          <Animated.Text style={[styles.footerIconEmoji, { transform: [{ scale: pulseAnim }] }]}>
            🍱
          </Animated.Text>
          <Text style={[styles.footerIconText, darkMode && styles.textSecondary]}>
            Cupom
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Detalhes */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, darkMode && styles.modalBoxDark]}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
              <Text style={[styles.modalCloseText, darkMode && styles.textLight]}>✕</Text>
            </TouchableOpacity>
            
            <Text style={[styles.modalTitle, darkMode && styles.textLight]}>🍱 Meu Cupom</Text>
            
            {coupon && !isExpired ? (
              <>
                <View style={styles.modalCouponCard}>
                  <Text style={styles.modalCouponValue}>R$ 10,00</Text>
                  <Text style={[styles.modalCouponSub, darkMode && styles.textSecondary]}>
                    Marmitex no Dellys Lanches
                  </Text>
                  <View style={styles.modalCouponCode}>
                    <Text style={styles.modalCouponCodeText}>{coupon.code}</Text>
                  </View>
                  <Text style={[styles.modalCouponTime, darkMode && styles.textSecondary]}>
                    {timeLeft}
                  </Text>
                </View>
                
                <TouchableOpacity style={styles.modalButton} onPress={handleUseCoupon}>
                  <Text style={styles.modalButtonText}>🍽️ USAR CUPOM</Text>
                </TouchableOpacity>
                
                <Text style={[styles.modalInfo, darkMode && styles.textSecondary]}>
                  ⏰ Válido apenas hoje até às 13:00
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.modalEmpty, darkMode && styles.textLight]}>
                  📭 Nenhum cupom disponível hoje
                </Text>
                <Text style={[styles.modalEmptySub, darkMode && styles.textSecondary]}>
                  Fique online antes das 13h para garantir seu marmitex!
                </Text>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ff6f00' }]} onPress={handleGenerateCoupon}>
                  <Text style={styles.modalButtonText}>🔄 GERAR CUPOM</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

function getStyles(darkMode) {
  const bgSecondary = darkMode ? '#1a2740' : '#ffffff';
  const bgCard = darkMode ? '#1e2d4a' : '#f9fcff';
  const textPrimary = darkMode ? '#e8edf5' : '#1e2b3a';
  const textSecondary = darkMode ? '#b0c4db' : '#4a5a6e';
  const borderColor = darkMode ? '#2a3a5a' : '#eef4fa';

  return StyleSheet.create({
    // Footer Icon
    footerIconContainer: {
      position: 'absolute',
      bottom: 80,
      right: 16,
      zIndex: 999,
    },
    footerIcon: {
      backgroundColor: bgSecondary,
      borderRadius: 30,
      padding: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: borderColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    footerIconEmoji: {
      fontSize: 28,
    },
    footerIconText: {
      fontSize: 10,
      color: textSecondary,
      fontWeight: '600',
      marginTop: 2,
    },

    // Full Card
    fullCardContainer: {
      position: 'absolute',
      top: 100,
      left: 12,
      right: 12,
      zIndex: 1000,
      elevation: 10,
    },
    couponActive: {
      backgroundColor: '#fff3e0',
      borderRadius: 16,
      padding: 16,
      borderWidth: 2,
      borderColor: '#ff6f00',
      borderStyle: 'dashed',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 10,
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
    closeButton: {
      padding: 4,
    },
    closeButtonText: {
      fontSize: 18,
      color: '#999',
      fontWeight: '700',
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
      fontSize: 16,
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
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalBox: {
      backgroundColor: bgSecondary,
      borderRadius: 24,
      padding: 24,
      width: '90%',
      maxWidth: 400,
      borderWidth: 1,
      borderColor: borderColor,
    },
    modalBoxDark: {
      backgroundColor: '#1a2740',
    },
    modalClose: {
      alignSelf: 'flex-end',
      padding: 4,
    },
    modalCloseText: {
      fontSize: 22,
      color: textSecondary,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: textPrimary,
      textAlign: 'center',
      marginBottom: 16,
    },
    modalCouponCard: {
      backgroundColor: '#fff3e0',
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ff6f00',
      marginBottom: 16,
    },
    modalCouponValue: {
      fontSize: 32,
      fontWeight: '800',
      color: '#e65100',
    },
    modalCouponSub: {
      fontSize: 14,
      color: textSecondary,
      marginTop: 4,
    },
    modalCouponCode: {
      backgroundColor: '#fff8e1',
      borderRadius: 8,
      padding: 8,
      marginTop: 12,
      borderWidth: 1,
      borderColor: '#ffcc02',
    },
    modalCouponCodeText: {
      fontSize: 16,
      fontWeight: '800',
      color: '#e65100',
      letterSpacing: 1,
    },
    modalCouponTime: {
      fontSize: 14,
      color: textSecondary,
      marginTop: 8,
    },
    modalButton: {
      backgroundColor: '#c72a2a',
      padding: 14,
      borderRadius: 30,
      alignItems: 'center',
      marginTop: 8,
    },
    modalButtonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
    modalInfo: {
      fontSize: 12,
      color: textSecondary,
      textAlign: 'center',
      marginTop: 12,
    },
    modalEmpty: {
      fontSize: 18,
      fontWeight: '600',
      color: textPrimary,
      textAlign: 'center',
      marginBottom: 8,
    },
    modalEmptySub: {
      fontSize: 14,
      color: textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },
    textLight: {
      color: textPrimary,
    },
    textSecondary: {
      color: textSecondary,
    },
  });
}
