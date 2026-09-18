/**
 * API Services
 * HTTP client and service functions for API calls
 */

import {apiRequest, createUuid} from './client';

export {apiRequest, ApiError, extractAuthPayload, createUuid} from './client';

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

  getAvailability: id => apiRequest(`/caregiver/${id}/availability`, 'GET'),

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

export const notificationPreferenceService = {
  getPreferences: () => apiRequest('/notifications/preferences', 'GET'),

  updatePreferences: payload =>
    apiRequest('/notifications/preferences', 'PUT', payload),
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

  submitReview: (id, {rating, comment} = {}) => {
    const body = {rating};
    if (comment != null && String(comment).trim()) {
      body.comment = String(comment).trim();
    }
    return apiRequest(`/bookings/${id}/review`, 'POST', body);
  },

  createDispute: (id, {reason, details} = {}) => {
    const body = {reason};
    if (details != null && String(details).trim()) {
      body.details = String(details).trim();
    }
    return apiRequest(`/bookings/${id}/dispute`, 'POST', body);
  },

  getDisputes: id => apiRequest(`/bookings/${id}/disputes`, 'GET'),

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
  createBkashPayment: (bookingId, {idempotencyKey} = {}) =>
    apiRequest(
      '/payments/bkash/create',
      'POST',
      {booking_id: bookingId},
      false,
      {idempotencyKey: idempotencyKey || createUuid()},
    ),

  executeBkashPayment: (paymentID, bookingId) =>
    apiRequest('/payments/bkash/execute', 'POST', {
      paymentID,
      booking_id: bookingId,
    }),

  queryBkashPayment: paymentID =>
    apiRequest('/payments/bkash/query', 'POST', {paymentID}),
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
  notificationPreferenceService,
};
