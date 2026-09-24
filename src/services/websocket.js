/**
 * WebSocket Service
 * Handles real-time messaging using Socket.IO
 */

import {io} from 'socket.io-client';
import {getSocketBaseUrl} from '../api/endpoints';
import {useAuth} from '../context/AuthContext';

let socket = null;
let isConnected = false;

// Event listeners storage
const eventListeners = new Map();

/**
 * Initialize WebSocket connection
 * @param {string} token - JWT token for authentication
 */
export const initializeSocket = (token) => {
  if (socket && isConnected) {
    return socket;
  }

  try {
    socket = io(getSocketBaseUrl(), {
      auth: {token},
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      isConnected = true;
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      isConnected = false;
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      isConnected = false;
    });

    return socket;
  } catch (error) {
    console.error('Failed to initialize WebSocket:', error);
    return null;
  }
};

/**
 * Get current socket instance
 */
export const getSocket = () => {
  return socket;
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = () => {
  return isConnected && socket?.connected;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnected = false;
    eventListeners.clear();
  }
};

/**
 * Subscribe to a conversation
 * @param {string} conversationId - Conversation ID to subscribe
 */
export const subscribeToConversation = (conversationId) => {
  if (!socket || !isConnected) {
    console.warn('Socket not connected, cannot subscribe to conversation');
    return Promise.reject(new Error('Socket not connected'));
  }

  return new Promise((resolve, reject) => {
    socket.emit('conversation:subscribe', {conversation_id: conversationId}, (response) => {
      if (response?.ok) {
        console.log('Subscribed to conversation:', conversationId);
        resolve(response);
      } else {
        console.error('Failed to subscribe to conversation:', response);
        reject(new Error('Failed to subscribe to conversation'));
      }
    });
  });
};

/**
 * Unsubscribe from a conversation
 * @param {string} conversationId - Conversation ID to unsubscribe
 */
export const unsubscribeFromConversation = (conversationId) => {
  if (!socket || !isConnected) {
    return;
  }

  socket.emit('conversation:unsubscribe', {conversation_id: conversationId}, (response) => {
    if (response?.ok) {
      console.log('Unsubscribed from conversation:', conversationId);
    }
  });
};

/**
 * Send a message via WebSocket
 * @param {string} conversationId - Conversation ID
 * @param {string} message - Message content
 * @param {string} messageType - Message type (default: 'text')
 */
export const sendSocketMessage = (conversationId, message, messageType = 'text') => {
  if (!socket || !isConnected) {
    console.warn('Socket not connected, cannot send message');
    return Promise.reject(new Error('Socket not connected'));
  }

  return new Promise((resolve, reject) => {
    socket.emit(
      'message:send',
      {conversation_id: conversationId, message, message_type: messageType},
      (response) => {
        if (response?.ok) {
          console.log('Message sent via WebSocket:', response.data);
          resolve(response.data);
        } else {
          console.error('Failed to send message:', response);
          reject(new Error('Failed to send message'));
        }
      }
    );
  });
};

/**
 * Mark messages as read via WebSocket
 * @param {string} conversationId - Conversation ID
 */
export const markMessagesRead = (conversationId) => {
  if (!socket || !isConnected) {
    return Promise.reject(new Error('Socket not connected'));
  }

  return new Promise((resolve, reject) => {
    socket.emit('message:mark_read', {conversation_id: conversationId}, (response) => {
      if (response?.ok) {
        console.log('Messages marked as read');
        resolve(response);
      } else {
        console.error('Failed to mark messages as read:', response);
        reject(new Error('Failed to mark messages as read'));
      }
    });
  });
};

/**
 * Listen for new messages
 * @param {function} callback - Callback function to handle new messages
 */
export const onNewMessage = (callback) => {
  if (!socket) {
    console.warn('Socket not initialized');
    return;
  }

  socket.on('conversation:message', (data) => {
    console.log('New message received:', data.message);
    callback(data);
  });

  // Store listener for cleanup
  if (!eventListeners.has('conversation:message')) {
    eventListeners.set('conversation:message', []);
  }
  eventListeners.get('conversation:message').push(callback);
};

/**
 * Listen for conversation status updates
 * @param {function} callback - Callback function to handle status changes
 */
export const onConversationStatus = (callback) => {
  if (!socket) {
    console.warn('Socket not initialized');
    return;
  }

  socket.on('conversation:status', (data) => {
    console.log('Conversation status changed:', data.status);
    callback(data);
  });

  // Store listener for cleanup
  if (!eventListeners.has('conversation:status')) {
    eventListeners.set('conversation:status', []);
  }
  eventListeners.get('conversation:status').push(callback);
};

/**
 * Remove event listener
 * @param {string} event - Event name
 * @param {function} callback - Callback function to remove
 */
export const removeEventListener = (event, callback) => {
  if (!socket) {
    return;
  }

  socket.off(event, callback);

  // Remove from storage
  const listeners = eventListeners.get(event);
  if (listeners) {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }
};

/**
 * Remove all event listeners for an event
 * @param {string} event - Event name
 */
export const removeAllEventListeners = (event) => {
  if (!socket) {
    return;
  }

  const listeners = eventListeners.get(event);
  if (listeners) {
    listeners.forEach(callback => {
      socket.off(event, callback);
    });
    eventListeners.delete(event);
  }
};

export default {
  initializeSocket,
  getSocket,
  isSocketConnected,
  disconnectSocket,
  subscribeToConversation,
  unsubscribeFromConversation,
  sendSocketMessage,
  markMessagesRead,
  onNewMessage,
  onConversationStatus,
  removeEventListener,
  removeAllEventListeners,
};