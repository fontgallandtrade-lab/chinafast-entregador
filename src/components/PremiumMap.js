import React, {
  useEffect,
  useMemo,
  useRef,
} from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import MapView, {
  Marker,
  PROVIDER_GOOGLE,
} from 'react-native-maps';

import colors from '../theme/colors';

const DEFAULT_REGION = {
  latitude: -23.3556,
  longitude: -47.8569,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

export default function PremiumMap({
  location,
  delivery,
}) {
  const mapRef = useRef(null);

  const region = useMemo(() => {
    if (
      location?.latitude &&
      location?.longitude
    ) {
      return {
        latitude: Number(
          location.latitude
        ),
        longitude: Number(
          location.longitude
        ),
        latitudeDelta: 0.025,
        longitudeDelta: 0.025,
      };
    }

    return DEFAULT_REGION;
  }, [
    location?.latitude,
    location?.longitude,
  ]);

  useEffect(() => {
    if (
      !mapRef.current ||
      !location?.latitude ||
      !location?.longitude
    ) {
      return;
    }

    mapRef.current.animateToRegion(
      region,
      700
    );
  }, [
    location?.latitude,
    location?.longitude,
    region,
  ]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        loadingEnabled
      >
        {location?.latitude &&
        location?.longitude ? (
          <Marker
            coordinate={{
              latitude: Number(
                location.latitude
              ),
              longitude: Number(
                location.longitude
              ),
            }}
            title="Você"
            description="Entregador ChinaFast"
          >
            <View style={styles.driverMarker}>
              <Text style={styles.driverIcon}>
                🚚
              </Text>
            </View>
          </Marker>
        ) : null}

        {delivery?.pickup_latitude &&
        delivery?.pickup_longitude ? (
          <Marker
            coordinate={{
              latitude: Number(
                delivery.pickup_latitude
              ),
              longitude: Number(
                delivery.pickup_longitude
              ),
            }}
            title="Coleta"
            description={
              delivery.pickup_city ||
              'Local de coleta'
            }
          >
            <View style={styles.pickupMarker}>
              <Text style={styles.markerText}>
                C
              </Text>
            </View>
          </Marker>
        ) : null}

        {delivery?.destination_latitude &&
        delivery?.destination_longitude ? (
          <Marker
            coordinate={{
              latitude: Number(
                delivery.destination_latitude
              ),
              longitude: Number(
                delivery.destination_longitude
              ),
            }}
            title="Destino"
            description={
              delivery.destination_city ||
              'Local de entrega'
            }
          >
            <View
              style={
                styles.destinationMarker
              }
            >
              <Text style={styles.markerText}>
                D
              </Text>
            </View>
          </Marker>
        ) : null}
      </MapView>

      {!location ? (
        <View style={styles.locationWarning}>
          <Text style={styles.warningTitle}>
            Localização indisponível
          </Text>

          <Text style={styles.warningText}>
            Ative o GPS para visualizar sua
            posição no mapa.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },

  driverMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: '#ffffff',
  },

  driverIcon: {
    fontSize: 23,
  },

  pickupMarker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: '#ffffff',
  },

  destinationMarker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: '#ffffff',
  },

  markerText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },

  locationWarning: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.mapOverlay,
  },

  warningTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },

  warningText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
});
