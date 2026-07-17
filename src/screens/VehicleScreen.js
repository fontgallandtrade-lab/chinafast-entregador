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
  '@chinafast:driver_vehicle';

const VEHICLE_TYPES = [
  'Moto',
  'Carro',
  'Utilitário',
  'Van',
  'Caminhão',
];

export default function VehicleScreen({
  navigation,
}) {
  const [vehicle, setVehicle] =
    useState({
      type: 'Moto',
      brand: '',
      model: '',
      plate: '',
      color: '',
      year: '',
    });

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    loadVehicle();
  }, []);

  async function loadVehicle() {
    try {
      const saved =
        await AsyncStorage.getItem(
          STORAGE_KEY
        );

      if (saved) {
        setVehicle(
          JSON.parse(saved)
        );
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível carregar o veículo.'
      );
    }
  }

  function updateField(
    field,
    value
  ) {
    setVehicle((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveVehicle() {
    if (
      !vehicle.type ||
      !vehicle.brand.trim() ||
      !vehicle.model.trim() ||
      !vehicle.plate.trim()
    ) {
      Alert.alert(
        'Dados incompletos',
        'Preencha tipo, marca, modelo e placa.'
      );

      return;
    }

    setSaving(true);

    try {
      const normalized = {
        ...vehicle,

        plate: vehicle.plate
          .toUpperCase()
          .replace(/\s/g, ''),

        year: vehicle.year
          .replace(/\D/g, '')
          .slice(0, 4),
      };

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(normalized)
      );

      setVehicle(normalized);

      Alert.alert(
        'Veículo salvo',
        'Os dados do veículo foram atualizados.'
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível salvar o veículo.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <MenuModuleLayout
      navigation={navigation}
      title="Veículo"
      subtitle="Dados do veículo utilizado nas entregas"
    >
      <Text style={styles.sectionTitle}>
        Tipo de veículo
      </Text>

      <View style={styles.typeGrid}>
        {VEHICLE_TYPES.map(
          (type) => (
            <Pressable
              key={type}
              style={[
                styles.typeButton,

                vehicle.type === type &&
                  styles.typeButtonActive,
              ]}
              onPress={() =>
                updateField(
                  'type',
                  type
                )
              }
            >
              <Text
                style={[
                  styles.typeText,

                  vehicle.type === type &&
                    styles.typeTextActive,
                ]}
              >
                {type}
              </Text>
            </Pressable>
          )
        )}
      </View>

      <FormField
        label="Marca"
        value={vehicle.brand}
        placeholder="Ex.: Honda"
        onChangeText={(value) =>
          updateField(
            'brand',
            value
          )
        }
      />

      <FormField
        label="Modelo"
        value={vehicle.model}
        placeholder="Ex.: CG 160"
        onChangeText={(value) =>
          updateField(
            'model',
            value
          )
        }
      />

      <FormField
        label="Placa"
        value={vehicle.plate}
        placeholder="ABC1D23"
        autoCapitalize="characters"
        maxLength={7}
        onChangeText={(value) =>
          updateField(
            'plate',
            value
          )
        }
      />

      <FormField
        label="Cor"
        value={vehicle.color}
        placeholder="Ex.: Vermelha"
        onChangeText={(value) =>
          updateField(
            'color',
            value
          )
        }
      />

      <FormField
        label="Ano"
        value={vehicle.year}
        placeholder="2024"
        keyboardType="number-pad"
        maxLength={4}
        onChangeText={(value) =>
          updateField(
            'year',
            value
          )
        }
      />

      <Pressable
        style={[
          styles.saveButton,
          saving &&
            styles.disabledButton,
        ]}
        disabled={saving}
        onPress={saveVehicle}
      >
        <Text style={styles.saveText}>
          {saving
            ? 'SALVANDO...'
            : 'SALVAR VEÍCULO'}
        </Text>
      </Pressable>
    </MenuModuleLayout>
  );
}

function FormField({
  label,
  ...inputProps
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
      </Text>

      <TextInput
        {...inputProps}
        style={styles.input}
        placeholderTextColor={
          colors.textSecondary
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 12,
  },

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
    marginBottom: 14,
  },

  typeButton: {
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 18,
    margin: 5,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  typeButtonActive: {
    backgroundColor:
      colors.primary,
    borderColor:
      colors.primary,
  },

  typeText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },

  typeTextActive: {
    color: '#ffffff',
  },

  field: {
    marginTop: 15,
  },

  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
  },

  input: {
    height: 52,
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
