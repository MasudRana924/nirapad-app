/**
 * API Endpoints Configuration
 * Centralized endpoint definitions for all API routes
 */

// const BASE_URL = 'http://192.168.10.78:8000/api/v1';
 const BASE_URL = 'https://carevita-service.onrender.com/api/v1';

export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    REFRESH_TOKEN: '/auth/refresh-token',
    PROFILE: '/auth/profile',
  },

  // User profile endpoints
  USER: {
    PROFILE: '/user/profile',
    AVATAR: '/user/avatar',
    BOOKINGS: '/user/bookings',
  },

  // Family members endpoints
  FAMILY_MEMBERS: {
    LIST: '/family-members',
    CREATE: '/family-members',
    DETAIL: id => `/family-members/${id}`,
    UPDATE: id => `/family-members/${id}`,
    DELETE: id => `/family-members/${id}`,
  },

  // Caregivers endpoints (singular resource)
  CAREGIVERS: {
    SEARCH: '/caregiver/search',
    LIST: '/caregiver/search',
    DETAIL: id => `/caregiver/${id}`,
    AVAILABILITY: id => `/caregiver/${id}/availability`,
  },

  // Bookings endpoints
  BOOKINGS: {
    LIST: '/bookings',
    CREATE: '/bookings',
    DETAIL: id => `/bookings/${id}`,
    UPDATE: id => `/bookings/${id}`,
    CANCEL: id => `/bookings/${id}/cancel`,
    REVIEW: id => `/bookings/${id}/review`,
    DISPUTE: id => `/bookings/${id}/dispute`,
    DISPUTES: id => `/bookings/${id}/disputes`,
  },

  // Hospitals endpoints
  HOSPITALS: {
    LIST: '/hospitals',
    DETAIL: id => `/hospitals/${id}`,
  },

  // Inbox endpoints
  INBOX: {
    LIST: '/inbox',
    UNREAD_COUNT: '/inbox/unread-count',
    DETAIL: id => `/inbox/${id}`,
    READ: id => `/inbox/${id}/read`,
    READ_ALL: '/inbox/read-all',
  },

  // Payments endpoints
  PAYMENTS: {
    BKASH_CREATE: '/payments/bkash/create',
    BKASH_EXECUTE: '/payments/bkash/execute',
    BKASH_QUERY: '/payments/bkash/query',
  },

  // FCM token endpoints
  NOTIFICATION_TOKENS: {
    LIST: '/notifications/tokens',
    CREATE: '/notifications/tokens',
    DELETE: id => `/notifications/tokens/${id}`,
  },

  NOTIFICATION_PREFERENCES: {
    GET: '/notifications/preferences',
    UPDATE: '/notifications/preferences',
  },
};

export const getFullUrl = endpoint => `${BASE_URL}${endpoint}`;

export default ENDPOINTS;
