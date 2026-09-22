/**
 * Socket.IO client for caregiver live tracking (user/app is subscribe-only).
 */

import {io} from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getSocketBaseUrl} from '../api/endpoints';

/**
 * Connect to the tracking namespace host with bearer auth.
 * Caller must subscribe / unsubscribe and disconnect on unmount.
 */
export const connectTrackingSocket = async () => {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const socket = io(getSocketBaseUrl(), {
    path: '/socket.io',
    auth: {token},
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 1500,
  });

  return socket;
};

export const subscribeTracking = (socket, bookingId) => {
  if (!socket || !bookingId) {
    return;
  }
  socket.emit('tracking:subscribe', {booking_id: bookingId});
};

export const unsubscribeTracking = (socket, bookingId) => {
  if (!socket || !bookingId) {
    return;
  }
  try {
    socket.emit('tracking:unsubscribe', {booking_id: bookingId});
  } catch (error) {
    // ignore emit errors during teardown
  }
};

export const disconnectTrackingSocket = (socket, bookingId) => {
  if (!socket) {
    return;
  }
  unsubscribeTracking(socket, bookingId);
  socket.removeAllListeners();
  socket.disconnect();
};

export default {
  connectTrackingSocket,
  subscribeTracking,
  unsubscribeTracking,
  disconnectTrackingSocket,
};
