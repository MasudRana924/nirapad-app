/**
 * API Services
 * HTTP client and service functions for API calls
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {getFullUrl} from './endpoints';

/**
 * Get auth token from storage
 */
const getAuthToken = async () => {
  return await AsyncStorage.getItem('userToken');
};

/**
 * Generic API request handler
 * @param {string} endpoint - API endpoint path
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {object|string} body - Request body (object for JSON, FormData for multipart)
 * @param {boolean} isFormData - Whether the body is FormData
 * @returns {Promise} Response data
 */
export const apiRequest = async (endpoint, method = 'GET', body = null, isFormData = false) => {
  const token = await getAuthToken();
  
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (isFormData) {
    // Don't set Content-Type for FormData - let the browser set it with boundary
    // headers['Content-Type'] = 'multipart/form-data';
  } else {
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
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
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
    apiRequest('/auth/register', 'POST', {name, email, password}),

  login: (email, password) =>
    apiRequest('/auth/login', 'POST', {email, password}),

  verifyOtp: (email, otp) =>
    apiRequest('/auth/verify-otp', 'POST', {email, otp}),

  resendOtp: (email) =>
    apiRequest('/auth/resend-otp', 'POST', {email}),
};

/**
 * Family Members Services
 */
export const familyService = {
  getFamilyMembers: () =>
    apiRequest('/family-members', 'GET'),

  addFamilyMember: (formData) =>
    apiRequest('/family-members', 'POST', formData, true),

  updateFamilyMember: (id, formData) =>
    apiRequest(`/family-members/${id}`, 'PUT', formData, true),

  deleteFamilyMember: (id) =>
    apiRequest(`/family-members/${id}`, 'DELETE'),
};

/**
 * Caregivers Services
 */
export const caregiverService = {
  getCaregivers: () =>
    apiRequest('/caregivers', 'GET'),

  getCaregiverDetails: (id) =>
    apiRequest(`/caregivers/${id}`, 'GET'),
};

/**
 * Bookings Services
 */
export const bookingService = {
  getBookings: () =>
    apiRequest('/bookings', 'GET'),

  createBooking: (bookingData) =>
    apiRequest('/bookings', 'POST', bookingData),

  updateBooking: (id, bookingData) =>
    apiRequest(`/bookings/${id}`, 'PUT', bookingData),

  cancelBooking: (id) =>
    apiRequest(`/bookings/${id}/cancel`, 'POST'),
};

/**
 * Hospitals Services
 */
export const hospitalService = {
  getHospitals: () =>
    apiRequest('/hospitals', 'GET'),

  getHospitalDetails: (id) =>
    apiRequest(`/hospitals/${id}`, 'GET'),
};

export default {
  apiRequest,
  authService,
  familyService,
  caregiverService,
  bookingService,
  hospitalService,
};
