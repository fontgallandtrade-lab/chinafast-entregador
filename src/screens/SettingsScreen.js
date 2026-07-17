import React, {
  useEffect,
  useState,
} from 'react';

import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import MenuModuleLayout from '../components/MenuModuleLayout';
import colors from '../theme/colors';

const STORAGE_KEY =
  '@chinafast:settings';

const DEFAULT_SETTINGS = {
  newDeliverySound: true,
  vibration: true,
  locationUpdates: true,
  promotionalNotifications: false,
};

export default function SettingsScreen({
  navigation,
}) {
  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const saved =
        await AsyncStorage.getItem(
          STORAGE_KEY
        );

      if (saved) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...JSON.parse(saved),
        });
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível carregar as configurações.'
      );
    }
  }

  async function toggleSetting(key) {
    const next = {
      ...settings,
      [key]:
        !settings[key],
    };

    setSettings(next);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(next)
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível salvar a configuração.'
      );
    }
  }

  return (
    <MenuModuleLayout
      navigation={navigation}
      title="Configurações"
      subtitle="Preferências do aplicativo"
    >
      <SettingRow
        title="Som de nova corrida"
        subtitle="Tocar alerta quando uma entrega estiver disponível"
        value={
          settings.newDeliverySound
        }
        onValueChange={() =>
          toggleSetting(
            'newDeliverySound'
          )
        }
      />

      <SettingRow
        title="Vibração"
        subtitle="Vibrar ao receber eventos importantes"
        value={settings.vibration}
        onValueChange={() =>
          toggleSetting(
            'vibration'
          )
        }
      />

      <SettingRow
        title="Atualização de localização"
        subtitle="Enviar a posição durante o período online"
        value={
          settings.locationUpdates
        }
        onValueChange={() =>
          toggleSetting(
            'locationUpdates'
          )
        }
      />

      <SettingRow
        title="Avisos promocionais"
        subtitle="Receber novidades e campanhas do ChinaFast"
        value={
          settings.promotionalNotifications
        }
        onValueChange={() =>
          toggleSetting(
            'promotionalNotifications'
          )
        }
      />

      <View style={styles.versionCard}>
        <Text style={styles.versionTitle}>
          ChinaFast Premium
        </Text>

        <Text style={styles.versionText}>
          Versão 3.0
        </Text>
      </View>
    </MenuModuleLayout>
  );
}

function SettingRow({
  title,
  subtitle,
  value,
  onValueChange,
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>
          {title}
        </Text>

        <Text style={styles.rowSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: colors.border,
          true: colors.success,
        }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 17,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
    marginBottom: 12,
  },

  rowContent: {
    flex: 1,
    paddingRight: 13,
  },

  rowTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },

  rowSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  versionCard: {
    padding: 18,
    borderRadius: 17,
    backgroundColor:
      colors.surface,
    marginTop: 12,
  },

  versionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },

  versionText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 5,
  },
});
