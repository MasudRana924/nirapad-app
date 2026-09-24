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
 * Join a conversation room
 * @param {string} conversationId - Conversation ID to join
 */
export const joinConversation = (conversationId) => {
  if (!socket || !isConnected) {
    console.warn('Socket not connected, cannot join conversation');
    return Promise.reject(new Error('Socket not connected'));
  }

  return new Promise((resolve, reject) => {
    socket.emit('conversation:join', {conversation_id: conversationId}, (response) => {
      if (response?.ok) {
        console.log('Joined conversation room:', conversationId);
        resolve(response);
      } else {
        console.error('Failed to join conversation:', response);
        reject(new Error('Failed to join conversation'));
      }
    });
  });
};

/**
 * Leave a conversation room
 * @param {string} conversationId - Conversation ID to leave
 */
export const leaveConversation = (conversationId) => {
  if (!socket || !isConnected) {
    return;
  }

  socket.emit('conversation:leave', {conversation_id: conversationId}, (response) => {
    if (response?.ok) {
      console.log('Left conversation room:', conversationId);
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

  socket.on('message:new', (message) => {
    console.log('New message received:', message);
    callback(message);
  });

  // Store listener for cleanup
  if (!eventListeners.has('message:new')) {
    eventListeners.set('message:new', []);
  }
  eventListeners.get('message:new').push(callback);
};

/**
 * Listen for read status updates
 * @param {function} callback - Callback function to handle read status
 */
export const onMessagesRead = (callback) => {
  if (!socket) {
    console.warn('Socket not initialized');
    return;
  }

  socket.on('conversation:messages_read', (data) => {
    console.log('Conversation messages marked as read:', data);
    callback(data);
  });

  // Store listener for cleanup
  if (!eventListeners.has('conversation:messages_read')) {
    eventListeners.set('conversation:messages_read', []);
  }
  eventListeners.get('conversation:messages_read').push(callback);
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
  joinConversation,
  leaveConversation,
  sendSocketMessage,
  markMessagesRead,
  onNewMessage,
  onMessagesRead,
  removeEventListener,
  removeAllEventListeners,
};