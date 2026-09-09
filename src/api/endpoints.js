/**
 * API Endpoints Configuration
 * Centralized endpoint definitions for all API routes
 */

const BASE_URL = 'http://192.168.10.78:8000/api/v1';
//  const BASE_URL = 'https://carevita-service.onrender.com/api/v1';

export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
  },

  // Family members endpoints
  FAMILY_MEMBERS: {
    LIST: '/family-members',
    CREATE: '/family-members',
    DETAIL: (id) => `/family-members/${id}`,
    UPDATE: (id) => `/family-members/${id}`,
    DELETE: (id) => `/family-members/${id}`,
  },

  // Caregivers endpoints
  CAREGIVERS: {
    LIST: '/caregivers',
    DETAIL: (id) => `/caregivers/${id}`,
  },

  // Bookings endpoints
  BOOKINGS: {
    LIST: '/bookings',
    CREATE: '/bookings',
    DETAIL: (id) => `/bookings/${id}`,
    UPDATE: (id) => `/bookings/${id}`,
    CANCEL: (id) => `/bookings/${id}/cancel`,
  },

  // Hospitals endpoints
  HOSPITALS: {
    LIST: '/hospitals',
    DETAIL: (id) => `/hospitals/${id}`,
  },
};

export const getFullUrl = (endpoint) => `${BASE_URL}${endpoint}`;

export default ENDPOINTS;
