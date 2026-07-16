import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ACTIVE_DELIVERY_STATUSES,
} from '../utils/deliveryStatus';

import {
  DELIVERY_REFRESH_INTERVAL,
} from '../constants/config';

import { api } from '../services/api';

import {
  getSocket,
  joinDeliveryRoom,
} from '../services/socket';

import { useAuth } from './AuthContext';

const DeliveryContext = createContext(null);

export function DeliveryProvider({ children }) {
  const {
    token,
    driver,
  } = useAuth();

  const [availableDeliveries, setAvailableDeliveries] =
    useState([]);

  const [activeDelivery, setActiveDelivery] =
    useState(null);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setAvailableDeliveries([]);
      setActiveDelivery(null);
      setHistory([]);
      return;
    }

    refreshAll();

    const interval = setInterval(
      refreshAll,
      DELIVERY_REFRESH_INTERVAL
    );

    return () => clearInterval(interval);
  }, [token, driver?.online]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      return;
    }

    const refresh = () => {
      refreshAll();
    };

    socket.on('new-delivery', refresh);
    socket.on('delivery-offer-created', refresh);
    socket.on('delivery-status-updated', refresh);

    return () => {
      socket.off('new-delivery', refresh);
      socket.off('delivery-offer-created', refresh);
      socket.off('delivery-status-updated', refresh);
    };
  }, [token]);

  async function refreshAll() {
    if (!token) {
      return;
    }

    setLoading(true);

    try {
      const myData =
        await api.myDeliveries(token);

      const deliveries =
        myData.deliveries || [];

      const active =
        deliveries.find((item) =>
          ACTIVE_DELIVERY_STATUSES.includes(
            item.status
          )
        ) || null;

      setActiveDelivery(active);

      setHistory(
        deliveries.filter(
          (item) =>
            !ACTIVE_DELIVERY_STATUSES.includes(
              item.status
            )
        )
      );

      if (active) {
        setAvailableDeliveries([]);
        joinDeliveryRoom(active.id);
        return;
      }

      if (!driver?.online) {
        setAvailableDeliveries([]);
        return;
      }

      const availableData =
        await api.availableDeliveries(token);

      setAvailableDeliveries(
        availableData.deliveries || []
      );
    } catch (error) {
      console.log(
        'Erro ao atualizar entregas:',
        error.message
      );
    } finally {
      setLoading(false);
    }
  }

  async function acceptDelivery(deliveryId) {
    const result =
      await api.acceptDelivery(
        token,
        deliveryId
      );

    joinDeliveryRoom(deliveryId);
    await refreshAll();

    return result;
  }

  async function updateStatus(status, location) {
    if (!activeDelivery?.id) {
      throw new Error(
        'Nenhuma entrega ativa.'
      );
    }

    const result =
      await api.updateDeliveryStatus(
        token,
        activeDelivery.id,
        status,
        location
      );

    await refreshAll();

    return result;
  }

  async function confirmPickup(code, location) {
    if (!activeDelivery?.id) {
      throw new Error(
        'Nenhuma entrega ativa.'
      );
    }

    const result =
      await api.confirmPickup(
        token,
        activeDelivery.id,
        code,
        location
      );

    await refreshAll();

    return result;
  }

  async function confirmDelivery(
    code,
    location
  ) {
    if (!activeDelivery?.id) {
      throw new Error(
        'Nenhuma entrega ativa.'
      );
    }

    const result =
      await api.confirmDelivery(
        token,
        activeDelivery.id,
        code,
        location
      );

    await refreshAll();

    return result;
  }

  const value = useMemo(
    () => ({
      availableDeliveries,
      activeDelivery,
      history,
      loading,
      refreshAll,
      acceptDelivery,
      updateStatus,
      confirmPickup,
      confirmDelivery,
    }),
    [
      availableDeliveries,
      activeDelivery,
      history,
      loading,
    ]
  );

  return (
    <DeliveryContext.Provider value={value}>
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDeliveries() {
  const context =
    useContext(DeliveryContext);

  if (!context) {
    throw new Error(
      'useDeliveries precisa estar dentro de DeliveryProvider.'
    );
  }

  return context;
}
