import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

import {
  formatDateTime,
  formatMoney,
} from '../utils/formatters';

export default function WalletScreen() {
  const { token, driver } = useAuth();

  const [wallet, setWallet] = useState(null);
  const [statement, setStatement] = useState([]);
  const [withdrawals, setWithdrawals] =
    useState([]);

  const [amount, setAmount] = useState('');
  const [pixKey, setPixKey] = useState(
    driver?.pix_key || ''
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [requesting, setRequesting] =
    useState(false);

  const loadWallet = useCallback(async () => {
    try {
      const [
        walletData,
        statementData,
        withdrawalsData,
      ] = await Promise.all([
        api.wallet(token),
        api.walletStatement(token),
        api.withdrawals(token),
      ]);

      setWallet(walletData.wallet || {});
      setStatement(
        statementData.transactions || []
      );
      setWithdrawals(
        withdrawalsData.withdrawals || []
      );
    } catch (error) {
      Alert.alert(
        'Erro na carteira',
        error.message
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadWallet();
  }

  async function handleWithdrawal() {
    const withdrawalAmount = Number(
      String(amount).replace(',', '.')
    );

    if (
      !Number.isFinite(withdrawalAmount) ||
      withdrawalAmount < 50
    ) {
      Alert.alert(
        'Valor inválido',
        'O saque mínimo é de R$ 50,00.'
      );

      return;
    }

    if (!pixKey.trim()) {
      Alert.alert(
        'Chave Pix obrigatória',
        'Informe a chave Pix para receber o saque.'
      );

      return;
    }

    Alert.alert(
      'Confirmar saque',
      `Solicitar ${formatMoney(
        withdrawalAmount
      )} para a chave Pix informada?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: () =>
            requestWithdrawal(withdrawalAmount),
        },
      ]
    );
  }

  async function requestWithdrawal(
    withdrawalAmount
  ) {
    setRequesting(true);

    try {
      const result =
        await api.requestWithdrawal(
          token,
          withdrawalAmount,
          pixKey.trim()
        );

      Alert.alert(
        'Saque solicitado',
        result.message
      );

      setAmount('');
      await loadWallet();
    } catch (error) {
      Alert.alert(
        'Erro no saque',
        error.message
      );
    } finally {
      setRequesting(false);
    }
  }

  function transactionLabel(type) {
    const labels = {
      delivery_credit: 'Crédito de entrega',
      withdrawal_debit: 'Solicitação de saque',
      withdrawal_refund: 'Estorno de saque',
      adjustment_credit: 'Crédito de ajuste',
      adjustment_debit: 'Débito de ajuste',
    };

    return labels[type] || type;
  }

  function withdrawalStatus(status) {
    const labels = {
      pending: 'Pendente',
      approved: 'Aprovado',
      paid: 'Pago',
      rejected: 'Rejeitado',
    };

    return labels[status] || status;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#d71920"
        />

        <Text style={styles.loadingText}>
          Carregando carteira...
        </Text>
      </SafeAreaView>
    );
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
          Minha carteira
        </Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>
            Saldo disponível
          </Text>

          <Text style={styles.balanceValue}>
            {formatMoney(
              wallet?.available_balance
            )}
          </Text>

          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.smallLabel}>
                Bloqueado
              </Text>

              <Text style={styles.smallValue}>
                {formatMoney(
                  wallet?.blocked_balance
                )}
              </Text>
            </View>

            <View>
              <Text style={styles.smallLabel}>
                Total ganho
              </Text>

              <Text style={styles.smallValue}>
                {formatMoney(
                  wallet?.total_earned
                )}
              </Text>
            </View>

            <View>
              <Text style={styles.smallLabel}>
                Total sacado
              </Text>

              <Text style={styles.smallValue}>
                {formatMoney(
                  wallet?.total_withdrawn
                )}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.withdrawCard}>
          <Text style={styles.cardTitle}>
            Solicitar saque
          </Text>

          <Text style={styles.cardHint}>
            Valor mínimo: R$ 50,00
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Valor do saque"
            placeholderTextColor="#888888"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />

          <TextInput
            style={styles.input}
            placeholder="Chave Pix"
            placeholderTextColor="#888888"
            autoCapitalize="none"
            value={pixKey}
            onChangeText={setPixKey}
          />

          <Pressable
            style={[
              styles.withdrawButton,
              requesting && styles.disabled,
            ]}
            disabled={requesting}
            onPress={handleWithdrawal}
          >
            {requesting ? (
              <ActivityIndicator
                color="#ffffff"
              />
            ) : (
              <Text style={styles.buttonText}>
                SOLICITAR SAQUE
              </Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>
          Últimos saques
        </Text>

        {withdrawals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Nenhum saque solicitado.
            </Text>
          </View>
        ) : (
          withdrawals.slice(0, 10).map(
            (item) => (
              <View
                key={item.id}
                style={styles.listCard}
              >
                <View style={styles.listHeader}>
                  <Text style={styles.listTitle}>
                    {item.public_code}
                  </Text>

                  <Text
                    style={[
                      styles.status,
                      item.status === 'paid'
                        ? styles.statusSuccess
                        : item.status ===
                            'rejected'
                          ? styles.statusError
                          : styles.statusPending,
                    ]}
                  >
                    {withdrawalStatus(
                      item.status
                    )}
                  </Text>
                </View>

                <Text style={styles.listMoney}>
                  {formatMoney(item.amount)}
                </Text>

                <Text style={styles.listDate}>
                  {formatDateTime(
                    item.requested_at
                  )}
                </Text>

                {item.rejection_reason ? (
                  <Text style={styles.reason}>
                    {item.rejection_reason}
                  </Text>
                ) : null}
              </View>
            )
          )
        )}

        <Text style={styles.sectionTitle}>
          Extrato
        </Text>

        {statement.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Nenhuma movimentação.
            </Text>
          </View>
        ) : (
          statement.slice(0, 30).map(
            (item) => {
              const positive =
                Number(item.amount) >= 0 &&
                item.type !==
                  'withdrawal_debit';

              return (
                <View
                  key={item.id}
                  style={styles.listCard}
                >
                  <View
                    style={styles.listHeader}
                  >
                    <Text
                      style={styles.listTitle}
                    >
                      {transactionLabel(
                        item.type
                      )}
                    </Text>

                    <Text
                      style={[
                        styles.transactionMoney,
                        positive
                          ? styles.credit
                          : styles.debit,
                      ]}
                    >
                      {positive ? '+' : '-'}
                      {formatMoney(
                        Math.abs(
                          Number(item.amount)
                        )
                      )}
                    </Text>
                  </View>

                  <Text style={styles.description}>
                    {item.description}
                  </Text>

                  <Text style={styles.listDate}>
                    {formatDateTime(
                      item.created_at
                    )}
                  </Text>
                </View>
              );
            }
          )
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

  center: {
    flex: 1,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: '#ffffff',
    marginTop: 14,
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

  balanceCard: {
    backgroundColor: '#d71920',
    borderRadius: 22,
    padding: 22,
  },

  balanceLabel: {
    color: '#ffd5d5',
    fontSize: 14,
    fontWeight: '700',
  },

  balanceValue: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '900',
    marginTop: 6,
  },

  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },

  smallLabel: {
    color: '#ffd5d5',
    fontSize: 11,
    fontWeight: '700',
  },

  smallValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },

  withdrawCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
  },

  cardTitle: {
    color: '#111111',
    fontSize: 20,
    fontWeight: '900',
  },

  cardHint: {
    color: '#777777',
    marginTop: 5,
    marginBottom: 14,
  },

  input: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    color: '#111111',
    fontSize: 16,
    marginTop: 10,
  },

  withdrawButton: {
    height: 56,
    borderRadius: 15,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },

  disabled: {
    opacity: 0.6,
  },

  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 26,
    marginBottom: 12,
  },

  emptyCard: {
    backgroundColor: '#222222',
    borderRadius: 16,
    padding: 20,
  },

  emptyText: {
    color: '#aaaaaa',
    textAlign: 'center',
  },

  listCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 17,
    marginBottom: 10,
  },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  listTitle: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '900',
    flex: 1,
  },

  listMoney: {
    color: '#111111',
    fontSize: 21,
    fontWeight: '900',
    marginTop: 8,
  },

  listDate: {
    color: '#888888',
    fontSize: 12,
    marginTop: 7,
  },

  status: {
    fontSize: 12,
    fontWeight: '900',
  },

  statusSuccess: {
    color: '#2e7d32',
  },

  statusPending: {
    color: '#ef6c00',
  },

  statusError: {
    color: '#d71920',
  },

  reason: {
    color: '#d71920',
    marginTop: 8,
  },

  transactionMoney: {
    fontSize: 15,
    fontWeight: '900',
  },

  credit: {
    color: '#2e7d32',
  },

  debit: {
    color: '#d71920',
  },

  description: {
    color: '#666666',
    marginTop: 7,
  },
});
