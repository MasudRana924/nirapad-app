/**
 * API Services
 * HTTP client and service functions for API calls
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {getFullUrl} from './endpoints';

const AUTH_SKIP_REFRESH = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-otp',
  '/auth/resend-otp',
  '/auth/send-otp',
  '/auth/refresh-token',
];

const persistAuthTokens = async data => {
  if (data?.token) {
    await AsyncStorage.setItem('userToken', data.token);
  }
  if (data?.refreshToken) {
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
  }
};

const refreshAccessToken = async () => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(getFullUrl('/auth/refresh-token'), {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({refreshToken}),
    });
    const payload = await response.json();
    const data = payload?.data;
    if (payload?.success && data?.token) {
      await persistAuthTokens(data);
      return data.token;
    }
  } catch (error) {
    console.error('Refresh token error:', error);
  }
  return null;
};

const parseResponseBody = async response => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

const getErrorMessage = (payload, status) => {
  if (payload?.message) {
    return payload.message;
  }
  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    const first = payload.errors[0];
    return typeof first === 'string' ? first : first?.message || `HTTP error! status: ${status}`;
  }
  return `HTTP error! status: ${status}`;
};

/**
 * Get auth token from storage
 */
const getAuthToken = async () => {
  return await AsyncStorage.getItem('userToken');
};

/**
 * Generic API request handler
 */
export const apiRequest = async (
  endpoint,
  method = 'GET',
  body = null,
  isFormData = false,
  {retry = true} = {},
) => {
  const token = await getAuthToken();

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(getFullUrl(endpoint), config);
    const data = await parseResponseBody(response);

    if (
      response.status === 401 &&
      retry &&
      token &&
      !AUTH_SKIP_REFRESH.some(path => endpoint.startsWith(path))
    ) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return apiRequest(endpoint, method, body, isFormData, {retry: false});
      }
    }

    if (!response.ok) {
      throw new Error(getErrorMessage(data, response.status));
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * Auth Services
 */
export const authService = {
  register: (name, email, password) =>
    apiRequest('/auth/register', 'POST', {name, email, password, role: 'USER'}),

  login: (email, password) =>
    apiRequest('/auth/login', 'POST', {email, password}),

  sendOtp: email => apiRequest('/auth/send-otp', 'POST', {email}),

  verifyOtp: (email, otp) =>
    apiRequest('/auth/verify-otp', 'POST', {email, otp}),

  resendOtp: email => apiRequest('/auth/resend-otp', 'POST', {email}),

  refreshToken: refreshToken =>
    apiRequest('/auth/refresh-token', 'POST', {refreshToken}),

  getAuthProfile: () => apiRequest('/auth/profile', 'GET'),

  getUserProfile: () => apiRequest('/user/profile', 'GET'),

  updateUserProfile: formData =>
    apiRequest('/user/profile', 'PUT', formData, true),

  uploadAvatar: formData => apiRequest('/user/avatar', 'POST', formData, true),
};

/**
 * Family Members Services
 */
export const familyService = {
  getFamilyMembers: () => apiRequest('/family-members', 'GET'),

  getFamilyMember: id => apiRequest(`/family-members/${id}`, 'GET'),

  addFamilyMember: formData =>
    apiRequest('/family-members', 'POST', formData, true),

  updateFamilyMember: (id, formData) =>
    apiRequest(`/family-members/${id}`, 'PUT', formData, true),

  deleteFamilyMember: id => apiRequest(`/family-members/${id}`, 'DELETE'),
};

/**
 * Caregivers Services
 */
export const caregiverService = {
  getCaregivers: (params = {}) => caregiverService.searchCaregivers(params),

  getCaregiverDetails: id => apiRequest(`/caregiver/${id}`, 'GET'),

  searchCaregivers: (params = {}) => {
    const {
      page = 1,
      limit = 20,
      location,
      gender,
      name,
      district,
      thana,
      min_rating,
      verification_status,
      service_area,
    } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (district) {
      queryParams.append('district', district);
    } else if (location) {
      queryParams.append('district', location);
    }
    if (thana) {
      queryParams.append('thana', thana);
    }
    if (gender) {
      queryParams.append('gender', gender);
    }
    if (name) {
      queryParams.append('name', name);
    }
    if (min_rating) {
      queryParams.append('min_rating', String(min_rating));
    }
    if (verification_status) {
      queryParams.append('verification_status', verification_status);
    }
    if (service_area) {
      queryParams.append('service_area', service_area);
    }
    return apiRequest(`/caregiver/search?${queryParams.toString()}`, 'GET');
  },
};

/**
 * Inbox Services
 */
export const inboxService = {
  getInbox: (params = {}) => {
    const {page = 1, limit = 20, is_read, type} = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (is_read !== undefined && is_read !== '') {
      queryParams.append('is_read', String(is_read));
    }
    if (type) {
      queryParams.append('type', type);
    }
    return apiRequest(`/inbox?${queryParams.toString()}`, 'GET');
  },

  getInboxItem: id => apiRequest(`/inbox/${id}`, 'GET'),

  getUnreadCount: () => apiRequest('/inbox/unread-count', 'GET'),

  markAsRead: id => apiRequest(`/inbox/${id}/read`, 'PUT'),

  markAllAsRead: () => apiRequest('/inbox/read-all', 'PUT'),
};

/** @deprecated Use inboxService — kept so existing imports keep working */
export const notificationService = {
  getNotifications: params => inboxService.getInbox(params),
  getNotification: id => inboxService.getInboxItem(id),
  markAsRead: id => inboxService.markAsRead(id),
  markAllAsRead: () => inboxService.markAllAsRead(),
};

/**
 * Bookings Services
 */
export const bookingService = {
  getBookings: (params = {}) => {
    const {page = 1, limit = 20, status} = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) {
      queryParams.append('status', status);
    }
    return apiRequest(`/bookings?${queryParams.toString()}`, 'GET');
  },

  getBookingDetails: id => apiRequest(`/bookings/${id}`, 'GET'),

  createBooking: bookingData =>
    apiRequest('/bookings', 'POST', bookingData, false),

  updateBooking: (id, bookingData) =>
    apiRequest(`/bookings/${id}`, 'PUT', bookingData),

  cancelBooking: (id, reason) =>
    apiRequest(`/bookings/${id}/cancel`, 'POST', {
      reason: reason || 'Plans changed',
    }),
};

/**
 * Payments Services
 */
export const paymentService = {
  createBkashPayment: bookingId =>
    apiRequest('/payments/bkash/create', 'POST', {booking_id: bookingId}),

  executeBkashPayment: (paymentID, bookingId) =>
    apiRequest('/payments/bkash/execute', 'POST', {
      paymentID,
      booking_id: bookingId,
    }),
};

/**
 * Hospitals Services
 */
export const hospitalService = {
  getHospitals: (params = {}) => hospitalService.searchHospitals(params),

  getHospitalDetails: id => apiRequest(`/hospitals/${id}`, 'GET'),

  searchHospitals: (params = {}) => {
    const {page = 1, limit = 20, district} = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (district) {
      queryParams.append('district', district);
    }
    return apiRequest(`/hospitals?${queryParams.toString()}`, 'GET');
  },
};

export default {
  apiRequest,
  authService,
  familyService,
  caregiverService,
  bookingService,
  paymentService,
  hospitalService,
  inboxService,
  notificationService,
};
