import { API_URL } from '../constants/config';

async function request(
  endpoint,
  {
    token,
    method = 'GET',
    body,
  } = {}
) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
    ...(body
      ? {
          body: JSON.stringify(body),
        }
      : {}),
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      success: false,
      message: 'Resposta inválida do servidor.',
    };
  }

  if (!response.ok) {
    throw new Error(
      data.message || 'Erro na comunicação com o servidor.'
    );
  }

  return data;
}

export const api = {
  login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: {
        email,
        password,
      },
    });
  },

  driverProfile(token) {
    return request('/driver/me', {
      token,
    });
  },

  availableDeliveries(token) {
    return request('/driver/deliveries/available', {
      token,
    });
  },

  myDeliveries(token) {
    return request('/driver/deliveries/my', {
      token,
    });
  },

  acceptDelivery(token, deliveryId) {
    return request(
      `/driver/deliveries/${deliveryId}/accept`,
      {
        token,
        method: 'POST',
      }
    );
  },

  updateDeliveryStatus(
    token,
    deliveryId,
    status,
    location
  ) {
    return request(
      `/driver/deliveries/${deliveryId}/status`,
      {
        token,
        method: 'PATCH',
        body: {
          status,
          latitude: location?.latitude,
          longitude: location?.longitude,
        },
      }
    );
  },

  confirmPickup(
    token,
    deliveryId,
    pickupCode,
    location
  ) {
    return request(
      `/driver/deliveries/${deliveryId}/confirm-pickup`,
      {
        token,
        method: 'POST',
        body: {
          pickup_code: pickupCode,
          latitude: location?.latitude,
          longitude: location?.longitude,
        },
      }
    );
  },

  confirmDelivery(
    token,
    deliveryId,
    deliveryCode,
    location
  ) {
    return request(
      `/driver/deliveries/${deliveryId}/confirm-delivery`,
      {
        token,
        method: 'POST',
        body: {
          delivery_code: deliveryCode,
          latitude: location?.latitude,
          longitude: location?.longitude,
        },
      }
    );
  },

  wallet(token) {
    return request('/wallet', {
      token,
    });
  },

  walletStatement(token) {
    return request('/wallet/statement', {
      token,
    });
  },

  requestWithdrawal(token, amount, pixKey) {
    return request('/wallet/withdrawals', {
      token,
      method: 'POST',
      body: {
        amount: Number(amount),
        pix_key: pixKey,
      },
    });
  },

  withdrawals(token) {
    return request('/wallet/withdrawals', {
      token,
    });
  },
};
