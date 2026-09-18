import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiRequest, extractAuthPayload, createUuid} from '../api/client';

export {
  apiRequest,
  ApiError,
  extractAuthPayload,
  createUuid,
  getApiErrorMessage,
} from '../api/client';

export const registerUser = async (name, email, password) => {
  return apiRequest('/auth/register', 'POST', {
    name,
    email,
    password,
    role: 'USER',
  });
};

export const sendOtp = async email => {
  return apiRequest('/auth/send-otp', 'POST', {email});
};

export const verifyOtp = async (email, otp) => {
  return apiRequest('/auth/verify-otp', 'POST', {email, otp});
};

export const resendOtp = async email => {
  return apiRequest('/auth/resend-otp', 'POST', {email});
};

export const loginUser = async (email, password) => {
  return apiRequest('/auth/login', 'POST', {email, password});
};

export const refreshAuthToken = async refreshToken => {
  return apiRequest('/auth/refresh-token', 'POST', {refreshToken});
};

export const getFamilyMembers = async () => {
  return apiRequest('/family-members', 'GET');
};

export const addFamilyMember = async formData => {
  return apiRequest('/family-members', 'POST', formData, true);
};

export const registerNotificationToken = async tokenData => {
  return apiRequest('/notifications/tokens', 'POST', tokenData);
};

export const getNotificationTokens = async () => {
  return apiRequest('/notifications/tokens', 'GET');
};

export const deleteNotificationToken = async tokenId => {
  return apiRequest(`/notifications/tokens/${tokenId}`, 'DELETE');
};

export const markInboxAsRead = async inboxId => {
  return apiRequest(`/inbox/${inboxId}/read`, 'PUT');
};

export const getInboxItem = async inboxId => {
  return apiRequest(`/inbox/${inboxId}`, 'GET');
};

export const getInboxList = async (params = {}) => {
  const {page = 1, limit = 20, is_read, type} = params;
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (is_read !== undefined && is_read !== '') {
    queryParams.append('is_read', String(is_read));
  }
  if (type) {
    queryParams.append('type', type);
  }
  return apiRequest(`/inbox?${queryParams.toString()}`, 'GET');
};

export const getInboxUnreadCount = async () => {
  return apiRequest('/inbox/unread-count', 'GET');
};

export const markAllInboxAsRead = async () => {
  return apiRequest('/inbox/read-all', 'PUT');
};

export const createBkashPayment = async bookingId => {
  return apiRequest(
    '/payments/bkash/create',
    'POST',
    {booking_id: bookingId},
    false,
    {idempotencyKey: createUuid()},
  );
};

export const executeBkashPayment = async (paymentID, bookingId) => {
  return apiRequest('/payments/bkash/execute', 'POST', {
    paymentID,
    booking_id: bookingId,
  });
};

export const queryBkashPayment = async paymentID => {
  return apiRequest('/payments/bkash/query', 'POST', {paymentID});
};

/** @deprecated Use markInboxAsRead */
export const markNotificationAsRead = async notificationId => {
  return markInboxAsRead(notificationId);
};

export const persistLocalAuth = async ({token, refreshToken, user}) => {
  if (token) {
    await AsyncStorage.setItem('userToken', token);
  }
  if (refreshToken) {
    await AsyncStorage.setItem('refreshToken', refreshToken);
  }
  if (user) {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  }
};
