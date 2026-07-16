import { StatusBar } from 'expo-status-bar';

import * as Location from 'expo-location';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { io } from 'socket.io-client';

const API_URL =
  'https://api.chamabebidas.com.br/api/v1';

const SOCKET_URL =
  'https://api.chamabebidas.com.br';

export default function App() {
  const [email, setEmail] = useState(
    'entregador@chinafast.com.br'
  );

  const [password, setPassword] = useState(
    'ChinaFastEntregador123'
  );

  const [token, setToken] = useState('');
  const [driver, setDriver] = useState(null);

  const [loading, setLoading] = useState(false);
  const [onlineLoading, setOnlineLoading] =
    useState(false);

  const [socketConnected, setSocketConnected] =
    useState(false);

  const [locationPermission, setLocationPermission] =
    useState(false);

  const [currentLocation, setCurrentLocation] =
    useState(null);

  const [locationError, setLocationError] =
    useState('');

  const [availableDelivery, setAvailableDelivery] =
    useState(null);

  const [activeDelivery, setActiveDelivery] =
    useState(null);

  const [deliveriesLoading, setDeliveriesLoading] =
    useState(false);

  const [acceptingDelivery, setAcceptingDelivery] =
    useState(false);

  const socketRef = useRef(null);
  const locationSubscriptionRef = useRef(null);

  useEffect(() => {
    return () => {
      stopLocationTracking();

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!token || !driver?.online) {
      setAvailableDelivery(null);
      return;
    }

    refreshDeliveries();

    const interval = setInterval(() => {
      refreshDeliveries();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [token, driver?.online]);

  async function login() {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        'Atenção',
        'Informe e-mail e senha.'
      );

      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.token) {
        throw new Error(
          data.message ||
            'Não foi possível entrar.'
        );
      }

      if (
        data.user?.role !== 'driver'
      ) {
        throw new Error(
          'Este acesso não pertence a um entregador.'
        );
      }

      const profileResponse = await fetch(
        `${API_URL}/driver/me`,
        {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        }
      );

      const profileData =
        await profileResponse.json();

      if (
        !profileResponse.ok ||
        !profileData.driver
      ) {
        throw new Error(
          profileData.message ||
            'Não foi possível carregar o perfil do entregador.'
        );
      }

      const driverProfile =
        profileData.driver;

      setToken(data.token);

      setDriver({
        id: Number(driverProfile.id),
        userId: Number(
          driverProfile.user_id
        ),
        name:
          driverProfile.name ||
          data.user?.name ||
          'Entregador',
        email:
          driverProfile.email ||
          data.user?.email,
        phone:
          driverProfile.phone ||
          data.user?.phone,
        online: Boolean(
          driverProfile.online
        ),
        approvalStatus:
          driverProfile.approval_status,
        rating: Number(
          driverProfile.rating || 0
        ),
      });

      connectSocket(
        Number(driverProfile.id)
      );
    } catch (error) {
      Alert.alert(
        'Erro no login',
        error.message
      );
    } finally {
      setLoading(false);
    }
  }

  function connectSocket(driverId) {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);

      socket.emit(
        'join-driver-room',
        driverId
      );
    });

    socket.on('disconnect', (reason) => {
      setSocketConnected(false);
      console.log('Socket.IO desconectado:', reason);
    });

    socket.on(
      'driver-online-status',
      (payload) => {
        if (
          Number(payload?.driverId) ===
          Number(driverId)
        ) {
          setDriver((current) =>
            current
              ? {
                  ...current,
                  online: Boolean(
                    payload.online
                  ),
                }
              : current
          );
        }
      }
    );

    socket.on(
      'connect_error',
      (error) => {
        console.log(
          'Erro de conexão Socket.IO:',
          error.message
        );
      }
    );
  }

  async function requestLocationPermission() {
    setLocationError('');

    const result =
      await Location.requestForegroundPermissionsAsync();

    const granted =
      result.status === 'granted';

    setLocationPermission(granted);

    if (!granted) {
      setLocationError(
        'Permissão de localização negada.'
      );

      Alert.alert(
        'Localização necessária',
        'Permita o acesso à localização para ficar online.'
      );
    }

    return granted;
  }

  async function startLocationTracking() {
    if (!driver?.id) {
      return;
    }

    let granted = locationPermission;

    if (!granted) {
      granted =
        await requestLocationPermission();
    }

    if (!granted) {
      return;
    }

    stopLocationTracking();

    const initialLocation =
      await Location.getCurrentPositionAsync({
        accuracy:
          Location.Accuracy.High,
      });

    sendLocation(initialLocation);

    locationSubscriptionRef.current =
      await Location.watchPositionAsync(
        {
          accuracy:
            Location.Accuracy.High,
          timeInterval: 8000,
          distanceInterval: 10,
        },
        (location) => {
          sendLocation(location);
        }
      );
  }

  function stopLocationTracking() {
    if (
      locationSubscriptionRef.current
    ) {
      locationSubscriptionRef.current.remove();

      locationSubscriptionRef.current =
        null;
    }
  }

  function sendLocation(location) {
    const latitude =
      location?.coords?.latitude;

    const longitude =
      location?.coords?.longitude;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return;
    }

    const payload = {
      driverId: driver?.id,
      deliveryId: null,
      latitude,
      longitude,
      heading:
        location.coords.heading ?? null,
      speed:
        location.coords.speed ?? null,
    };

    setCurrentLocation({
      latitude,
      longitude,
      accuracy:
        location.coords.accuracy,
      heading:
        location.coords.heading,
      speed:
        location.coords.speed,
      timestamp:
        location.timestamp,
    });

    socketRef.current?.emit(
      'driver-location',
      payload
    );
  }

  async function toggleOnline(
    nextOnline
  ) {
    if (!driver?.id) {
      return;
    }

    setOnlineLoading(true);

    try {
      if (nextOnline) {
        const granted =
          await requestLocationPermission();

        if (!granted) {
          return;
        }

        socketRef.current?.emit(
          'driver-online',
          {
            driverId: driver.id,
          }
        );

        setDriver((current) => ({
          ...current,
          online: true,
        }));

        await startLocationTracking();
      } else {
        socketRef.current?.emit(
          'driver-offline',
          {
            driverId: driver.id,
          }
        );

        stopLocationTracking();

        setDriver((current) => ({
          ...current,
          online: false,
        }));
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        error.message ||
          'Não foi possível alterar o status.'
      );
    } finally {
      setOnlineLoading(false);
    }
  }

  async function refreshDeliveries() {
    if (!token) {
      return;
    }

    setDeliveriesLoading(true);

    try {
      const myResponse = await fetch(
        `${API_URL}/driver/deliveries/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const myData = await myResponse.json();

      if (!myResponse.ok) {
        throw new Error(
          myData.message ||
            'Erro ao carregar suas entregas.'
        );
      }

      const activeStatuses = [
        'accepted',
        'driver_going_to_pickup',
        'arrived_at_pickup',
        'picked_up',
        'in_transit',
        'arrived_at_destination',
      ];

      const currentDelivery =
        (myData.deliveries || []).find(
          (item) =>
            activeStatuses.includes(item.status)
        ) || null;

      setActiveDelivery(currentDelivery);

      if (currentDelivery) {
        setAvailableDelivery(null);

        socketRef.current?.emit(
          'join-delivery-room',
          currentDelivery.id
        );

        return;
      }

      const availableResponse = await fetch(
        `${API_URL}/driver/deliveries/available`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const availableData =
        await availableResponse.json();

      if (!availableResponse.ok) {
        throw new Error(
          availableData.message ||
            'Erro ao buscar corridas.'
        );
      }

      setAvailableDelivery(
        availableData.deliveries?.[0] || null
      );
    } catch (error) {
      console.log(
        'Erro ao atualizar corridas:',
        error.message
      );
    } finally {
      setDeliveriesLoading(false);
    }
  }

  async function acceptDelivery() {
    if (!availableDelivery?.id || !token) {
      return;
    }

    setAcceptingDelivery(true);

    try {
      const response = await fetch(
        `${API_URL}/driver/deliveries/${availableDelivery.id}/accept`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Não foi possível aceitar a corrida.'
        );
      }

      Alert.alert(
        'Corrida aceita',
        'A entrega foi reservada para você.'
      );

      setAvailableDelivery(null);

      socketRef.current?.emit(
        'join-delivery-room',
        availableDelivery.id
      );

      await refreshDeliveries();
    } catch (error) {
      Alert.alert(
        'Erro ao aceitar',
        error.message
      );

      await refreshDeliveries();
    } finally {
      setAcceptingDelivery(false);
    }
  }

  function formatMoney(value) {
    return Number(value || 0).toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL',
      }
    );
  }

  function formatAddress(delivery, type) {
    const prefix =
      type === 'pickup'
        ? 'pickup'
        : 'destination';

    return [
      delivery?.[`${prefix}_street`],
      delivery?.[`${prefix}_number`],
      delivery?.[`${prefix}_neighborhood`],
      delivery?.[`${prefix}_city`],
    ]
      .filter(Boolean)
      .join(', ');
  }

  function statusLabel(status) {
    const labels = {
      accepted: 'Corrida aceita',
      driver_going_to_pickup:
        'A caminho da coleta',
      arrived_at_pickup:
        'Chegou à coleta',
      picked_up: 'Pacote coletado',
      in_transit: 'Em trânsito',
      arrived_at_destination:
        'Chegou ao destino',
      delivered: 'Entrega concluída',
    };

    return labels[status] || status;
  }

  function logout() {
    if (driver?.online) {
      socketRef.current?.emit(
        'driver-offline',
        {
          driverId: driver.id,
        }
      );
    }

    stopLocationTracking();

    socketRef.current?.disconnect();
    socketRef.current = null;

    setToken('');
    setDriver(null);
    setCurrentLocation(null);
    setSocketConnected(false);
  }

  if (!token || !driver) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />

        <View style={styles.loginContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>
              🚚
            </Text>
          </View>

          <Text style={styles.brand}>
            ChinaFast
          </Text>

          <Text style={styles.loginTitle}>
            App do entregador
          </Text>

          <Text style={styles.loginSubtitle}>
            Entre para ficar online e receber
            corridas.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#8b8b8b"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#8b8b8b"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={[
              styles.primaryButton,
              loading &&
                styles.buttonDisabled,
            ]}
            disabled={loading}
            onPress={login}
          >
            {loading ? (
              <ActivityIndicator
                color="#ffffff"
              />
            ) : (
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Entrar
              </Text>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerBrand}>
              ChinaFast
            </Text>

            <Text style={styles.headerName}>
              {driver.name}
            </Text>
          </View>

          <Pressable
            style={styles.logoutButton}
            onPress={logout}
          >
            <Text
              style={styles.logoutButtonText}
            >
              Sair
            </Text>
          </Pressable>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View>
              <Text style={styles.cardLabel}>
                Status do entregador
              </Text>

              <Text
                style={[
                  styles.statusText,
                  driver.online
                    ? styles.onlineText
                    : styles.offlineText,
                ]}
              >
                {driver.online
                  ? 'ONLINE'
                  : 'OFFLINE'}
              </Text>
            </View>

            {onlineLoading ? (
              <ActivityIndicator
                color="#d71920"
              />
            ) : (
              <Switch
                value={driver.online}
                onValueChange={toggleOnline}
                trackColor={{
                  false: '#cfcfcf',
                  true: '#66bb6a',
                }}
                thumbColor={
                  driver.online
                    ? '#ffffff'
                    : '#f4f4f4'
                }
              />
            )}
          </View>

          <Text style={styles.statusHint}>
            {driver.online
              ? 'Sua localização está sendo enviada para a Central Operacional.'
              : 'Ative o status online para começar a enviar sua localização.'}
          </Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>
              Socket.IO
            </Text>

            <Text
              style={[
                styles.infoValue,
                socketConnected
                  ? styles.connectedText
                  : styles.disconnectedText,
              ]}
            >
              {socketConnected
                ? 'Conectado'
                : 'Desconectado'}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>
              Localização
            </Text>

            <Text style={styles.infoValue}>
              {locationPermission
                ? 'Permitida'
                : 'Não permitida'}
            </Text>
          </View>
        </View>

        <View style={styles.locationCard}>
          <Text style={styles.cardTitle}>
            Localização atual
          </Text>

          {currentLocation ? (
            <>
              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>
                  Latitude
                </Text>

                <Text style={styles.locationValue}>
                  {currentLocation.latitude.toFixed(
                    7
                  )}
                </Text>
              </View>

              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>
                  Longitude
                </Text>

                <Text style={styles.locationValue}>
                  {currentLocation.longitude.toFixed(
                    7
                  )}
                </Text>
              </View>

              <View style={styles.locationRow}>
                <Text style={styles.locationLabel}>
                  Precisão
                </Text>

                <Text style={styles.locationValue}>
                  {Number(
                    currentLocation.accuracy || 0
                  ).toFixed(1)}{' '}
                  m
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>
              Nenhuma localização enviada ainda.
            </Text>
          )}

          {locationError ? (
            <Text style={styles.errorText}>
              {locationError}
            </Text>
          ) : null}
        </View>

        {activeDelivery ? (
          <View style={styles.deliveryCard}>
            <Text style={styles.deliveryBadge}>
              ENTREGA ATIVA
            </Text>

            <Text style={styles.deliveryCode}>
              {activeDelivery.public_code}
            </Text>

            <Text style={styles.deliveryStatus}>
              {statusLabel(activeDelivery.status)}
            </Text>

            <View style={styles.routeBox}>
              <Text style={styles.routeLabel}>
                COLETA
              </Text>

              <Text style={styles.routeText}>
                {formatAddress(
                  activeDelivery,
                  'pickup'
                )}
              </Text>

              <Text style={styles.routeLabel}>
                DESTINO
              </Text>

              <Text style={styles.routeText}>
                {formatAddress(
                  activeDelivery,
                  'destination'
                )}
              </Text>
            </View>

            <View style={styles.deliveryFooter}>
              <View>
                <Text style={styles.footerLabel}>
                  Distância
                </Text>

                <Text style={styles.footerValue}>
                  {Number(
                    activeDelivery.route_distance_km ||
                      0
                  ).toFixed(1)}{' '}
                  km
                </Text>
              </View>

              <View>
                <Text style={styles.footerLabel}>
                  Você recebe
                </Text>

                <Text style={styles.moneyValue}>
                  {formatMoney(
                    activeDelivery.driver_amount
                  )}
                </Text>
              </View>
            </View>
          </View>
        ) : availableDelivery ? (
          <View style={styles.offerCard}>
            <Text style={styles.offerBadge}>
              NOVA CORRIDA
            </Text>

            <Text style={styles.deliveryCode}>
              {availableDelivery.public_code}
            </Text>

            <View style={styles.routeBox}>
              <Text style={styles.routeLabel}>
                COLETA
              </Text>

              <Text style={styles.routeText}>
                {formatAddress(
                  availableDelivery,
                  'pickup'
                )}
              </Text>

              <Text style={styles.routeLabel}>
                DESTINO
              </Text>

              <Text style={styles.routeText}>
                {formatAddress(
                  availableDelivery,
                  'destination'
                )}
              </Text>
            </View>

            <View style={styles.deliveryFooter}>
              <View>
                <Text style={styles.footerLabel}>
                  Distância
                </Text>

                <Text style={styles.footerValue}>
                  {Number(
                    availableDelivery.route_distance_km ||
                      0
                  ).toFixed(1)}{' '}
                  km
                </Text>
              </View>

              <View>
                <Text style={styles.footerLabel}>
                  Você recebe
                </Text>

                <Text style={styles.moneyValue}>
                  {formatMoney(
                    availableDelivery.driver_amount
                  )}
                </Text>
              </View>
            </View>

            <Pressable
              style={[
                styles.acceptButton,
                acceptingDelivery &&
                  styles.buttonDisabled,
              ]}
              disabled={acceptingDelivery}
              onPress={acceptDelivery}
            >
              {acceptingDelivery ? (
                <ActivityIndicator
                  color="#ffffff"
                />
              ) : (
                <Text
                  style={styles.acceptButtonText}
                >
                  ACEITAR CORRIDA
                </Text>
              )}
            </Pressable>
          </View>
        ) : (
          <View style={styles.emptyDeliveryCard}>
            <Text style={styles.cardTitle}>
              Corridas
            </Text>

            {deliveriesLoading ? (
              <ActivityIndicator
                color="#d71920"
              />
            ) : (
              <Text style={styles.emptyText}>
                Nenhuma corrida disponível neste
                momento.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111111',
  },

  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#111111',
  },

  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d71920',
    marginBottom: 18,
  },

  logoEmoji: {
    fontSize: 42,
  },

  brand: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
  },

  loginTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
  },

  loginSubtitle: {
    color: '#b8b8b8',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },

  input: {
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#ffffff',
    color: '#111111',
    fontSize: 16,
  },

  primaryButton: {
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d71920',
    marginTop: 6,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  headerBrand: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
  },

  headerName: {
    color: '#c7c7c7',
    fontSize: 15,
    marginTop: 3,
  },

  logoutButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444444',
  },

  logoutButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },

  statusCard: {
    padding: 22,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },

  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardLabel: {
    color: '#777777',
    fontSize: 14,
    fontWeight: '700',
  },

  statusText: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 5,
  },

  onlineText: {
    color: '#2e7d32',
  },

  offlineText: {
    color: '#d71920',
  },

  statusHint: {
    color: '#666666',
    lineHeight: 20,
    marginTop: 16,
  },

  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  infoCard: {
    flex: 1,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#ffffff',
  },

  infoLabel: {
    color: '#777777',
    fontSize: 13,
    fontWeight: '700',
  },

  infoValue: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 7,
  },

  connectedText: {
    color: '#2e7d32',
  },

  disconnectedText: {
    color: '#d71920',
  },

  locationCard: {
    padding: 22,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },

  emptyDeliveryCard: {
    padding: 22,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },

  deliveryCard: {
    padding: 22,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },

  offerCard: {
    padding: 22,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#d71920',
  },

  offerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#d71920',
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
  },

  deliveryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2e7d32',
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
  },

  deliveryCode: {
    color: '#111111',
    fontSize: 24,
    fontWeight: '900',
  },

  deliveryStatus: {
    color: '#2e7d32',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 6,
  },

  routeBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f3f3f3',
  },

  routeLabel: {
    color: '#777777',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 7,
  },

  routeText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    marginTop: 4,
    marginBottom: 10,
  },

  deliveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  footerLabel: {
    color: '#777777',
    fontSize: 12,
    fontWeight: '700',
  },

  footerValue: {
    color: '#111111',
    fontSize: 19,
    fontWeight: '900',
    marginTop: 4,
  },

  moneyValue: {
    color: '#2e7d32',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },

  acceptButton: {
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e7d32',
    marginTop: 22,
  },

  acceptButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
  },

  cardTitle: {
    color: '#111111',
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 16,
  },

  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#ededed',
  },

  locationLabel: {
    color: '#777777',
    fontWeight: '700',
  },

  locationValue: {
    color: '#111111',
    fontWeight: '900',
  },

  emptyText: {
    color: '#777777',
    lineHeight: 21,
  },

  errorText: {
    color: '#d71920',
    marginTop: 14,
    fontWeight: '700',
  },
});
