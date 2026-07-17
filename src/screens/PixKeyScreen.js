import React, {
  useEffect,
  useState,
} from 'react';

import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import MenuModuleLayout from '../components/MenuModuleLayout';
import colors from '../theme/colors';

const STORAGE_KEY =
  '@chinafast:pix_data';

const PIX_TYPES = [
  'CPF',
  'CNPJ',
  'E-mail',
  'Telefone',
  'Aleatória',
];

export default function PixKeyScreen({
  navigation,
}) {
  const [pixType, setPixType] =
    useState('CPF');

  const [pixKey, setPixKey] =
    useState('');

  const [holderName, setHolderName] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    loadPix();
  }, []);

  async function loadPix() {
    try {
      const saved =
        await AsyncStorage.getItem(
          STORAGE_KEY
        );

      if (saved) {
        const data =
          JSON.parse(saved);

        setPixType(
          data.pixType || 'CPF'
        );

        setPixKey(
          data.pixKey || ''
        );

        setHolderName(
          data.holderName || ''
        );
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível carregar a chave Pix.'
      );
    }
  }

  async function savePix() {
    if (
      !pixKey.trim() ||
      !holderName.trim()
    ) {
      Alert.alert(
        'Dados incompletos',
        'Informe a chave Pix e o nome do titular.'
      );

      return;
    }

    setSaving(true);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          pixType,
          pixKey:
            pixKey.trim(),
          holderName:
            holderName.trim(),
        })
      );

      Alert.alert(
        'Chave Pix salva',
        'A chave será utilizada nas solicitações de saque.'
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível salvar a chave Pix.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <MenuModuleLayout
      navigation={navigation}
      title="Chave Pix"
      subtitle="Conta para recebimento dos seus saques"
    >
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          Atenção
        </Text>

        <Text style={styles.infoText}>
          A chave deve pertencer ao
          titular cadastrado no ChinaFast.
        </Text>
      </View>

      <Text style={styles.label}>
        Tipo de chave
      </Text>

      <View style={styles.typeGrid}>
        {PIX_TYPES.map(
          (type) => (
            <Pressable
              key={type}
              style={[
                styles.typeButton,
                pixType === type &&
                  styles.typeActive,
              ]}
              onPress={() =>
                setPixType(type)
              }
            >
              <Text
                style={[
                  styles.typeText,
                  pixType === type &&
                    styles.typeTextActive,
                ]}
              >
                {type}
              </Text>
            </Pressable>
          )
        )}
      </View>

      <Text style={styles.label}>
        Chave Pix
      </Text>

      <TextInput
        style={styles.input}
        value={pixKey}
        onChangeText={setPixKey}
        placeholder="Digite sua chave"
        placeholderTextColor={
          colors.textSecondary
        }
        autoCapitalize="none"
      />

      <Text style={styles.label}>
        Nome completo do titular
      </Text>

      <TextInput
        style={styles.input}
        value={holderName}
        onChangeText={setHolderName}
        placeholder="Nome do titular"
        placeholderTextColor={
          colors.textSecondary
        }
      />

      <Pressable
        style={[
          styles.saveButton,
          saving &&
            styles.disabledButton,
        ]}
        disabled={saving}
        onPress={savePix}
      >
        <Text style={styles.saveText}>
          {saving
            ? 'SALVANDO...'
            : 'SALVAR CHAVE PIX'}
        </Text>
      </Pressable>
    </MenuModuleLayout>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    padding: 17,
    borderRadius: 17,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
    marginBottom: 22,
  },

  infoTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },

  infoText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },

  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 8,
  },

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },

  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    margin: 5,
    borderRadius: 18,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  typeActive: {
    backgroundColor:
      colors.primary,
    borderColor:
      colors.primary,
  },

  typeText: {
    color: colors.textSecondary,
    fontWeight: '800',
  },

  typeTextActive: {
    color: '#ffffff',
  },

  input: {
    height: 54,
    borderRadius: 15,
    paddingHorizontal: 15,
    color: colors.text,
    fontSize: 15,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  saveButton: {
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      colors.primary,
    marginTop: 28,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});
