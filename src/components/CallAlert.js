import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Vibration,
  Dimensions,
  Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

function normalizeCity(value) {
  return String(value || '').trim();
}

function numberValue(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function formatMoney(value) {
  return numberValue(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatKm(value) {
  return numberValue(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
}

export default function CallAlert({
  visible,
  delivery,
  onAccept,
  onReject,
  darkMode,
}) {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!visible) {
      setTimeLeft(30);
      return undefined;
    }

    Vibration.vibrate([500, 200, 500, 200, 500]);

    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    ).catch(() => {});

    const timer = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          clearInterval(timer);

          if (typeof onReject === 'function') {
            onReject();
          }

          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, onReject]);

  const deliveryData = useMemo(() => {
    const pickupCity = normalizeCity(
      delivery?.pickup_city ??
      delivery?.pickupCity ??
      delivery?.origin_city ??
      delivery?.originCity
    );

    const destinationCity = normalizeCity(
      delivery?.destination_city ??
      delivery?.delivery_city ??
      delivery?.destinationCity ??
      delivery?.deliveryCity
    );

    const outboundKm = numberValue(
      delivery?.distance_outbound_km ??
      delivery?.route_distance_km ??
      delivery?.distanceOutboundKm
    );

    const totalKm = numberValue(
      delivery?.distance_total_km ??
      delivery?.billable_distance_km ??
      delivery?.distanceTotalKm,
      outboundKm
    );

    const returnKm = numberValue(
      delivery?.distance_return_km ??
      delivery?.distanceReturnKm,
      Math.max(0, totalKm - outboundKm)
    );

    const driverAmount = numberValue(
      delivery?.driver_amount ??
      delivery?.driverAmount ??
      delivery?.driver_earnings ??
      delivery?.value
    );

    const earningsPerKm = numberValue(
      delivery?.earnings_per_km ??
      delivery?.earningsPerKm,
      totalKm > 0
        ? driverAmount / totalKm
        : 0
    );

    const estimatedMinutes = numberValue(
      delivery?.estimated_duration_minutes ??
      delivery?.estimated_time_minutes ??
      delivery?.estimatedTimeMinutes
    );

    const packageDescription =
      delivery?.package_description ||
      delivery?.package_type ||
      'Encomenda';

    const deliveryType =
      delivery?.delivery_type ||
      (
        pickupCity &&
        destinationCity &&
        pickupCity.toLocaleLowerCase('pt-BR') !==
          destinationCity.toLocaleLowerCase('pt-BR')
          ? 'intercity'
          : 'urban'
      );

    return {
      pickupCity: pickupCity || 'Origem',
      destinationCity: destinationCity || 'Destino',
      outboundKm,
      returnKm,
      totalKm,
      driverAmount,
      earningsPerKm,
      estimatedMinutes,
      packageDescription,
      deliveryType,
    };
  }, [delivery]);

  const profitability = useMemo(() => {
    if (deliveryData.earningsPerKm >= 1.1) {
      return {
        label: 'EXCELENTE',
        styleKey: 'excellent',
      };
    }

    if (deliveryData.earningsPerKm >= 1) {
      return {
        label: 'BOA',
        styleKey: 'good',
      };
    }

    return {
      label: 'BAIXA',
      styleKey: 'low',
    };
  }, [deliveryData.earningsPerKm]);

  const styles = getStyles(darkMode);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onReject}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextArea}>
              <Text style={styles.emoji}>
                {deliveryData.deliveryType === 'intercity'
                  ? '🚚'
                  : '🏍️'}
              </Text>

              <View>
                <Text style={styles.title}>
                  NOVA CORRIDA
                </Text>

                <Text style={styles.subtitle}>
                  {deliveryData.deliveryType === 'intercity'
                    ? 'Entrega entre cidades'
                    : 'Entrega urbana'}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.profitabilityBadge,
                profitability.styleKey === 'excellent'
                  ? styles.profitabilityExcellent
                  : profitability.styleKey === 'good'
                  ? styles.profitabilityGood
                  : styles.profitabilityLow,
              ]}
            >
              <Text style={styles.profitabilityText}>
                {profitability.label}
              </Text>
            </View>
          </View>

          <View style={styles.timerContainer}>
            <View style={styles.timerHeader}>
              <Text style={styles.timer}>
                ⏱️ {timeLeft}s para decidir
              </Text>
            </View>

            <View style={styles.timerTrack}>
              <View
                style={[
                  styles.timerBar,
                  {
                    width: `${Math.max(
                      0,
                      (timeLeft / 30) * 100
                    )}%`,
                  },
                ]}
              />
            </View>
          </View>

          <View
            style={[
              styles.routeArea,
              darkMode && styles.routeAreaDark,
            ]}
          >
            <Text
              style={[
                styles.routeCity,
                darkMode && styles.textLight,
              ]}
              numberOfLines={1}
            >
              {deliveryData.pickupCity.toUpperCase()}
            </Text>

            <Text style={styles.routeArrow}>➜</Text>

            <Text
              style={[
                styles.routeCity,
                darkMode && styles.textLight,
              ]}
              numberOfLines={1}
            >
              {deliveryData.destinationCity.toUpperCase()}
            </Text>
          </View>

          <Text
            style={[
              styles.packageDescription,
              darkMode && styles.textSecondary,
            ]}
            numberOfLines={2}
          >
            📦 {deliveryData.packageDescription}
          </Text>

          <View style={styles.distanceGrid}>
            <View
              style={[
                styles.distanceCard,
                darkMode && styles.distanceCardDark,
              ]}
            >
              <Text style={styles.distanceIcon}>🛣️</Text>
              <Text
                style={[
                  styles.distanceLabel,
                  darkMode && styles.textSecondary,
                ]}
              >
                Ida
              </Text>
              <Text
                style={[
                  styles.distanceValue,
                  darkMode && styles.textLight,
                ]}
              >
                {formatKm(deliveryData.outboundKm)} km
              </Text>
            </View>

            <View
              style={[
                styles.distanceCard,
                darkMode && styles.distanceCardDark,
              ]}
            >
              <Text style={styles.distanceIcon}>🔄</Text>
              <Text
                style={[
                  styles.distanceLabel,
                  darkMode && styles.textSecondary,
                ]}
              >
                Retorno
              </Text>
              <Text
                style={[
                  styles.distanceValue,
                  darkMode && styles.textLight,
                ]}
              >
                {formatKm(deliveryData.returnKm)} km
              </Text>
            </View>

            <View
              style={[
                styles.distanceCard,
                darkMode && styles.distanceCardDark,
              ]}
            >
              <Text style={styles.distanceIcon}>🚗</Text>
              <Text
                style={[
                  styles.distanceLabel,
                  darkMode && styles.textSecondary,
                ]}
              >
                Total
              </Text>
              <Text
                style={[
                  styles.distanceValue,
                  darkMode && styles.textLight,
                ]}
              >
                {formatKm(deliveryData.totalKm)} km
              </Text>
            </View>

            <View
              style={[
                styles.distanceCard,
                darkMode && styles.distanceCardDark,
              ]}
            >
              <Text style={styles.distanceIcon}>⏱️</Text>
              <Text
                style={[
                  styles.distanceLabel,
                  darkMode && styles.textSecondary,
                ]}
              >
                Tempo
              </Text>
              <Text
                style={[
                  styles.distanceValue,
                  darkMode && styles.textLight,
                ]}
              >
                {deliveryData.estimatedMinutes > 0
                  ? `${Math.round(
                      deliveryData.estimatedMinutes
                    )} min`
                  : 'Calculando'}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.paymentArea,
              darkMode && styles.paymentAreaDark,
            ]}
          >
            <View>
              <Text
                style={[
                  styles.paymentLabel,
                  darkMode && styles.textSecondary,
                ]}
              >
                Você recebe
              </Text>

              <Text style={styles.paymentValue}>
                R$ {formatMoney(
                  deliveryData.driverAmount
                )}
              </Text>
            </View>

            <View style={styles.perKmArea}>
              <Text
                style={[
                  styles.perKmLabel,
                  darkMode && styles.textSecondary,
                ]}
              >
                Ganho por km
              </Text>

              <Text
                style={[
                  styles.perKmValue,
                  darkMode && styles.textLight,
                ]}
              >
                R$ {formatMoney(
                  deliveryData.earningsPerKm
                )}/km
              </Text>
            </View>
          </View>

          {deliveryData.deliveryType === 'intercity' && (
            <Text
              style={[
                styles.returnNotice,
                darkMode && styles.textSecondary,
              ]}
            >
              ✅ O valor considera a ida e o retorno do entregador.
            </Text>
          )}

          <View style={styles.buttons}>
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                styles.btnReject,
                pressed && styles.btnPressed,
              ]}
              onPress={() => {
                Vibration.vibrate(200);

                if (typeof onReject === 'function') {
                  onReject();
                }
              }}
            >
              <Text style={styles.btnRejectText}>
                RECUSAR
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.btn,
                styles.btnAccept,
                pressed && styles.btnPressed,
              ]}
              onPress={() => {
                Vibration.vibrate(100);

                if (typeof onAccept === 'function') {
                  onAccept();
                }
              }}
            >
              <Text style={styles.btnAcceptText}>
                ACEITAR CORRIDA
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function getStyles(darkMode) {
  const background = darkMode
    ? '#1a2740'
    : '#ffffff';

  const textPrimary = darkMode
    ? '#e8edf5'
    : '#172033';

  const textSecondary = darkMode
    ? '#b0c4db'
    : '#596579';

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(4, 12, 24, 0.88)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 24,
    },

    card: {
      backgroundColor: background,
      borderRadius: 26,
      padding: 20,
      width: width * 0.92,
      maxWidth: 430,
      borderWidth: 2,
      borderColor: '#f26522',
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.35,
      shadowRadius: 18,
      elevation: 15,
    },

    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10,
      marginBottom: 15,
    },

    headerTextArea: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
    },

    emoji: {
      fontSize: 37,
      marginRight: 10,
    },

    title: {
      fontSize: 22,
      fontWeight: '900',
      color: '#f26522',
      letterSpacing: 0.5,
    },

    subtitle: {
      color: textSecondary,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 2,
    },

    profitabilityBadge: {
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },

    profitabilityExcellent: {
      backgroundColor: '#15803d',
    },

    profitabilityGood: {
      backgroundColor: '#d97706',
    },

    profitabilityLow: {
      backgroundColor: '#b91c1c',
    },

    profitabilityText: {
      color: '#ffffff',
      fontWeight: '900',
      fontSize: 10,
    },

    timerContainer: {
      marginBottom: 14,
    },

    timerHeader: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 6,
    },

    timer: {
      color: textPrimary,
      fontSize: 14,
      fontWeight: '800',
    },

    timerTrack: {
      width: '100%',
      height: 6,
      borderRadius: 3,
      backgroundColor: darkMode
        ? '#33405a'
        : '#f1f3f6',
      overflow: 'hidden',
    },

    timerBar: {
      height: '100%',
      backgroundColor: '#f26522',
      borderRadius: 3,
    },

    routeArea: {
      backgroundColor: '#fff4ed',
      borderRadius: 15,
      paddingHorizontal: 13,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: '#fed7c2',
    },

    routeAreaDark: {
      backgroundColor: '#2b2d32',
      borderColor: '#7a4126',
    },

    routeCity: {
      flex: 1,
      color: textPrimary,
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '900',
    },

    routeArrow: {
      color: '#f26522',
      fontSize: 22,
      fontWeight: '900',
      marginHorizontal: 8,
    },

    packageDescription: {
      color: textSecondary,
      textAlign: 'center',
      fontSize: 13,
      fontWeight: '600',
      marginVertical: 12,
    },

    distanceGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },

    distanceCard: {
      width: '48.5%',
      borderRadius: 13,
      backgroundColor: '#f7f9fc',
      borderWidth: 1,
      borderColor: '#e4eaf1',
      padding: 11,
      marginBottom: 9,
    },

    distanceCardDark: {
      backgroundColor: '#18243b',
      borderColor: '#2a3a5a',
    },

    distanceIcon: {
      fontSize: 19,
      marginBottom: 4,
    },

    distanceLabel: {
      color: textSecondary,
      fontSize: 11,
      marginBottom: 2,
    },

    distanceValue: {
      color: textPrimary,
      fontSize: 17,
      fontWeight: '900',
    },

    paymentArea: {
      backgroundColor: '#ecfdf3',
      borderRadius: 15,
      padding: 14,
      marginTop: 3,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#bbf7d0',
    },

    paymentAreaDark: {
      backgroundColor: '#133523',
      borderColor: '#1d6840',
    },

    paymentLabel: {
      color: textSecondary,
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 1,
    },

    paymentValue: {
      color: '#15803d',
      fontSize: 25,
      fontWeight: '900',
    },

    perKmArea: {
      alignItems: 'flex-end',
      marginLeft: 8,
    },

    perKmLabel: {
      color: textSecondary,
      fontSize: 11,
      marginBottom: 2,
    },

    perKmValue: {
      color: textPrimary,
      fontSize: 14,
      fontWeight: '800',
    },

    returnNotice: {
      color: textSecondary,
      textAlign: 'center',
      fontSize: 11,
      lineHeight: 16,
      marginTop: 10,
      paddingHorizontal: 6,
    },

    buttons: {
      flexDirection: 'row',
      width: '100%',
      gap: 10,
      marginTop: 15,
    },

    btn: {
      minHeight: 52,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },

    btnReject: {
      width: '34%',
      backgroundColor: darkMode
        ? '#382129'
        : '#fff1f1',
      borderWidth: 1,
      borderColor: '#ef4444',
    },

    btnAccept: {
      flex: 1,
      backgroundColor: '#16a34a',
    },

    btnPressed: {
      opacity: 0.82,
      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    btnRejectText: {
      color: '#dc2626',
      fontSize: 13,
      fontWeight: '900',
    },

    btnAcceptText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '900',
      letterSpacing: 0.3,
    },

    textLight: {
      color: textPrimary,
    },

    textSecondary: {
      color: textSecondary,
    },
  });
}
