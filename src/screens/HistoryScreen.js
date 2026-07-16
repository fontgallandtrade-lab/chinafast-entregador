import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useState,
} from 'react';

import { useDeliveries } from '../context/DeliveryContext';

import {
  deliveryStatusLabel,
} from '../utils/deliveryStatus';

import {
  formatAddress,
  formatDateTime,
  formatDistance,
  formatMoney,
} from '../utils/formatters';

export default function HistoryScreen() {
  const {
    history,
    loading,
    refreshAll,
  } = useDeliveries();

  const [refreshing, setRefreshing] =
    useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        <Text style={styles.title}>
          Histórico
        </Text>

        <Text style={styles.subtitle}>
          Entregas concluídas e canceladas
        </Text>

        {loading && history.length === 0 ? (
          <ActivityIndicator
            size="large"
            color="#d71920"
          />
        ) : history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              📋
            </Text>

            <Text style={styles.emptyTitle}>
              Histórico vazio
            </Text>

            <Text style={styles.emptyText}>
              Suas entregas concluídas aparecerão
              aqui.
            </Text>
          </View>
        ) : (
          history.map((delivery) => (
            <View
              key={delivery.id}
              style={styles.card}
            >
              <View style={styles.header}>
                <View>
                  <Text style={styles.code}>
                    {delivery.public_code}
                  </Text>

                  <Text style={styles.date}>
                    {formatDateTime(
                      delivery.delivered_at ||
                        delivery.created_at
                    )}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.status,
                    delivery.status ===
                    'delivered'
                      ? styles.success
                      : styles.cancelled,
                  ]}
                >
                  {deliveryStatusLabel(
                    delivery.status
                  )}
                </Text>
              </View>

              <View style={styles.route}>
                <Text style={styles.label}>
                  COLETA
                </Text>

                <Text style={styles.address}>
                  {formatAddress(
                    delivery,
                    'pickup'
                  )}
                </Text>

                <Text style={styles.label}>
                  DESTINO
                </Text>

                <Text style={styles.address}>
                  {formatAddress(
                    delivery,
                    'destination'
                  )}
                </Text>
              </View>

              <View style={styles.footer}>
                <Text style={styles.distance}>
                  {formatDistance(
                    delivery.route_distance_km
                  )}
                </Text>

                <Text style={styles.money}>
                  {formatMoney(
                    delivery.driver_amount
                  )}
                </Text>
              </View>
            </View>
          ))
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

  content: {
    padding: 20,
    paddingBottom: 110,
  },

  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
  },

  subtitle: {
    color: '#aaaaaa',
    marginTop: 5,
    marginBottom: 20,
  },

  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 46,
  },

  emptyTitle: {
    color: '#111111',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 12,
  },

  emptyText: {
    color: '#777777',
    textAlign: 'center',
    marginTop: 7,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 19,
    padding: 18,
    marginBottom: 13,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  code: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '900',
  },

  date: {
    color: '#888888',
    fontSize: 12,
    marginTop: 4,
  },

  status: {
    fontSize: 12,
    fontWeight: '900',
  },

  success: {
    color: '#2e7d32',
  },

  cancelled: {
    color: '#d71920',
  },

  route: {
    backgroundColor: '#f3f3f3',
    borderRadius: 14,
    padding: 14,
    marginTop: 15,
  },

  label: {
    color: '#888888',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 4,
  },

  address: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 3,
    marginBottom: 10,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  distance: {
    color: '#555555',
    fontWeight: '800',
  },

  money: {
    color: '#2e7d32',
    fontSize: 18,
    fontWeight: '900',
  },
});
