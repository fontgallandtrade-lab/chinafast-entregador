export const ACTIVE_DELIVERY_STATUSES = [
  'accepted',
  'driver_going_to_pickup',
  'arrived_at_pickup',
  'picked_up',
  'in_transit',
  'arrived_at_destination',
];

export function deliveryStatusLabel(status) {
  const labels = {
    searching_driver: 'Buscando entregador',
    accepted: 'Corrida aceita',
    driver_going_to_pickup: 'A caminho da coleta',
    arrived_at_pickup: 'Chegou à coleta',
    picked_up: 'Pacote coletado',
    in_transit: 'Em trânsito',
    arrived_at_destination: 'Chegou ao destino',
    delivered: 'Entrega concluída',
    cancelled: 'Cancelada',
  };

  return labels[status] || status || 'Sem status';
}

export function nextDeliveryAction(status) {
  const actions = {
    accepted: {
      label: 'IR PARA A COLETA',
      nextStatus: 'driver_going_to_pickup',
    },
    driver_going_to_pickup: {
      label: 'CHEGUEI À COLETA',
      nextStatus: 'arrived_at_pickup',
    },
    picked_up: {
      label: 'INICIAR ENTREGA',
      nextStatus: 'in_transit',
    },
    in_transit: {
      label: 'CHEGUEI AO DESTINO',
      nextStatus: 'arrived_at_destination',
    },
  };

  return actions[status] || null;
}
