import React, {
  useMemo,
} from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { WebView } from 'react-native-webview';

import colors from '../theme/colors';

const DEFAULT_LOCATION = {
  latitude: -23.3556,
  longitude: -47.8569,
};

function toValidCoordinate(value, fallback) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default function PremiumMap({
  location,
  delivery,
}) {
  const hasLocation =
    Number.isFinite(
      Number(location?.latitude)
    ) &&
    Number.isFinite(
      Number(location?.longitude)
    );

  const currentLatitude =
    toValidCoordinate(
      location?.latitude,
      DEFAULT_LOCATION.latitude
    );

  const currentLongitude =
    toValidCoordinate(
      location?.longitude,
      DEFAULT_LOCATION.longitude
    );

  const pickupLatitude =
    toValidCoordinate(
      delivery?.pickup_latitude,
      null
    );

  const pickupLongitude =
    toValidCoordinate(
      delivery?.pickup_longitude,
      null
    );

  const destinationLatitude =
    toValidCoordinate(
      delivery?.destination_latitude,
      null
    );

  const destinationLongitude =
    toValidCoordinate(
      delivery?.destination_longitude,
      null
    );

  const html = useMemo(() => {
    const pickupCity = escapeHtml(
      delivery?.pickup_city ||
        'Local de coleta'
    );

    const destinationCity = escapeHtml(
      delivery?.destination_city ||
        'Local de entrega'
    );

    const pickupMarker =
      pickupLatitude !== null &&
      pickupLongitude !== null
        ? `
          L.marker(
            [${pickupLatitude}, ${pickupLongitude}],
            { icon: pickupIcon }
          )
          .addTo(map)
          .bindPopup(
            '<strong>Coleta</strong><br>${pickupCity}'
          );

          bounds.push(
            [${pickupLatitude}, ${pickupLongitude}]
          );
        `
        : '';

    const destinationMarker =
      destinationLatitude !== null &&
      destinationLongitude !== null
        ? `
          L.marker(
            [
              ${destinationLatitude},
              ${destinationLongitude}
            ],
            { icon: destinationIcon }
          )
          .addTo(map)
          .bindPopup(
            '<strong>Destino</strong><br>${destinationCity}'
          );

          bounds.push(
            [
              ${destinationLatitude},
              ${destinationLongitude}
            ]
          );
        `
        : '';

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta
            name="viewport"
            content="width=device-width,
            initial-scale=1.0,
            maximum-scale=1.0,
            user-scalable=no"
          />

          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          />

          <style>
            html,
            body,
            #map {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              background: #e9edf2;
            }

            .custom-marker {
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid #ffffff;
              border-radius: 50%;
              box-shadow:
                0 3px 12px
                rgba(0, 0, 0, 0.28);
              font-family:
                Arial,
                sans-serif;
              font-weight: 900;
            }

            .driver-marker {
              width: 44px;
              height: 44px;
              background: #ff6b00;
              font-size: 22px;
            }

            .pickup-marker {
              width: 34px;
              height: 34px;
              background: #22a06b;
              color: #ffffff;
              font-size: 15px;
            }

            .destination-marker {
              width: 34px;
              height: 34px;
              background: #ff6b00;
              color: #ffffff;
              font-size: 15px;
            }

            .leaflet-control-attribution {
              font-size: 9px;
            }
          </style>
        </head>

        <body>
          <div id="map"></div>

          <script
            src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          ></script>

          <script>
            const map = L.map(
              'map',
              {
                zoomControl: true,
                attributionControl: true
              }
            ).setView(
              [
                ${currentLatitude},
                ${currentLongitude}
              ],
              15
            );

            L.tileLayer(
              'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              {
                maxZoom: 19,
                attribution:
                  '&copy; OpenStreetMap contributors'
              }
            ).addTo(map);

            const driverIcon = L.divIcon({
              className: '',
              html:
                '<div class="custom-marker driver-marker">🚚</div>',
              iconSize: [50, 50],
              iconAnchor: [25, 25],
              popupAnchor: [0, -24]
            });

            const pickupIcon = L.divIcon({
              className: '',
              html:
                '<div class="custom-marker pickup-marker">C</div>',
              iconSize: [40, 40],
              iconAnchor: [20, 20],
              popupAnchor: [0, -18]
            });

            const destinationIcon = L.divIcon({
              className: '',
              html:
                '<div class="custom-marker destination-marker">D</div>',
              iconSize: [40, 40],
              iconAnchor: [20, 20],
              popupAnchor: [0, -18]
            });

            const bounds = [];

            L.marker(
              [
                ${currentLatitude},
                ${currentLongitude}
              ],
              { icon: driverIcon }
            )
            .addTo(map)
            .bindPopup(
              '<strong>Você</strong><br>Entregador ChinaFast'
            );

            bounds.push(
              [
                ${currentLatitude},
                ${currentLongitude}
              ]
            );

            ${pickupMarker}

            ${destinationMarker}

            if (bounds.length > 1) {
              map.fitBounds(
                bounds,
                {
                  padding: [55, 55],
                  maxZoom: 16
                }
              );
            }

            setTimeout(
              function () {
                map.invalidateSize();
              },
              300
            );
          </script>
        </body>
      </html>
    `;
  }, [
    currentLatitude,
    currentLongitude,
    pickupLatitude,
    pickupLongitude,
    destinationLatitude,
    destinationLongitude,
    delivery?.pickup_city,
    delivery?.destination_city,
  ]);

  return (
    <View style={styles.container}>
      <WebView
        style={styles.map}
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        allowFileAccess
        allowUniversalAccessFromFileURLs
        setSupportMultipleWindows={false}
      />

      {!hasLocation ? (
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
    backgroundColor:
      colors.background,
  },

  map: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  locationWarning: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    padding: 14,
    borderRadius: 16,
    backgroundColor:
      colors.mapOverlay,
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
