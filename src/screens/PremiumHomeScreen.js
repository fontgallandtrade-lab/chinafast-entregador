import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useMemo,
  useState,
} from 'react';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import PremiumHeader from '../components/PremiumHeader';
import PremiumMap from '../components/PremiumMap';
import DeliveryBottomSheet from '../components/DeliveryBottomSheet';
import SideMenu from '../components/SideMenu';

import { useAuth } from '../context/AuthContext';
import { useDeliveries } from '../context/DeliveryContext';

import useLocationTracking from '../hooks/useLocationTracking';

import { getSocket } from '../services/socket';
import colors from '../theme/colors';

export default function PremiumHomeScreen({
  navigation,
}) {
  const {
    driver,
    socketConnected,
    updateDriver,
    signOut,
  } = useAuth();

  const {
    availableDeliveries,
    activeDelivery,
    acceptDelivery,
    loading,
    refreshAll,
  } = useDeliveries();

  const [menuVisible, setMenuVisible] =
    useState(false);

  const [changingOnline, setChangingOnline] =
    useState(false);

  const [accepting, setAccepting] =
    useState(false);

  const [ignoredDeliveryIds, setIgnoredDeliveryIds] =
    useState([]);

  const {
    location,
    permissionGranted,
    error: locationError,
  } = useLocationTracking(
    driver?.id,
    Boolean(driver?.online),
    activeDelivery?.id
  );

  const availableDelivery = useMemo(
    () =>
      availableDeliveries.find(
        (item) =>
          !ignoredDeliveryIds.includes(
            Number(item.id)
          )
      ) || null,
    [
      availableDeliveries,
      ignoredDeliveryIds,
    ]
  );

  async function toggleOnline() {
    if (!driver?.id) {
      return;
    }

    const nextOnline =
      !Boolean(driver.online);

    setChangingOnline(true);

    try {
      const socket = getSocket();

      socket?.emit(
        nextOnline
          ? 'driver-online'
          : 'driver-offline',
        {
          driverId: Number(driver.id),
        }
      );

      updateDriver({
        online: nextOnline,
      });

      await refreshAll();
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível alterar seu status.'
      );
    } finally {
      setChangingOnline(false);
    }
  }

  async function handleAccept() {
    if (!availableDelivery?.id) {
      return;
    }

    setAccepting(true);

    try {
      await acceptDelivery(
        availableDelivery.id
      );

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

  function handleReject() {
    if (!availableDelivery?.id) {
      return;
    }

    Alert.alert(
      'Recusar corrida',
      'Esta corrida será ocultada nesta sessão.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Recusar',
          style: 'destructive',
          onPress: () => {
            setIgnoredDeliveryIds(
              (current) => [
                ...current,
                Number(
                  availableDelivery.id
                ),
              ]
            );
          },
        },
      ]
    );
  }

  function handleMenuNavigation(key) {
    const routes = {
      profile: 'Perfil',
      wallet: 'Carteira',
      earnings: 'Carteira',
      history: 'Histórico',
    };

    if (routes[key]) {
      navigation.navigate(routes[key]);
      return;
    }

    const labels = {
      vehicle: 'Veículo',
      pix: 'Chave Pix',
      documents: 'Documentos',
      operations:
        'Central Operacional',
      settings: 'Configurações',
      help: 'Ajuda',
    };

    Alert.alert(
      labels[key] || 'ChinaFast',
      'Essa função será conectada na próxima atualização Premium.'
    );
  }

  function handleLogout() {
    Alert.alert(
      'Sair da conta',
      'Deseja encerrar sua sessão?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <PremiumHeader
        driverName={
          driver?.name || 'Entregador'
        }
        online={Boolean(driver?.online)}
        earningsToday="R$ 0,00"
        onMenu={() =>
          setMenuVisible(true)
        }
      />

      <View style={styles.mapArea}>
        <PremiumMap
          location={location}
          delivery={
            activeDelivery ||
            availableDelivery
          }
        />

        <View style={styles.mapStatus}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>
              GPS
            </Text>

            <Text style={styles.statusValue}>
              {permissionGranted
                ? 'ATIVO'
                : 'INATIVO'}
            </Text>
          </View>

          <View style={styles.statusDivider} />

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>
              SOCKET
            </Text>

            <Text
              style={[
                styles.statusValue,
                socketConnected
                  ? styles.successText
                  : styles.dangerText,
              ]}
            >
              {socketConnected
                ? 'CONECTADO'
                : 'OFFLINE'}
            </Text>
          </View>
        </View>

        <Pressable
          style={[
            styles.onlineButton,
            driver?.online
              ? styles.onlineButtonActive
              : styles.onlineButtonInactive,
          ]}
          disabled={changingOnline}
          onPress={toggleOnline}
        >
          {changingOnline ? (
            <ActivityIndicator
              color="#ffffff"
            />
          ) : (
            <>
              <View
                style={[
                  styles.onlineDot,
                  driver?.online
                    ? styles.greenDot
                    : styles.redDot,
                ]}
              />

              <Text
                style={styles.onlineButtonText}
              >
                {driver?.online
                  ? 'ONLINE'
                  : 'FICAR ONLINE'}
              </Text>
            </>
          )}
        </Pressable>

        {locationError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              {locationError}
            </Text>
          </View>
        ) : null}
      </View>

      <DeliveryBottomSheet
        delivery={availableDelivery}
        activeDelivery={activeDelivery}
        online={Boolean(driver?.online)}
        loading={accepting || loading}
        onAccept={handleAccept}
        onReject={handleReject}
        onOpenDelivery={() =>
          navigation.navigate('Corrida')
        }
      />

      <SideMenu
        visible={menuVisible}
        driver={driver}
        socketConnected={
          socketConnected
        }
        onClose={() =>
          setMenuVisible(false)
        }
        onNavigate={
          handleMenuNavigation
        }
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  mapArea: {
    flex: 1,
    position: 'relative',
  },

  mapStatus: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor:
      'rgba(17,17,17,0.90)',
  },

  statusItem: {
    alignItems: 'center',
  },

  statusLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '900',
  },

  statusValue: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 3,
  },

  successText: {
    color: colors.success,
  },

  dangerText: {
    color: colors.danger,
  },

  statusDivider: {
    width: 1,
    height: 27,
    backgroundColor: colors.border,
    marginHorizontal: 13,
  },

  onlineButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    minWidth: 125,
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    elevation: 10,
  },

  onlineButtonActive: {
    backgroundColor: colors.success,
  },

  onlineButtonInactive: {
    backgroundColor: colors.primary,
  },

  onlineDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  greenDot: {
    backgroundColor: colors.success,
  },

  redDot: {
    backgroundColor: colors.primary,
  },

  onlineButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },

  errorCard: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor:
      'rgba(183,28,28,0.92)',
  },

  errorText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
});
