/**
 * Shared Socket.IO connection used by live tracking and booking chat.
 * One connection per app; callers acquire / release it (ref-counted) and
 * must remove only their own listeners.
 */

import {io} from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getSocketBaseUrl} from '../api/endpoints';

let sharedSocket = null;
let pendingSocket = null;
let refCount = 0;
const createdListeners = new Set();

/** Run `listener(socket)` every time a new shared socket is created. */
export const onAppSocketCreated = listener => {
  createdListeners.add(listener);
  if (sharedSocket) {
    listener(sharedSocket);
  }
  return () => {
    createdListeners.delete(listener);
  };
};

export const getAppSocket = () => sharedSocket;

const createSocket = async () => {
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
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1500,
    reconnectionDelayMax: 10000,
  });
  createdListeners.forEach(listener => {
    try {
      listener(socket);
    } catch (error) {
      console.error('Socket created listener failed:', error);
    }
  });
  return socket;
};

export const acquireAppSocket = async () => {
  refCount += 1;
  if (sharedSocket) {
    if (!sharedSocket.connected) {
      sharedSocket.connect();
    }
    return sharedSocket;
  }
  if (!pendingSocket) {
    pendingSocket = createSocket().finally(() => {
      pendingSocket = null;
    });
  }
  try {
    const socket = await pendingSocket;
    sharedSocket = sharedSocket || socket;
    if (refCount === 0) {
      sharedSocket.removeAllListeners();
      sharedSocket.disconnect();
      sharedSocket = null;
    }
    return socket;
  } catch (error) {
    refCount = Math.max(0, refCount - 1);
    throw error;
  }
};

export const releaseAppSocket = () => {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0 && sharedSocket) {
    sharedSocket.removeAllListeners();
    sharedSocket.disconnect();
    sharedSocket = null;
  }
};

/** Acquire the shared socket for tracking. Pair with disconnectTrackingSocket. */
export const connectTrackingSocket = () => acquireAppSocket();

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

/**
 * Unsubscribe, remove the given listeners and release the shared socket.
 * `handlers` is a map of event name -> listener that the caller registered.
 */
export const disconnectTrackingSocket = (socket, bookingId, handlers = {}) => {
  if (!socket) {
    return;
  }
  unsubscribeTracking(socket, bookingId);
  Object.entries(handlers).forEach(([event, listener]) => {
    socket.off(event, listener);
  });
  releaseAppSocket();
};

export default {
  acquireAppSocket,
  releaseAppSocket,
  getAppSocket,
  onAppSocketCreated,
  connectTrackingSocket,
  subscribeTracking,
  unsubscribeTracking,
  disconnectTrackingSocket,
};
