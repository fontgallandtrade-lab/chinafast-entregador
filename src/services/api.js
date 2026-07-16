import {
  API_URL,
} from '../constants/config';

async function request(
  endpoint,
  {
    token,
    method = 'GET',
    body,
  } = {}
) {
  const options = {
    method,

    headers: {
      Accept:
        'application/json',

      'Content-Type':
        'application/json',

      ...(token
        ? {
            Authorization:
              `Bearer ${token}`,
          }
        : {}),
    },
  };

  if (
    body !== undefined &&
    body !== null
  ) {
    options.body =
      JSON.stringify(body);
  }

  let response;

  try {
    response = await fetch(
      `${API_URL}${endpoint}`,
      options
    );
  } catch (error) {
    throw new Error(
      'Não foi possível conectar ao servidor.'
    );
  }

  let data;

  try {
    data = await response.json();
  } catch (error) {
    data = {
      success: false,
      message:
        'Resposta inválida do servidor.',
    };
  }

  if (!response.ok) {
    const requestError =
      new Error(
        data.message ||
          'Erro na comunicação com o servidor.'
      );

    requestError.status =
      response.status;

    requestError.data = data;

    throw requestError;
  }

  return data;
}

export const api = {
  login(
    email,
    password
  ) {
    return request(
      '/auth/login',
      {
        method: 'POST',

        body: {
          email,
          password,
        },
      }
    );
  },

  driverProfile(token) {
    return request(
      '/driver/me',
      {
        token,
      }
    );
  },

  availableDeliveries(
    token
  ) {
    return request(
      '/driver/deliveries/available',
      {
        token,
      }
    );
  },

  myDeliveries(token) {
    return request(
      '/driver/deliveries/my',
      {
        token,
      }
    );
  },

  acceptDelivery(
    token,
    deliveryId
  ) {
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

          latitude:
            location?.latitude ??
            null,

          longitude:
            location?.longitude ??
            null,
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
          pickup_code:
            String(
              pickupCode || ''
            ).trim(),

          latitude:
            location?.latitude ??
            null,

          longitude:
            location?.longitude ??
            null,
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
          delivery_code:
            String(
              deliveryCode || ''
            ).trim(),

          latitude:
            location?.latitude ??
            null,

          longitude:
            location?.longitude ??
            null,
        },
      }
    );
  },

  wallet(token) {
    return request(
      '/driver/wallet',
      {
        token,
      }
    );
  },

  walletStatement(
    token
  ) {
    return request(
      '/driver/wallet/statement',
      {
        token,
      }
    );
  },

  requestWithdrawal(
    token,
    amount,
    pixKey
  ) {
    return request(
      '/driver/wallet/withdrawals',
      {
        token,

        method: 'POST',

        body: {
          amount:
            Number(amount),

          pix_key:
            String(
              pixKey || ''
            ).trim(),
        },
      }
    );
  },

  withdrawals(token) {
    return request(
      '/driver/wallet/withdrawals',
      {
        token,
      }
    );
  },
};
