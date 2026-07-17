import React, { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import PremiumHeader from '../components/PremiumHeader';
import PremiumMap from '../components/PremiumMap';
import SideMenu from '../components/SideMenu';

import { useAuth } from '../context/AuthContext';
import { useDeliveries } from '../context/DeliveryContext';
import useLocationTracking from '../hooks/useLocationTracking';
import { getSocket } from '../services/socket';

const { width, height } = Dimensions.get('window');
const THEME_KEY = '@chinafast:theme';
const NOTICIAS = [
  '🚨 Hoje: entregas com desconto para Boituva e Cerquilho!',
  '📦 Próxima janela de coleta: 14h',
  '🏍️ Frota própria - 10 cidades atendidas',
  '⭐ 4.9 de avaliação dos clientes',
  '🚚 Entregas em até 2h em Tatuí',
];

export default function PremiumHomeScreen({ navigation }) {
  const { driver, socketConnected, updateDriver, signOut } = useAuth();
  const { availableDeliveries, activeDelivery, acceptDelivery, refreshAll } = useDeliveries();
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [changingOnline, setChangingOnline] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [ignoredDeliveryIds, setIgnoredDeliveryIds] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [contadorEntregas, setContadorEntregas] = useState(247);
  const [rastreioCode, setRastreioCode] = useState('');
  const [modalRastreio, setModalRastreio] = useState(false);
  const [modalOrcamento, setModalOrcamento] = useState(false);
  const [modalSimulador, setModalSimulador] = useState(false);
  
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const { location, permissionGranted, error: locationError } = useLocationTracking(
    driver?.id,
    Boolean(driver?.online),
    activeDelivery?.id
  );

  useEffect(() => {
    loadTheme();
    animateEntrance();
    const interval = setInterval(() => {
      setContadorEntregas(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved) setDarkMode(saved === 'dark');
    } catch (error) {}
  };

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  };

  const toggleTheme = async () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    try {
      await AsyncStorage.setItem(THEME_KEY, newTheme ? 'dark' : 'light');
    } catch (error) {}
  };

  const availableDelivery = useMemo(
    () => availableDeliveries.find((item) => !ignoredDeliveryIds.includes(Number(item.id))) || null,
    [availableDeliveries, ignoredDeliveryIds]
  );

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
    if (!availableDelivery?.id) return;
    setAccepting(true);
    try {
      await acceptDelivery(availableDelivery.id);
      Alert.alert('✅ Corrida aceita', 'A entrega foi reservada para você.');
      navigation.navigate('Corrida');
    } catch (error) {
      Alert.alert('❌ Erro ao aceitar', error.message);
    } finally {
      setAccepting(false);
    }
  }

  function handleReject() {
    if (!availableDelivery?.id) return;
    Alert.alert('Recusar corrida', 'Esta corrida será ocultada nesta sessão.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Recusar', style: 'destructive', onPress: () => {
        setIgnoredDeliveryIds((current) => [...current, Number(availableDelivery.id)]);
      }},
    ]);
  }

  function handleRastrear() {
    if (!rastreioCode.trim()) {
      Alert.alert('⚠️', 'Digite um código de rastreio.');
      return;
    }
    setModalRastreio(true);
  }

  function handleMenuNavigation(key) {
    const routes = {
      profile: 'Perfil',
      wallet: 'Carteira',
      earnings: 'Carteira',
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

  const styles = getStyles(darkMode);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={[styles.noticiasBar, darkMode && styles.noticiasBarDark]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.noticiasScroll}>
          {NOTICIAS.map((text, index) => (
            <Text key={index} style={[styles.noticiasText, darkMode && styles.noticiasTextDark]}>
              {text} {index < NOTICIAS.length - 1 && '·'}
            </Text>
          ))}
        </ScrollView>
      </View>

      <PremiumHeader
        driverName={driver?.name || 'Entregador Teste'}
        online={Boolean(driver?.online)}
        earningsToday="R$ 0,00"
        onMenu={() => setMenuVisible(true)}
        onThemeToggle={toggleTheme}
        darkMode={darkMode}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.mapArea}>
            <PremiumMap location={location} delivery={activeDelivery || availableDelivery} darkMode={darkMode} />
            
            <View style={[styles.statusOverlay, darkMode && styles.statusOverlayDark]}>
              <View style={styles.statusRow}>
                <View style={styles.statusItem}>
                  <Text style={[styles.statusLabel, darkMode && styles.textSecondary]}>GPS</Text>
                  <Text style={[styles.statusValue, permissionGranted ? styles.successText : styles.dangerText]}>
                    {permissionGranted ? 'ATIVO' : 'INATIVO'}
                  </Text>
                </View>
                <View style={styles.statusDivider} />
                <View style={styles.statusItem}>
                  <Text style={[styles.statusLabel, darkMode && styles.textSecondary]}>SOCKET</Text>
                  <Text style={[styles.statusValue, socketConnected ? styles.successText : styles.dangerText]}>
                    {socketConnected ? 'CONECTADO' : 'OFFLINE'}
                  </Text>
                </View>
                <View style={styles.statusDivider} />
                <View style={styles.statusItem}>
                  <Text style={[styles.statusLabel, darkMode && styles.textSecondary]}>STATUS</Text>
                  <Text style={[styles.statusValue, driver?.online ? styles.successText : styles.dangerText]}>
                    {driver?.online ? 'ONLINE' : 'OFFLINE'}
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              style={[styles.onlineButton, driver?.online ? styles.onlineButtonActive : styles.onlineButtonInactive]}
              disabled={changingOnline}
              onPress={toggleOnline}
            >
              {changingOnline ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <View style={[styles.onlineDot, driver?.online ? styles.greenDot : styles.redDot]} />
                  <Text style={styles.onlineButtonText}>{driver?.online ? 'ONLINE' : 'FICAR ONLINE'}</Text>
                </>
              )}
            </Pressable>
          </View>

          <View style={[styles.statusCard, darkMode && styles.statusCardDark]}>
            <View style={styles.statusCardHeader}>
              <View style={[styles.statusDotIndicator, driver?.online ? styles.greenDot : styles.redDot]} />
              <Text style={[styles.statusCardTitle, darkMode && styles.textLight]}>
                {driver?.online ? '🟢 Você está online' : '🔴 Você está offline'}
              </Text>
            </View>
            <Text style={[styles.statusCardSub, darkMode && styles.textSecondary]}>
              {driver?.online ? 'Aguardando uma nova corrida próxima...' : 'Ative o status para receber novas corridas'}
            </Text>
          </View>

          <View style={[styles.contadorCard, darkMode && styles.contadorCardDark]}>
            <Text style={styles.contadorNumber}>{contadorEntregas}</Text>
            <Text style={[styles.contadorLabel, darkMode && styles.textSecondary]}>🚚 Entregas realizadas hoje</Text>
          </View>

          <View style={styles.rastreioContainer}>
            <TextInput
              style={[styles.rastreioInput, darkMode && styles.inputDark]}
              placeholder="🔍 Digite o código de rastreio"
              placeholderTextColor={darkMode ? '#7a8fa5' : '#999'}
              value={rastreioCode}
              onChangeText={setRastreioCode}
            />
            <Pressable style={styles.rastreioButton} onPress={handleRastrear}>
              <Text style={styles.rastreioButtonText}>Rastrear</Text>
            </Pressable>
          </View>

          <View style={styles.quickButtons}>
            <Pressable style={[styles.quickButton, darkMode && styles.quickButtonDark]} onPress={() => setModalSimulador(true)}>
              <Text style={styles.quickButtonIcon}>🛵</Text>
              <Text style={[styles.quickButtonText, darkMode && styles.textLight]}>Simular Frete</Text>
            </Pressable>
            <Pressable style={[styles.quickButton, darkMode && styles.quickButtonDark]} onPress={() => setModalOrcamento(true)}>
              <Text style={styles.quickButtonIcon}>📋</Text>
              <Text style={[styles.quickButtonText, darkMode && styles.textLight]}>Orçamento</Text>
            </Pressable>
            <Pressable style={[styles.quickButton, darkMode && styles.quickButtonDark]} onPress={() => navigation.navigate('Histórico')}>
              <Text style={styles.quickButtonIcon}>📊</Text>
              <Text style={[styles.quickButtonText, darkMode && styles.textLight]}>Histórico</Text>
            </Pressable>
          </View>

          {!availableDelivery && !activeDelivery && (
            <View style={[styles.emptyState, darkMode && styles.emptyStateDark]}>
              <Text style={[styles.emptyStateIcon, darkMode && styles.textLight]}>📭</Text>
              <Text style={[styles.emptyStateTitle, darkMode && styles.textLight]}>Nenhuma corrida agora</Text>
              <Text style={[styles.emptyStateSub, darkMode && styles.textSecondary]}>
                Quando uma entrega surgir, ela aparecerá automaticamente neste painel.
              </Text>
            </View>
          )}

          <View style={styles.badgeContainer}>
            <View style={[styles.badgePulse, darkMode && styles.badgePulseDark]}>
              <Text style={styles.badgeText}>⚡ Entrega em até 2h*</Text>
            </View>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </Animated.View>

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

      {/* Modal Rastreio */}
      <Modal visible={modalRastreio} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, darkMode && styles.modalBoxDark]}>
            <Pressable style={styles.modalClose} onPress={() => setModalRastreio(false)}>
              <Text style={[styles.modalCloseText, darkMode && styles.textLight]}>✕</Text>
            </Pressable>
            <Text style={[styles.modalTitle, darkMode && styles.textLight]}>🔍 Status do rastreio</Text>
            <View style={styles.rastreioStatus}>
              <Text style={[styles.rastreioStatusText, darkMode && styles.textLight]}>Código: {rastreioCode}</Text>
              <Text style={[styles.rastreioStatusDetail, darkMode && styles.textSecondary]}>📦 Saiu para entrega às 12:34</Text>
              <Text style={[styles.rastreioStatusDetail, darkMode && styles.textSecondary]}>🚚 Previsão: Hoje até as 18h</Text>
              <Text style={[styles.rastreioStatusDetail, darkMode && styles.textSecondary]}>📍 Entregador: João (a caminho)</Text>
            </View>
            <Pressable style={styles.modalButton} onPress={() => setModalRastreio(false)}>
              <Text style={styles.modalButtonText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal Orçamento */}
      <Modal visible={modalOrcamento} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, darkMode && styles.modalBoxDark]}>
            <Pressable style={styles.modalClose} onPress={() => setModalOrcamento(false)}>
              <Text style={[styles.modalCloseText, darkMode && styles.textLight]}>✕</Text>
            </Pressable>
            <Text style={[styles.modalTitle, darkMode && styles.textLight]}>📋 Orçamento rápido</Text>
            <Text style={[styles.modalSub, darkMode && styles.textSecondary]}>Preencha e receba um orçamento personalizado</Text>
            <TextInput style={[styles.modalInput, darkMode && styles.inputDark]} placeholder="Seu nome" placeholderTextColor={darkMode ? '#7a8fa5' : '#999'} />
            <TextInput style={[styles.modalInput, darkMode && styles.inputDark]} placeholder="WhatsApp (com DDD)" placeholderTextColor={darkMode ? '#7a8fa5' : '#999'} keyboardType="phone-pad" />
            <TextInput style={[styles.modalInput, darkMode && styles.inputDark]} placeholder="Cidade de destino" placeholderTextColor={darkMode ? '#7a8fa5' : '#999'} />
            <TextInput style={[styles.modalInput, darkMode && styles.inputDark]} placeholder="Peso aproximado (kg)" placeholderTextColor={darkMode ? '#7a8fa5' : '#999'} keyboardType="numeric" />
            <Pressable style={styles.modalButton} onPress={() => {
              Alert.alert('✅', 'Orçamento enviado! Em breve entraremos em contato.');
              setModalOrcamento(false);
            }}>
              <Text style={styles.modalButtonText}>📤 Enviar orçamento</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal Simulador */}
      <Modal visible={modalSimulador} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, darkMode && styles.modalBoxDark, { maxWidth: 400 }]}>
            <Pressable style={styles.modalClose} onPress={() => setModalSimulador(false)}>
              <Text style={[styles.modalCloseText, darkMode && styles.textLight]}>✕</Text>
            </Pressable>
            <Text style={[styles.modalTitle, darkMode && styles.textLight]}>🛵 Simulador de Frete</Text>
            <Text style={[styles.modalSub, darkMode && styles.textSecondary]}>Taxa fixa R$ 70,00 + R$ 2,10/km</Text>
            <View style={styles.simuladorContent}>
              <Text style={[styles.simuladorLabel, darkMode && styles.textLight]}>Distância: 17 km</Text>
              <View style={styles.simuladorRow}>
                <Text style={[styles.simuladorCity, darkMode && styles.textSecondary]}>Tatuí</Text>
                <Text style={[styles.simuladorCity, darkMode && styles.textLight, styles.simuladorBold]}>→ Iperó</Text>
              </View>
              <View style={[styles.simuladorResult, darkMode && styles.simuladorResultDark]}>
                <Text style={styles.simuladorResultLabel}>Valor total</Text>
                <Text style={styles.simuladorResultValue}>R$ 141,40</Text>
                <Text style={[styles.simuladorResultDetail, darkMode && styles.textSecondary]}>R$ 70,00 + 34 km × R$ 2,10</Text>
              </View>
            </View>
            <Pressable style={[styles.modalButton, { marginTop: 16 }]} onPress={() => {
              Alert.alert('📞', 'Fale conosco para agendar sua entrega!');
              setModalSimulador(false);
            }}>
              <Text style={styles.modalButtonText}>📞 Solicitar entrega</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    noticiasBar: { backgroundColor: red, paddingVertical: 6, paddingHorizontal: 12, maxHeight: 32 },
    noticiasBarDark: { backgroundColor: '#8a1f1f' },
    noticiasScroll: { flexDirection: 'row' },
    noticiasText: { color: '#fff', fontSize: 12, fontWeight: '500', marginRight: 20, paddingVertical: 2 },
    noticiasTextDark: { opacity: 0.9 },
    content: { flex: 1 },
    mapArea: { height: 240, backgroundColor: bgCard, margin: 12, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: borderColor, position: 'relative' },
    statusOverlay: { position: 'absolute', bottom: 8, left: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 10, padding: 8, flexDirection: 'row', justifyContent: 'space-around' },
    statusOverlayDark: { backgroundColor: 'rgba(0,0,0,0.9)' },
    statusRow: { flexDirection: 'row', justifyContent: 'space-around', flex: 1 },
    statusItem: { alignItems: 'center' },
    statusLabel: { color: '#aaa', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
    statusValue: { color: '#fff', fontSize: 11, fontWeight: '700', marginTop: 1 },
    statusDivider: { width: 1, backgroundColor: '#444' },
    successText: { color: '#4caf50' },
    dangerText: { color: '#f44336' },
    onlineButton: { position: 'absolute', top: 10, right: 10, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 6 },
    onlineButtonActive: { backgroundColor: '#4caf50' },
    onlineButtonInactive: { backgroundColor: '#f44336' },
    onlineDot: { width: 8, height: 8, borderRadius: 4 },
    greenDot: { backgroundColor: '#ffffff' },
    redDot: { backgroundColor: '#ffffff' },
    onlineButtonText: { color: '#fff', fontWeight: '700', fontSize: 11 },
    statusCard: { backgroundColor: bgCard, marginHorizontal: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: borderColor },
    statusCardDark: { backgroundColor: bgSecondary },
    statusCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statusDotIndicator: { width: 10, height: 10, borderRadius: 5 },
    statusCardTitle: { fontSize: 15, fontWeight: '700', color: textPrimary },
    statusCardSub: { fontSize: 13, color: textSecondary, marginTop: 4, marginLeft: 18 },
    contadorCard: { backgroundColor: bgCard, margin: 12, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: borderColor },
    contadorCardDark: { backgroundColor: bgSecondary },
    contadorNumber: { fontSize: 34, fontWeight: '800', color: red },
    contadorLabel: { fontSize: 14, color: textSecondary, marginTop: 2 },
    rastreioContainer: { flexDirection: 'row', marginHorizontal: 12, marginVertical: 8, gap: 8 },
    rastreioInput: { flex: 1, padding: 10, borderRadius: 30, borderWidth: 2, borderColor: borderColor, backgroundColor: bgSecondary, color: textPrimary, fontSize: 14 },
    inputDark: { backgroundColor: '#0f1a2b', borderColor: '#2a3a5a' },
    rastreioButton: { backgroundColor: red, paddingHorizontal: 18, borderRadius: 30, justifyContent: 'center' },
    rastreioButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    quickButtons: { flexDirection: 'row', marginHorizontal: 12, gap: 8, marginVertical: 8 },
    quickButton: { flex: 1, backgroundColor: bgCard, padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: borderColor },
    quickButtonDark: { backgroundColor: bgSecondary },
    quickButtonIcon: { fontSize: 20, marginBottom: 4 },
    quickButtonText: { fontSize: 11, fontWeight: '600', color: textPrimary },
    emptyState: { backgroundColor: bgCard, margin: 12, padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: borderColor, borderStyle: 'dashed' },
    emptyStateDark: { backgroundColor: bgSecondary },
    emptyStateIcon: { fontSize: 36, marginBottom: 8 },
    emptyStateTitle: { fontSize: 16, fontWeight: '700', color: textPrimary },
    emptyStateSub: { fontSize: 13, color: textSecondary, textAlign: 'center', marginTop: 4 },
    badgeContainer: { alignItems: 'center', marginVertical: 12 },
    badgePulse: { backgroundColor: red, paddingVertical: 6, paddingHorizontal: 20, borderRadius: 30, borderWidth: 2, borderColor: '#ff6b6b' },
    badgePulseDark: { backgroundColor: '#a81f1f' },
    badgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalBox: { backgroundColor: bgSecondary, borderRadius: 24, padding: 20, width: '90%', maxWidth: 380, borderWidth: 1, borderColor: borderColor },
    modalBoxDark: { backgroundColor: '#1a2740' },
    modalClose: { alignSelf: 'flex-end', padding: 4 },
    modalCloseText: { fontSize: 22, color: textSecondary },
    modalTitle: { fontSize: 20, fontWeight: '700', color: textPrimary, marginBottom: 4 },
    modalSub: { fontSize: 14, color: textSecondary, marginBottom: 16 },
    modalInput: { borderWidth: 2, borderColor: borderColor, borderRadius: 30, padding: 12, marginBottom: 10, backgroundColor: bgPrimary, color: textPrimary, fontSize: 14 },
    modalButton: { backgroundColor: red, padding: 14, borderRadius: 30, alignItems: 'center', marginTop: 4 },
    modalButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    rastreioStatus: { marginVertical: 12 },
    rastreioStatusText: { fontSize: 15, fontWeight: '700', color: textPrimary, marginBottom: 4 },
    rastreioStatusDetail: { fontSize: 13, color: textSecondary, marginTop: 4 },
    simuladorContent: { marginVertical: 8 },
    simuladorLabel: { fontSize: 14, fontWeight: '600', color: textPrimary, marginBottom: 4 },
    simuladorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    simuladorCity: { fontSize: 13, color: textSecondary },
    simuladorBold: { fontWeight: '700', color: textPrimary },
    simuladorResult: { backgroundColor: bgPrimary, borderRadius: 12, padding: 14, borderWidth: 2, borderColor: red + '30' },
    simuladorResultDark: { backgroundColor: '#0f1a2b' },
    simuladorResultLabel: { fontSize: 11, color: textSecondary, fontWeight: '500' },
    simuladorResultValue: { fontSize: 26, fontWeight: '800', color: red },
    simuladorResultDetail: { fontSize: 11, color: textSecondary, marginTop: 2 },
    textLight: { color: textPrimary },
    textSecondary: { color: textSecondary },
  });
}
