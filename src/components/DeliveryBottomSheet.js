import React from 'react';

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import colors from '../theme/colors';

import {
  formatAddress,
  formatDistance,
  formatMoney,
} from '../utils/formatters';

import {
  deliveryStatusLabel,
} from '../utils/deliveryStatus';

export default function DeliveryBottomSheet({
  delivery,
  activeDelivery,
  online = false,
  loading = false,
  onAccept,
  onReject,
  onOpenDelivery,
}) {
  const currentDelivery =
    activeDelivery || delivery;

  const isAvailable =
    Boolean(delivery) &&
    !activeDelivery;

  if (!currentDelivery) {
    return (
      <View style={styles.container}>
        <View style={styles.handle} />

        <View style={styles.waitingHeader}>
          <View
            style={[
              styles.statusDot,
              online
                ? styles.onlineDot
                : styles.offlineDot,
            ]}
          />

          <Text style={styles.waitingTitle}>
            {online
              ? 'Você está online'
              : 'Você está offline'}
          </Text>
        </View>

        <Text style={styles.waitingText}>
          {online
            ? 'Aguardando uma nova corrida próxima...'
            : 'Fique online para receber corridas.'}
        </Text>

        <View style={styles.waitingCard}>
          <Text style={styles.waitingIcon}>
            🚚
          </Text>

          <Text style={styles.waitingCardTitle}>
            Nenhuma corrida agora
          </Text>

          <Text style={styles.waitingCardText}>
            Quando uma entrega surgir, ela aparecerá
            automaticamente neste painel.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.handle} />

      <View style={styles.topRow}>
        <View>
          <Text
            style={[
              styles.badge,
              isAvailable
                ? styles.availableBadge
                : styles.activeBadge,
            ]}
          >
            {isAvailable
              ? 'NOVA CORRIDA'
              : 'ENTREGA ATIVA'}
          </Text>

          <Text style={styles.code}>
            {currentDelivery.public_code}
          </Text>
        </View>

        {!isAvailable ? (
          <Text style={styles.status}>
            {deliveryStatusLabel(
              currentDelivery.status
            )}
          </Text>
        ) : null}
      </View>

      <View style={styles.routeCard}>
        <View style={styles.routePoint}>
          <View style={styles.pickupDot} />

          <View style={styles.routeContent}>
            <Text style={styles.routeLabel}>
              COLETA
            </Text>

            <Text style={styles.routeText}>
              {formatAddress(
                currentDelivery,
                'pickup'
              ) || 'Endereço não informado'}
            </Text>
          </View>
        </View>

        <View style={styles.routeLine} />

        <View style={styles.routePoint}>
          <View style={styles.destinationDot} />

          <View style={styles.routeContent}>
            <Text style={styles.routeLabel}>
              DESTINO
            </Text>

            <Text style={styles.routeText}>
              {formatAddress(
                currentDelivery,
                'destination'
              ) || 'Endereço não informado'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>
            Distância
          </Text>

          <Text style={styles.summaryValue}>
            {formatDistance(
              currentDelivery.route_distance_km
            )}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>
            Tempo
          </Text>

          <Text style={styles.summaryValue}>
            {Number(
              currentDelivery.estimated_duration_minutes ||
                0
            )}{' '}
            min
          </Text>
        </View>

        <View style={styles.summaryItemRight}>
          <Text style={styles.summaryLabel}>
            Você recebe
          </Text>

          <Text style={styles.money}>
            {formatMoney(
              currentDelivery.driver_amount
            )}
          </Text>
        </View>
      </View>

      {isAvailable ? (
        <View style={styles.actionRow}>
          <Pressable
            style={styles.rejectButton}
            onPress={onReject}
          >
            <Text style={styles.rejectText}>
              RECUSAR
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.acceptButton,
              loading && styles.disabled,
            ]}
            disabled={loading}
            onPress={onAccept}
          >
            {loading ? (
              <ActivityIndicator
                color="#ffffff"
              />
            ) : (
              <Text style={styles.acceptText}>
                ACEITAR
              </Text>
            )}
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={styles.openButton}
          onPress={onOpenDelivery}
        >
          <Text style={styles.openText}>
            ABRIR ENTREGA
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderColor: colors.border,
  },

  handle: {
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#555555',
    alignSelf: 'center',
    marginBottom: 16,
  },

  waitingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    marginRight: 8,
  },

  onlineDot: {
    backgroundColor: colors.success,
  },

  offlineDot: {
    backgroundColor: colors.danger,
  },

  waitingTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },

  waitingText: {
    color: colors.textSecondary,
    marginTop: 7,
    lineHeight: 20,
  },

  waitingCard: {
    marginTop: 18,
    backgroundColor: colors.surfaceLight,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
  },

  waitingIcon: {
    fontSize: 38,
  },

  waitingCardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 10,
  },

  waitingCardText: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  badge: {
    alignSelf: 'flex-start',
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },

  availableBadge: {
    backgroundColor: colors.primary,
  },

  activeBadge: {
    backgroundColor: colors.success,
  },

  code: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10,
  },

  status: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '900',
    maxWidth: 140,
    textAlign: 'right',
  },

  routeCard: {
    marginTop: 17,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.surfaceLight,
  },

  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  pickupDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: colors.success,
    marginTop: 4,
    marginRight: 12,
  },

  destinationDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: colors.primary,
    marginTop: 4,
    marginRight: 12,
  },

  routeContent: {
    flex: 1,
  },

  routeLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '900',
  },

  routeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    marginTop: 4,
  },

  routeLine: {
    width: 2,
    height: 22,
    backgroundColor: '#555555',
    marginLeft: 5,
    marginVertical: 3,
  },

  summaryRow: {
    flexDirection: 'row',
    marginTop: 18,
  },

  summaryItem: {
    flex: 1,
  },

  summaryItemRight: {
    flex: 1.3,
    alignItems: 'flex-end',
  },

  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },

  summaryValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 5,
  },

  money: {
    color: colors.success,
    fontSize: 21,
    fontWeight: '900',
    marginTop: 5,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },

  rejectButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  acceptButton: {
    flex: 1.5,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rejectText: {
    color: '#ff6565',
    fontSize: 15,
    fontWeight: '900',
  },

  acceptText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },

  openButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  openText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },

  disabled: {
    opacity: 0.6,
  },
});
