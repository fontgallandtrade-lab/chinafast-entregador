import {
  useEffect,
  useRef,
  useState,
} from 'react';

import * as Location from 'expo-location';

import { getSocket } from '../services/socket';

export default function useLocationTracking(
  driverId,
  online,
  deliveryId
) {
  const subscriptionRef = useRef(null);

  const [location, setLocation] =
    useState(null);

  const [permissionGranted, setPermissionGranted] =
    useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    if (!driverId || !online) {
      stopTracking();
      return;
    }

    startTracking();

    return stopTracking;
  }, [driverId, online, deliveryId]);

  async function startTracking() {
    try {
      setError('');

      const permission =
        await Location.requestForegroundPermissionsAsync();

      const granted =
        permission.status === 'granted';

      setPermissionGranted(granted);

      if (!granted) {
        setError(
          'Permissão de localização não concedida.'
        );

        return;
      }

      stopTracking();

      const current =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      handleLocation(current);

      subscriptionRef.current =
        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 8000,
            distanceInterval: 10,
          },
          handleLocation
        );
    } catch (trackingError) {
      setError(
        trackingError.message ||
          'Erro ao acessar a localização.'
      );
    }
  }

  function handleLocation(result) {
    const nextLocation = {
      latitude: result.coords.latitude,
      longitude: result.coords.longitude,
      accuracy: result.coords.accuracy,
      heading: result.coords.heading,
      speed: result.coords.speed,
      timestamp: result.timestamp,
    };

    setLocation(nextLocation);

    const socket = getSocket();

    socket?.emit('driver-location', {
      driverId: Number(driverId),
      deliveryId: deliveryId
        ? Number(deliveryId)
        : null,
      ...nextLocation,
    });
  }

  function stopTracking() {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
  }

  return {
    location,
    permissionGranted,
    error,
    refreshLocation: startTracking,
  };
}
