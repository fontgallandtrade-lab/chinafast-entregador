import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useDeliveries } from '../context/DeliveryContext';

export default function ProfileScreen() {
  const {
    driver,
    user,
    socketConnected,
    signOut,
  } = useAuth();

  const {
    history,
    activeDelivery,
  } = useDeliveries();

  const completedDeliveries =
    history.filter(
      (item) => item.status === 'delivered'
    ).length;

  function handleLogout() {
    Alert.alert(
      'Sair do aplicativo',
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>
          Meu perfil
        </Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(driver?.name || 'E')
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <Text style={styles.name}>
            {driver?.name}
          </Text>

          <Text style={styles.role}>
            Entregador ChinaFast
          </Text>

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

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              ⭐ {Number(
                driver?.rating || 0
              ).toFixed(1)}
            </Text>

            <Text style={styles.statLabel}>
              Avaliação
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {completedDeliveries}
            </Text>

            <Text style={styles.statLabel}>
              Concluídas
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {activeDelivery ? '1' : '0'}
            </Text>

            <Text style={styles.statLabel}>
              Em andamento
            </Text>
          </View>
        </View>

        <View style={styles.dataCard}>
          <ProfileItem
            label="Nome"
            value={driver?.name}
          />

          <ProfileItem
            label="E-mail"
            value={
              driver?.email || user?.email
            }
          />

          <ProfileItem
            label="Telefone"
            value={
              driver?.phone ||
              user?.phone ||
              'Não informado'
            }
          />

          <ProfileItem
            label="Status do cadastro"
            value={
              driver?.approval_status ===
              'approved'
                ? 'Aprovado'
                : driver?.approval_status
            }
          />

          <ProfileItem
            label="Status operacional"
            value={
              driver?.online
                ? 'Online'
                : 'Offline'
            }
          />

          <ProfileItem
            label="ID do entregador"
            value={String(driver?.id || '')}
            last
          />
        </View>

        <View style={styles.versionCard}>
          <Text style={styles.versionTitle}>
            ChinaFast Entregador
          </Text>

          <Text style={styles.versionText}>
            Versão Premium 2.0
          </Text>
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>
            SAIR DA CONTA
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileItem({
  label,
  value,
  last = false,
}) {
  return (
    <View
      style={[
        styles.item,
        last && styles.lastItem,
      ]}
    >
      <Text style={styles.itemLabel}>
        {label}
      </Text>

      <Text style={styles.itemValue}>
        {value || '--'}
      </Text>
    </View>
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
    marginBottom: 18,
  },

  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
  },

  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#d71920',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '900',
  },

  name: {
    color: '#111111',
    fontSize: 23,
    fontWeight: '900',
    marginTop: 14,
  },

  role: {
    color: '#777777',
    marginTop: 4,
  },

  connectionBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 13,
  },

  connected: {
    backgroundColor: '#2e7d32',
  },

  disconnected: {
    backgroundColor: '#d71920',
  },

  connectionText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#222222',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },

  statValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },

  statLabel: {
    color: '#999999',
    fontSize: 11,
    marginTop: 5,
  },

  dataCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 20,
    marginTop: 16,
  },

  item: {
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },

  lastItem: {
    borderBottomWidth: 0,
  },

  itemLabel: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '700',
  },

  itemValue: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 5,
  },

  versionCard: {
    backgroundColor: '#222222',
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
  },

  versionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },

  versionText: {
    color: '#999999',
    marginTop: 4,
  },

  logoutButton: {
    height: 58,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#d71920',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },

  logoutText: {
    color: '#ff5252',
    fontSize: 16,
    fontWeight: '900',
  },
});
