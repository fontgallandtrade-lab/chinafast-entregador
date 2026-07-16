import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  formatAddress,
  formatDistance,
  formatMoney,
} from '../utils/formatters';

import {
  deliveryStatusLabel,
} from '../utils/deliveryStatus';

export default function DeliveryCard({
  delivery,
  available = false,
  loading = false,
  onAccept,
  onOpen,
}) {
  if (!delivery) {
    return null;
  }

  return (
    <View
      style={[
        styles.card,
        available && styles.availableCard,
      ]}
    >
      <Text
        style={[
          styles.badge,
          available
            ? styles.availableBadge
            : styles.activeBadge,
        ]}
      >
        {available
          ? 'NOVA CORRIDA'
          : 'ENTREGA ATIVA'}
      </Text>

      <Text style={styles.code}>
        {delivery.public_code}
      </Text>

      {!available ? (
        <Text style={styles.status}>
          {deliveryStatusLabel(delivery.status)}
        </Text>
      ) : null}

      <View style={styles.route}>
        <Text style={styles.routeLabel}>
          COLETA
        </Text>

        <Text style={styles.routeText}>
          {formatAddress(delivery, 'pickup') ||
            'Endereço não informado'}
        </Text>

        <View style={styles.line} />

        <Text style={styles.routeLabel}>
          DESTINO
        </Text>

        <Text style={styles.routeText}>
          {formatAddress(
            delivery,
            'destination'
          ) || 'Endereço não informado'}
        </Text>
      </View>

      <View style={styles.summary}>
        <View>
          <Text style={styles.summaryLabel}>
            Distância
          </Text>

          <Text style={styles.summaryValue}>
            {formatDistance(
              delivery.route_distance_km
            )}
          </Text>
        </View>

        <View style={styles.alignRight}>
          <Text style={styles.summaryLabel}>
            Você recebe
          </Text>

          <Text style={styles.money}>
            {formatMoney(
              delivery.driver_amount
            )}
          </Text>
        </View>
      </View>

      {available ? (
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
            <Text style={styles.buttonText}>
              ACEITAR CORRIDA
            </Text>
          )}
        </Pressable>
      ) : (
        <Pressable
          style={styles.openButton}
          onPress={onOpen}
        >
          <Text style={styles.buttonText}>
            ABRIR ENTREGA
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },

  availableCard: {
    borderWidth: 3,
    borderColor: '#d71920',
  },

  badge: {
    alignSelf: 'flex-start',
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    overflow: 'hidden',
  },

  availableBadge: {
    backgroundColor: '#d71920',
  },

  activeBadge: {
    backgroundColor: '#2e7d32',
  },

  code: {
    color: '#111111',
    fontSize: 23,
    fontWeight: '900',
    marginTop: 13,
  },

  status: {
    color: '#2e7d32',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },

  route: {
    backgroundColor: '#f3f3f3',
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
  },

  routeLabel: {
    color: '#777777',
    fontSize: 11,
    fontWeight: '900',
  },

  routeText: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
    marginTop: 5,
  },

  line: {
    height: 1,
    backgroundColor: '#dddddd',
    marginVertical: 14,
  },

  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  alignRight: {
    alignItems: 'flex-end',
  },

  summaryLabel: {
    color: '#777777',
    fontSize: 12,
    fontWeight: '700',
  },

  summaryValue: {
    color: '#111111',
    fontSize: 19,
    fontWeight: '900',
    marginTop: 4,
  },

  money: {
    color: '#2e7d32',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },

  acceptButton: {
    height: 56,
    borderRadius: 15,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  openButton: {
    height: 56,
    borderRadius: 15,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },

  disabled: {
    opacity: 0.6,
  },
});
