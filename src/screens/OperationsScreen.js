import React from 'react';

import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import MenuModuleLayout from '../components/MenuModuleLayout';
import colors from '../theme/colors';

const SUPPORT_PHONE =
  '5515999999999';

export default function OperationsScreen({
  navigation,
}) {
  async function openWhatsApp() {
    const message =
      'Olá, sou entregador ChinaFast e preciso de atendimento operacional.';

    const url =
      `https://wa.me/${SUPPORT_PHONE}` +
      `?text=${encodeURIComponent(message)}`;

    const supported =
      await Linking.canOpenURL(url);

    if (!supported) {
      Alert.alert(
        'WhatsApp indisponível',
        'Não foi possível abrir o atendimento.'
      );

      return;
    }

    await Linking.openURL(url);
  }

  async function callSupport() {
    const url =
      `tel:+${SUPPORT_PHONE}`;

    const supported =
      await Linking.canOpenURL(url);

    if (!supported) {
      Alert.alert(
        'Ligação indisponível',
        'Este aparelho não permite realizar a ligação.'
      );

      return;
    }

    await Linking.openURL(url);
  }

  return (
    <MenuModuleLayout
      navigation={navigation}
      title="Central Operacional"
      subtitle="Suporte para entregas em andamento"
    >
      <View style={styles.statusCard}>
        <View style={styles.statusDot} />

        <View style={styles.statusContent}>
          <Text style={styles.statusTitle}>
            Central disponível
          </Text>

          <Text style={styles.statusText}>
            Atendimento para problemas
            com coleta, entrega, cliente
            ou estabelecimento.
          </Text>
        </View>
      </View>

      <ActionButton
        icon="💬"
        title="Falar pelo WhatsApp"
        subtitle="Atendimento mais rápido"
        onPress={openWhatsApp}
      />

      <ActionButton
        icon="☎️"
        title="Ligar para a central"
        subtitle="Use em casos urgentes"
        onPress={callSupport}
      />

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>
          Antes de entrar em contato
        </Text>

        <Text style={styles.tipText}>
          Tenha em mãos o número da
          corrida e descreva exatamente
          o problema encontrado.
        </Text>
      </View>
    </MenuModuleLayout>
  );
}

function ActionButton({
  icon,
  title,
  subtitle,
  onPress,
}) {
  return (
    <Pressable
      style={styles.action}
      onPress={onPress}
    >
      <View style={styles.actionIcon}>
        <Text style={styles.icon}>
          {icon}
        </Text>
      </View>

      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>
          {title}
        </Text>

        <Text style={styles.actionSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Text style={styles.arrow}>
        ›
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
    marginBottom: 18,
  },

  statusDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor:
      colors.success,
    marginRight: 13,
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },

  statusText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  action: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 17,
    backgroundColor:
      colors.surface,
    marginBottom: 12,
  },

  actionIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      colors.background,
  },

  icon: {
    fontSize: 22,
  },

  actionContent: {
    flex: 1,
    marginLeft: 13,
  },

  actionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },

  actionSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },

  arrow: {
    color: colors.textSecondary,
    fontSize: 28,
  },

  tipCard: {
    padding: 18,
    borderRadius: 18,
    backgroundColor:
      colors.surface,
    marginTop: 10,
  },

  tipTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },

  tipText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
});
