/**
 * Booking chat (user <-> assigned caregiver) runtime.
 *
 * - Listens to chat:* events on the shared Socket.IO connection and fans them
 *   out to screens through onBookingChatEvent.
 * - Keeps messages in memory only; they are dropped when the service ends.
 * - Patches the cached GET /bookings/:id payload so the chat card badge and
 *   last-message preview stay live.
 */

import {useEffect} from 'react';
import {AppState} from 'react-native';
import {queryKeys} from '../api/queryKeys';
import {
  acquireAppSocket,
  getAppSocket,
  onAppSocketCreated,
  releaseAppSocket,
} from './trackingSocket';

export const CHAT_CLOSED = 'CHAT_CLOSED';
export const SEND_ACK_TIMEOUT_MS = 10000;

let queryClient = null;
let openBookingId = null;
const listeners = new Set();
const messageCache = new Map();

const sameId = (a, b) => a != null && b != null && String(a) === String(b);

export const isOwnChatMessage = message =>
  String(message?.sender_role || '').toUpperCase() === 'USER';

export const setBookingChatQueryClient = client => {
  queryClient = client;
};

export const setOpenBookingChat = bookingId => {
  openBookingId = bookingId || null;
};

export const getOpenBookingChat = () => openBookingId;

export const isBookingChatOpen = bookingId => sameId(openBookingId, bookingId);

export const onBookingChatEvent = listener => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const emit = (event, payload) => {
  listeners.forEach(listener => {
    try {
      listener(event, payload);
    } catch (error) {
      console.error('Booking chat listener failed:', error);
    }
  });
};

export const getCachedChatMessages = bookingId =>
  messageCache.get(String(bookingId)) || [];

export const setCachedChatMessages = (bookingId, messages) => {
  if (bookingId) {
    messageCache.set(String(bookingId), messages);
  }
};

const patchChatInEnvelope = (envelope, updater) => {
  const data = envelope?.data;
  if (!data || typeof data !== 'object') {
    return envelope;
  }
  if (data.chat) {
    return {...envelope, data: {...data, chat: updater(data.chat)}};
  }
  if (data.booking?.chat) {
    return {
      ...envelope,
      data: {
        ...data,
        booking: {...data.booking, chat: updater(data.booking.chat)},
      },
    };
  }
  return envelope;
};

const patchBookingChat = (bookingId, updater) => {
  if (!queryClient || !bookingId) {
    return;
  }
  queryClient.setQueryData(queryKeys.bookings.detail(bookingId), current =>
    current ? patchChatInEnvelope(current, updater) : current,
  );
  queryClient.setQueryData(queryKeys.bookings.chat(bookingId), current =>
    current?.data ? {...current, data: updater(current.data)} : current,
  );
};

const toLastMessage = message => ({
  id: message.id,
  message: message.message,
  message_type: message.message_type,
  sender_role: message.sender_role,
  created_at: message.created_at,
});

export const clearBookingChatUnread = bookingId => {
  patchBookingChat(bookingId, chat => ({...chat, unread_count: 0}));
};

export const incrementBookingChatUnread = (bookingId, message) => {
  patchBookingChat(bookingId, chat => ({
    ...chat,
    unread_count: Number(chat?.unread_count || 0) + 1,
    last_message: message?.id ? toLastMessage(message) : chat?.last_message,
  }));
};

export const setBookingChatLastMessage = (bookingId, message) => {
  if (!message?.id) {
    return;
  }
  patchBookingChat(bookingId, chat => ({
    ...chat,
    last_message: toLastMessage(message),
  }));
};

/**
 * Service ended (completed / cancelled): the backend deleted every message.
 * Drop local state, hide the chat card and refetch the booking.
 */
export const endBookingChat = (bookingId, reason) => {
  if (!bookingId) {
    return;
  }
  messageCache.delete(String(bookingId));
  patchBookingChat(bookingId, chat => ({
    ...chat,
    is_active: false,
    unread_count: 0,
    last_message: null,
  }));
  if (queryClient) {
    queryClient.setQueryData(queryKeys.bookings.detail(bookingId), current => {
      const data = current?.data;
      if (!data || typeof data !== 'object') {
        return current;
      }
      return {...current, data: {...data, can_chat: false}};
    });
    queryClient.removeQueries({queryKey: queryKeys.bookings.chat(bookingId)});
    queryClient.invalidateQueries({
      queryKey: queryKeys.bookings.detail(bookingId),
    });
    queryClient.invalidateQueries({queryKey: queryKeys.bookings.lists()});
  }
  emit('ended', {booking_id: bookingId, reason});
};

/** Foreground FCM chat push for a booking. Screens decide whether to catch up. */
export const notifyBookingChatPush = data => {
  emit('push', data);
};

export const isChatSocketConnected = () => Boolean(getAppSocket()?.connected);

const handleIncomingMessage = message => {
  const bookingId = message?.booking_id;
  if (!bookingId) {
    return;
  }
  if (isBookingChatOpen(bookingId)) {
    setBookingChatLastMessage(bookingId, message);
    emit('message', message);
    return;
  }
  if (isOwnChatMessage(message)) {
    setBookingChatLastMessage(bookingId, message);
  } else {
    incrementBookingChatUnread(bookingId, message);
  }
  emit('message', message);
};

onAppSocketCreated(socket => {
  socket.on('connect', () => emit('connect'));
  socket.on('disconnect', () => emit('disconnect'));
  socket.on('chat:message', payload => handleIncomingMessage(payload?.data ?? payload));
  socket.on('chat:read', payload => emit('read', payload));
  socket.on('chat:typing', payload => emit('typing', payload));
  socket.on('chat:ended', payload => {
    endBookingChat(payload?.booking_id, payload?.reason);
  });
  socket.on('chat:error', payload => {
    if (payload?.code === CHAT_CLOSED) {
      endBookingChat(payload?.booking_id || openBookingId, CHAT_CLOSED);
      return;
    }
    emit('error', payload);
  });
});

/**
 * Send text through the socket. Resolves with the ack, rejects when the
 * socket is disconnected or the ack does not arrive in time (caller falls
 * back to REST).
 */
export const sendChatTextViaSocket = (payload, timeoutMs = SEND_ACK_TIMEOUT_MS) =>
  new Promise((resolve, reject) => {
    const socket = getAppSocket();
    if (!socket?.connected) {
      reject(new Error('SOCKET_DISCONNECTED'));
      return;
    }
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('SOCKET_TIMEOUT'));
      }
    }, timeoutMs);
    socket.emit('chat:send', payload, ack => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolve(ack);
    });
  });

export const emitChatTyping = (bookingId, isTyping) => {
  const socket = getAppSocket();
  if (socket?.connected && bookingId) {
    socket.emit('chat:typing', {booking_id: bookingId, is_typing: !!isTyping});
  }
};

/** Returns false when the socket is down so the caller can use REST. */
export const emitChatRead = bookingId => {
  const socket = getAppSocket();
  if (!socket?.connected || !bookingId) {
    return false;
  }
  socket.emit('chat:read', {booking_id: bookingId});
  return true;
};

/**
 * Hold the shared socket while `enabled` and the app is in the foreground.
 */
export const useBookingChatSocket = enabled => {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    let held = false;

    const hold = () => {
      if (held) {
        return;
      }
      held = true;
      acquireAppSocket().catch(error => {
        held = false;
        console.log('Booking chat socket unavailable:', error?.message);
      });
    };

    const drop = () => {
      if (!held) {
        return;
      }
      held = false;
      releaseAppSocket();
    };

    if (AppState.currentState === 'active') {
      hold();
    }
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        hold();
      } else {
        drop();
      }
    });

    return () => {
      subscription.remove();
      drop();
    };
  }, [enabled]);
};
