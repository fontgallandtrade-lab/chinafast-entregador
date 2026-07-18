import React, { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  Vibration,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import PremiumHeader from '../components/PremiumHeader';
import PremiumMap from '../components/PremiumMap';
import SideMenu from '../components/SideMenu';
import CallAlert from '../components/CallAlert';
import SmartButton from '../components/SmartButton';
import SOSButton from '../components/SOSButton';
import DailyProgress from '../components/DailyProgress';
import CouponCard from '../components/CouponCard';
import { CouponSystem } from '../utils/CouponSystem';
import useSound from '../hooks/useSound';

import { useAuth } from '../context/AuthContext';
import { useDeliveries } from '../context/DeliveryContext';
import useLocationTracking from '../hooks/useLocationTracking';
import { getSocket } from '../services/socket';

const THEME_KEY = '@chinafast:theme';
const { width } = Dimensions.get('window');

export default function PremiumHomeScreen({ navigation }) {
  const { driver, socketConnected, updateDriver, signOut } = useAuth();
  const { availableDeliveries, activeDelivery, acceptDelivery, refreshAll } = useDeliveries();
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [changingOnline, setChangingOnline] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [ignoredDeliveryIds, setIgnoredDeliveryIds] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [contadorEntregas, setContadorEntregas] = useState(271);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [callVisible, setCallVisible] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [smartStatus, setSmartStatus] = useState('offline');
  const [couponMessage, setCouponMessage] = useState(null);
  const [couponModalVisible, setCouponModalVisible] = useState(false);
  const [couponData, setCouponData] = useState(null);
  
  const fadeAnim = useState(new Animated.Value(0))[0];
  const { playNewDeliverySound } = useSound();
  const { location, permissionGranted } = useLocationTracking(
    driver?.id,
    Boolean(driver?.online),
    activeDelivery?.id
  );

  const availableDelivery = useMemo(
    () =>
      availableDeliveries.find(
        (item) => !ignoredDeliveryIds.includes(Number(item.id))
      ) || null,
    [availableDeliveries, ignoredDeliveryIds]
  );

  useEffect(() => {
    loadTheme();
    animateEntrance();
    loadCouponData();
    
    const interval = setInterval(() => {
      setContadorEntregas(prev => prev + Math.floor(Math.random() * 2) + 1);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (availableDelivery && !callVisible && !activeDelivery) {
      setCurrentDelivery(availableDelivery);
      setCallVisible(true);
      playNewDeliverySound();
    }
  }, [availableDelivery]);

  useEffect(() => {
    if (driver?.online) {
      setSmartStatus('online');
      generateCouponOnOnline();
    } else {
      setSmartStatus('offline');
    }
  }, [driver?.online]);

  const loadCouponData = async () => {
    const data = await CouponSystem.getTodayCoupon();
    setCouponData(data);
  };

  const generateCouponOnOnline = async () => {
    const result = await CouponSystem.generateCouponOnOnline(driver?.id);
    if (result.generated) {
      setCouponMessage(result.message);
      setCouponData(result.coupon);
      Alert.alert(
        '🍱 Marmitex Garantido!',
        `${result.message}\n\n📌 Código: ${result.coupon.code}\n⏰ Válido até 13h\n📍 Dellys Lanches`,
        [{ text: '👍 Que legal!' }]
      );
    }
  };

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved) setDarkMode(saved === 'dark');
    } catch (error) {}
  };

  const animateEntrance = () => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  };

  const toggleTheme = async () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    try {
      await AsyncStorage.setItem(THEME_KEY, newTheme ? 'dark' : 'light');
    } catch (error) {}
  };

  async function toggleOnline() {
    if (!driver?.id) return;
    const nextOnline = !Boolean(driver.online);
    setChangingOnline(true);
    try {
      const socket = getSocket();
      socket?.emit(nextOnline ? 'driver-online' : 'driver-offline', { driverId: Number(driver.id) });
      updateDriver({ online: nextOnline });
      await refreshAll();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar seu status.');
    } finally {
      setChangingOnline(false);
    }
  }

  async function handleAccept() {
    if (!currentDelivery?.id) return;
    setAccepting(true);
    try {
      await acceptDelivery(currentDelivery.id);
      setCallVisible(false);
      Vibration.vibrate(100);
      Alert.alert('✅ Corrida aceita!', 'A entrega foi reservada para você.');
      navigation.navigate('Corrida');
    } catch (error) {
      Alert.alert('❌ Erro', error.message);
    } finally {
      setAccepting(false);
    }
  }

  function handleReject() {
    if (!currentDelivery?.id) return;
    setCallVisible(false);
    setIgnoredDeliveryIds((current) => [...current, Number(currentDelivery.id)]);
    Vibration.vibrate(200);
  }

  function handleMenuNavigation(key) {
    const routes = {
      profile: 'Perfil',
      wallet: 'Carteira',
      history: 'Histórico',
      vehicle: 'Veículo',
      pix: 'Chave Pix',
      documents: 'Documentos',
      operations: 'Central Operacional',
      settings: 'Configurações',
      help: 'Ajuda',
    };
    if (routes[key]) navigation.navigate(routes[key]);
  }

  function handleCallClient() {
    if (!activeDelivery?.clientPhone) {
      Alert.alert('📞', 'Número do cliente não disponível.');
      return;
    }
    Linking.openURL(`tel:${activeDelivery.clientPhone}`);
  }

  const isCouponValid = () => {
    if (!couponData) return false;
    const now = new Date();
    const expires = new Date(couponData.expiresAt);
    return now < expires && couponData.status !== 'used';
  };

  const styles = getStyles(darkMode);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <PremiumHeader
        driverName={driver?.name || 'Entregador Teste'}
        online={Boolean(driver?.online)}
        earningsToday="R$ 0,00"
        onMenu={() => setMenuVisible(true)}
        onThemeToggle={toggleTheme}
        darkMode={darkMode}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.mapArea}>
            <PremiumMap location={location} delivery={activeDelivery || availableDelivery} darkMode={darkMode} />
            
            <View style={[styles.statusOverlay, darkMode && styles.statusOverlayDark]}>
              <View style={styles.statusRow}>
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>GPS</Text>
                  <Text style={[styles.statusValue, permissionGranted ? styles.successText : styles.dangerText]}>
                    {permissionGranted ? 'ATIVO' : 'INATIVO'}
                  </Text>
                </View>
                <View style={styles.statusDivider} />
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>SOCKET</Text>
                  <Text style={[styles.statusValue, socketConnected ? styles.successText : styles.dangerText]}>
                    {socketConnected ? 'CONECTADO' : 'OFFLINE'}
                  </Text>
                </View>
                <View style={styles.statusDivider} />
                <View style={styles.statusItem}>
                  <Text style={styles.statusLabel}>STATUS</Text>
                  <Text style={[styles.statusValue, driver?.online ? styles.successText : styles.dangerText]}>
                    {driver?.online ? 'ONLINE' : 'OFFLINE'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.smartButtonContainer}>
              <SmartButton 
                status={smartStatus}
                onPress={toggleOnline}
                darkMode={darkMode}
                disabled={changingOnline}
              />
              <SOSButton darkMode={darkMode} location={location} />
            </View>
          </View>

          <View style={[styles.statusCard, darkMode && styles.statusCardDark]}>
            <View style={styles.statusCardHeader}>
              <View style={[styles.statusDotIndicator, driver?.online ? styles.greenDot : styles.redDot]} />
              <Text style={[styles.statusCardTitle, darkMode && styles.textLight]}>
                {driver?.online ? '🟢 Você está online' : '🔴 Você está offline'}
              </Text>
            </View>
            <Text style={[styles.statusCardSub, darkMode && styles.textSecondary]}>
              {driver?.online 
                ? 'Aguardando uma nova corrida próxima...' 
                : 'Ative o status para receber novas corridas e garantir seu marmitex!'}
            </Text>
          </View>

          <DailyProgress 
            todayDeliveries={contadorEntregas % 15}
            goal={15}
            earnings={contadorEntregas * 8.5}
            darkMode={darkMode}
          />

          <Pressable style={[styles.contadorCard, darkMode && styles.contadorCardDark]} onPress={() => setModalDetalhes(true)}>
            <View style={styles.contadorContent}>
              <Text style={styles.contadorNumber}>{contadorEntregas}</Text>
              <Text style={[styles.contadorLabel, darkMode && styles.textSecondary]}>🏍️ Entregas realizadas</Text>
            </View>
            <Text style={[styles.contadorDetail, darkMode && styles.textSecondary]}>Toque para ver detalhes →</Text>
          </Pressable>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, darkMode && styles.statCardDark]}>
              <Text style={styles.statEmoji}>⭐</Text>
              <Text style={[styles.statNumber, darkMode && styles.textLight]}>4.9</Text>
              <Text style={[styles.statLabel, darkMode && styles.textSecondary]}>Avaliação</Text>
            </View>
            <View style={[styles.statCard, darkMode && styles.statCardDark]}>
              <Text style={styles.statEmoji}>🏆</Text>
              <Text style={[styles.statNumber, darkMode && styles.textLight]}>98%</Text>
              <Text style={[styles.statLabel, darkMode && styles.textSecondary]}>Pontualidade</Text>
            </View>
            <View style={[styles.statCard, darkMode && styles.statCardDark]}>
              <Text style={styles.statEmoji}>📦</Text>
              <Text style={[styles.statNumber, darkMode && styles.textLight]}>12</Text>
              <Text style={[styles.statLabel, darkMode && styles.textSecondary]}>Hoje</Text>
            </View>
          </View>

          <View style={styles.quickActions}>
            <Pressable style={[styles.quickAction, darkMode && styles.quickActionDark]} onPress={handleCallClient}>
              <Text style={styles.quickActionEmoji}>📞</Text>
              <Text style={[styles.quickActionText, darkMode && styles.textLight]}>Cliente</Text>
            </Pressable>
            <Pressable style={[styles.quickAction, darkMode && styles.quickActionDark]} onPress={() => Alert.alert('📍', 'Rota sendo calculada...')}>
              <Text style={styles.quickActionEmoji}>📍</Text>
              <Text style={[styles.quickActionText, darkMode && styles.textLight]}>Rota</Text>
            </Pressable>
            <Pressable style={[styles.quickAction, darkMode && styles.quickActionDark]} onPress={() => navigation.navigate('Histórico')}>
              <Text style={styles.quickActionEmoji}>📋</Text>
              <Text style={[styles.quickActionText, darkMode && styles.textLight]}>Histórico</Text>
            </Pressable>
          </View>

          {!availableDelivery && !activeDelivery && (
            <View style={[styles.emptyState, darkMode && styles.emptyStateDark]}>
              <Text style={[styles.emptyStateIcon, darkMode && styles.textLight]}>📭</Text>
              <Text style={[styles.emptyStateTitle, darkMode && styles.textLight]}>Nenhuma corrida agora</Text>
              <Text style={[styles.emptyStateSub, darkMode && styles.textSecondary]}>
                Quando uma entrega surgir, ela aparecerá automaticamente.
              </Text>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </Animated.View>

      <CallAlert 
        visible={callVisible}
        delivery={currentDelivery}
        onAccept={handleAccept}
        onReject={handleReject}
        darkMode={darkMode}
      />

      <Modal visible={modalDetalhes} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, darkMode && styles.modalBoxDark]}>
            <Pressable style={styles.modalClose} onPress={() => setModalDetalhes(false)}>
              <Text style={[styles.modalCloseText, darkMode && styles.textLight]}>✕</Text>
            </Pressable>
            <Text style={[styles.modalTitle, darkMode && styles.textLight]}>📊 Suas estatísticas</Text>
            <View style={styles.modalStats}>
              <View style={styles.modalStatItem}>
                <Text style={styles.modalStatNumber}>{contadorEntregas}</Text>
                <Text style={[styles.modalStatLabel, darkMode && styles.textSecondary]}>Entregas totais</Text>
              </View>
              <View style={styles.modalStatItem}>
                <Text style={styles.modalStatNumber}>12</Text>
                <Text style={[styles.modalStatLabel, darkMode && styles.textSecondary]}>Hoje</Text>
              </View>
              <View style={styles.modalStatItem}>
                <Text style={styles.modalStatNumber}>4.9★</Text>
                <Text style={[styles.modalStatLabel, darkMode && styles.textSecondary]}>Avaliação</Text>
              </View>
            </View>
            <Pressable style={styles.modalButton} onPress={() => setModalDetalhes(false)}>
              <Text style={styles.modalButtonText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        driver={driver}
        onNavigate={handleMenuNavigation}
        onLogout={() => {
          Alert.alert('Sair', 'Deseja encerrar sua sessão?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', style: 'destructive', onPress: signOut },
          ]);
        }}
        darkMode={darkMode}
      />
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
  const red = '#c72a2a';

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: bgPrimary },
    content: { flex: 1 },
    mapArea: { height: 280, backgroundColor: bgCard, margin: 12, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: borderColor, position: 'relative' },
    statusOverlay: { position: 'absolute', bottom: 8, left: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 10, padding: 8, flexDirection: 'row', justifyContent: 'space-around' },
    statusOverlayDark: { backgroundColor: 'rgba(0,0,0,0.9)' },
    statusRow: { flexDirection: 'row', justifyContent: 'space-around', flex: 1 },
    statusItem: { alignItems: 'center' },
    statusLabel: { color: '#aaa', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
    statusValue: { color: '#fff', fontSize: 11, fontWeight: '700', marginTop: 1 },
    statusDivider: { width: 1, backgroundColor: '#444' },
    successText: { color: '#4caf50' },
    dangerText: { color: '#f44336' },
    smartButtonContainer: { position: 'absolute', bottom: 55, left: 12, right: 12, flexDirection: 'row', gap: 8, alignItems: 'center' },
    statusCard: { backgroundColor: bgCard, marginHorizontal: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: borderColor },
    statusCardDark: { backgroundColor: bgSecondary },
    statusCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statusDotIndicator: { width: 10, height: 10, borderRadius: 5 },
    statusCardTitle: { fontSize: 15, fontWeight: '700', color: textPrimary },
    statusCardSub: { fontSize: 13, color: textSecondary, marginTop: 4, marginLeft: 18 },
    contadorCard: { backgroundColor: bgCard, margin: 12, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: borderColor, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    contadorCardDark: { backgroundColor: bgSecondary },
    contadorContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    contadorNumber: { fontSize: 34, fontWeight: '800', color: red },
    contadorLabel: { fontSize: 14, color: textSecondary },
    contadorDetail: { fontSize: 12, color: textSecondary },
    statsGrid: { flexDirection: 'row', marginHorizontal: 12, gap: 8, marginVertical: 8 },
    statCard: { flex: 1, backgroundColor: bgCard, padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: borderColor },
    statCardDark: { backgroundColor: bgSecondary },
    statEmoji: { fontSize: 22, marginBottom: 2 },
    statNumber: { fontSize: 18, fontWeight: '700', color: textPrimary },
    statLabel: { fontSize: 11, color: textSecondary },
    quickActions: { flexDirection: 'row', marginHorizontal: 12, gap: 8, marginVertical: 8 },
    quickAction: { flex: 1, backgroundColor: bgCard, padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: borderColor },
    quickActionDark: { backgroundColor: bgSecondary },
    quickActionEmoji: { fontSize: 24, marginBottom: 2 },
    quickActionText: { fontSize: 12, fontWeight: '600', color: textPrimary },
    emptyState: { backgroundColor: bgCard, margin: 12, padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: borderColor, borderStyle: 'dashed' },
    emptyStateDark: { backgroundColor: bgSecondary },
    emptyStateIcon: { fontSize: 36, marginBottom: 8 },
    emptyStateTitle: { fontSize: 16, fontWeight: '700', color: textPrimary },
    emptyStateSub: { fontSize: 13, color: textSecondary, textAlign: 'center', marginTop: 4 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalBox: { backgroundColor: bgSecondary, borderRadius: 24, padding: 24, width: '90%', maxWidth: 380, borderWidth: 1, borderColor: borderColor },
    modalBoxDark: { backgroundColor: '#1a2740' },
    modalClose: { alignSelf: 'flex-end', padding: 4 },
    modalCloseText: { fontSize: 22, color: textSecondary },
    modalTitle: { fontSize: 20, fontWeight: '700', color: textPrimary, marginBottom: 16 },
    modalStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
    modalStatItem: { alignItems: 'center' },
    modalStatNumber: { fontSize: 28, fontWeight: '800', color: red },
    modalStatLabel: { fontSize: 12, color: textSecondary, marginTop: 2 },
    modalButton: { backgroundColor: red, padding: 14, borderRadius: 30, alignItems: 'center' },
    modalButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    textLight: { color: textPrimary },
    textSecondary: { color: textSecondary },
  });
}
