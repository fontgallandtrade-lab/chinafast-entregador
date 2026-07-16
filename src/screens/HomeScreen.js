import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { useDeliveries } from '../context/DeliveryContext';

import DeliveryCard from '../components/DeliveryCard';

import useLocationTracking from '../hooks/useLocationTracking';

import { getSocket } from '../services/socket';

export default function HomeScreen({
  navigation,
}) {
  const {
    driver,
    socketConnected,
    updateDriver,
  } = useAuth();

  const {
    availableDeliveries,
    activeDelivery,
    loading,
    acceptDelivery,
  } = useDeliveries();

  const [changingStatus, setChangingStatus] =
    useState(false);

  const [accepting, setAccepting] =
    useState(false);

  const {
    location,
    permissionGranted,
    error: locationError,
  } = useLocationTracking(
    driver?.id,
    driver?.online,
    activeDelivery?.id
  );

  async function toggleOnline(nextValue) {
    setChangingStatus(true);

    try {
      const socket = getSocket();

      socket?.emit(
        nextValue
          ? 'driver-online'
          : 'driver-offline',
        {
          driverId: Number(driver.id),
        }
      );

      updateDriver({
        online: nextValue,
      });
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível alterar o status.'
      );
    } finally {
      setChangingStatus(false);
    }
  }

  async function handleAccept(deliveryId) {
    setAccepting(true);

    try {
      await acceptDelivery(deliveryId);

      Alert.alert(
        'Corrida aceita',
        'A entrega foi reservada para você.'
      );

      navigation.navigate('Corrida');
    } catch (error) {
      Alert.alert(
        'Erro ao aceitar',
        error.message
      );
    } finally {
      setAccepting(false);
    }
  }

  const firstAvailable =
    availableDeliveries[0] || null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>
              ChinaFast
            </Text>

            <Text style={styles.greeting}>
              Olá, {driver?.name || 'Entregador'}
            </Text>
          </View>

          <View
            style={[
              styles.connectionBadge,
              socketConnected
                ? styles.connected
                : styles.disconnected,
            ]}
          >
            <Text style={styles.connectionText}>
              {socketConnected
                ? 'CONECTADO'
                : 'DESCONECTADO'}
            </Text>
          </View>
        </View>

        <View style={styles.onlineCard}>
          <View>
            <Text style={styles.onlineLabel}>
              Status
            </Text>

            <Text
              style={[
                styles.onlineValue,
                driver?.online
                  ? styles.online
                  : styles.offline,
              ]}
            >
              {driver?.online
                ? 'ONLINE'
                : 'OFFLINE'}
            </Text>
          </View>

          {changingStatus ? (
            <ActivityIndicator
              color="#d71920"
            />
          ) : (
            <Switch
              value={Boolean(driver?.online)}
              onValueChange={toggleOnline}
              trackColor={{
                false: '#cccccc',
                true: '#66bb6a',
              }}
            />
          )}
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>
              GPS
            </Text>

            <Text style={styles.infoValue}>
              {permissionGranted
                ? 'Ativo'
                : 'Inativo'}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>
              Precisão
            </Text>

            <Text style={styles.infoValue}>
              {location?.accuracy
                ? `${Number(
                    location.accuracy
                  ).toFixed(0)} m`
                : '--'}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>
              Avaliação
            </Text>

            <Text style={styles.infoValue}>
              ⭐ {Number(
                driver?.rating || 0
              ).toFixed(1)}
            </Text>
          </View>
        </View>

        {locationError ? (
          <Text style={styles.error}>
            {locationError}
          </Text>
        ) : null}

        <Text style={styles.sectionTitle}>
          {activeDelivery
            ? 'Entrega atual'
            : 'Corridas disponíveis'}
        </Text>

        {activeDelivery ? (
          <DeliveryCard
            delivery={activeDelivery}
            onOpen={() =>
              navigation.navigate('Corrida')
            }
          />
        ) : firstAvailable ? (
          <DeliveryCard
            delivery={firstAvailable}
            available
            loading={accepting}
            onAccept={() =>
              handleAccept(firstAvailable.id)
            }
          />
        ) : (
          <View style={styles.emptyCard}>
            {loading ? (
              <ActivityIndicator
                color="#d71920"
              />
            ) : (
              <>
                <Text style={styles.emptyIcon}>
                  🚚
                </Text>

                <Text style={styles.emptyTitle}>
                  Nenhuma corrida agora
                </Text>

                <Text style={styles.emptyText}>
                  Quando surgir uma entrega, ela
                  aparecerá automaticamente aqui.
                </Text>
              </>
            )}
          </View>
        )}

        <Pressable
          style={styles.walletShortcut}
          onPress={() =>
            navigation.navigate('Carteira')
          }
        >
          <View>
            <Text style={styles.shortcutTitle}>
              Minha carteira
            </Text>

            <Text style={styles.shortcutText}>
              Consulte saldo, extrato e saques
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111111',
  },

  content: {
    padding: 20,
    paddingBottom: 110,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  brand: {
    color: '#ffffff',
    fontSize: 29,
    fontWeight: '900',
  },

  greeting: {
    color: '#bcbcbc',
    fontSize: 15,
    marginTop: 3,
  },

  connectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },

  connected: {
    backgroundColor: '#1b5e20',
  },

  disconnected: {
    backgroundColor: '#b71c1c',
  },

  connectionText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },

  onlineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  onlineLabel: {
    color: '#777777',
    fontWeight: '700',
  },

  onlineValue: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },

  online: {
    color: '#2e7d32',
  },

  offline: {
    color: '#d71920',
  },

  infoRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  infoCard: {
    flex: 1,
    backgroundColor: '#222222',
    borderRadius: 16,
    padding: 14,
  },

  infoLabel: {
    color: '#999999',
    fontSize: 11,
    fontWeight: '700',
  },

  infoValue: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 5,
  },

  error: {
    color: '#ff8a80',
    marginTop: 12,
    fontWeight: '700',
  },

  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 25,
    marginBottom: 14,
  },

  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 42,
  },

  emptyTitle: {
    color: '#111111',
    fontSize: 19,
    fontWeight: '900',
    marginTop: 12,
  },

  emptyText: {
    color: '#777777',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 7,
  },

  walletShortcut: {
    backgroundColor: '#d71920',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  shortcutTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },

  shortcutText: {
    color: '#ffd4d4',
    marginTop: 4,
  },

  arrow: {
    color: '#ffffff',
    fontSize: 38,
  },
});
