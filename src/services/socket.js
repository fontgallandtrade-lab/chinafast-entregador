import { io } from 'socket.io-client';
import { SOCKET_URL } from '../constants/config';

let socket = null;

export function connectSocket(driverId) {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    transports: ['polling', 'websocket'],
    upgrade: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1500,
    timeout: 20000,
  });

  socket.on('connect', () => {
    if (driverId) {
      socket.emit('join-driver-room', Number(driverId));
    }
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinDeliveryRoom(deliveryId) {
  if (socket && deliveryId) {
    socket.emit('join-delivery-room', Number(deliveryId));
  }
}
