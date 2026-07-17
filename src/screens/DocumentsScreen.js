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
  '@chinafast:driver_documents';

const DOCUMENT_LIST = [
  {
    key: 'cnh',
    title: 'CNH',
    placeholder:
      'Número da CNH',
  },
  {
    key: 'cpf',
    title: 'CPF',
    placeholder:
      'Número do CPF',
  },
  {
    key: 'crlv',
    title: 'CRLV',
    placeholder:
      'Documento do veículo',
  },
];

export default function DocumentsScreen({
  navigation,
}) {
  const [documents, setDocuments] =
    useState({
      cnh: '',
      cpf: '',
      crlv: '',
    });

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const saved =
        await AsyncStorage.getItem(
          STORAGE_KEY
        );

      if (saved) {
        setDocuments(
          JSON.parse(saved)
        );
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível carregar os documentos.'
      );
    }
  }

  function updateDocument(
    key,
    value
  ) {
    setDocuments((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveDocuments() {
    if (
      !documents.cnh.trim() ||
      !documents.cpf.trim()
    ) {
      Alert.alert(
        'Dados incompletos',
        'Informe pelo menos a CNH e o CPF.'
      );

      return;
    }

    setSaving(true);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(documents)
      );

      Alert.alert(
        'Documentos salvos',
        'Os dados foram registrados no aplicativo.'
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível salvar os documentos.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <MenuModuleLayout
      navigation={navigation}
      title="Documentos"
      subtitle="Cadastro documental do entregador"
    >
      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>
          Verificação documental
        </Text>

        <Text style={styles.warningText}>
          Os números cadastrados serão
          enviados ao servidor quando o
          módulo de análise documental
          estiver conectado à API.
        </Text>
      </View>

      {DOCUMENT_LIST.map(
        (document) => (
          <View
            key={document.key}
            style={styles.documentCard}
          >
            <View style={styles.iconBox}>
              <Text style={styles.icon}>
                📄
              </Text>
            </View>

            <View style={styles.documentContent}>
              <Text style={styles.documentTitle}>
                {document.title}
              </Text>

              <TextInput
                style={styles.input}
                value={
                  documents[
                    document.key
                  ]
                }
                onChangeText={(value) =>
                  updateDocument(
                    document.key,
                    value
                  )
                }
                placeholder={
                  document.placeholder
                }
                placeholderTextColor={
                  colors.textSecondary
                }
              />
            </View>
          </View>
        )
      )}

      <Pressable
        style={[
          styles.saveButton,
          saving &&
            styles.disabledButton,
        ]}
        disabled={saving}
        onPress={saveDocuments}
      >
        <Text style={styles.saveText}>
          {saving
            ? 'SALVANDO...'
            : 'SALVAR DOCUMENTOS'}
        </Text>
      </Pressable>
    </MenuModuleLayout>
  );
}

const styles = StyleSheet.create({
  warningCard: {
    padding: 17,
    borderRadius: 17,
    backgroundColor:
      'rgba(255,107,0,0.12)',
    borderWidth: 1,
    borderColor:
      'rgba(255,107,0,0.35)',
    marginBottom: 18,
  },

  warningTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },

  warningText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },

  documentCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 17,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
    marginBottom: 13,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      colors.background,
  },

  icon: {
    fontSize: 21,
  },

  documentContent: {
    flex: 1,
    marginLeft: 13,
  },

  documentTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
  },

  input: {
    height: 48,
    borderRadius: 13,
    paddingHorizontal: 13,
    color: colors.text,
    backgroundColor:
      colors.background,
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
    marginTop: 14,
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
