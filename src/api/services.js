/**
 * API Services
 * HTTP client and service functions for API calls
 */

import {apiRequest, apiUpload, createUuid} from './client';

export {apiRequest, ApiError, extractAuthPayload, createUuid} from './client';

/**
 * Auth Services
 */
const publicAuth = {skipAuth: true};

const identifierBody = ({email, phone}) => (phone ? {phone} : {email});

export const authService = {
  register: ({name, email, phone, password}) =>
    apiRequest(
      '/auth/register',
      'POST',
      {name, password, role: 'USER', ...identifierBody({email, phone})},
      false,
      publicAuth,
    ),

  login: ({email, phone, password}) =>
    apiRequest(
      '/auth/login',
      'POST',
      {password, ...identifierBody({email, phone})},
      false,
      publicAuth,
    ),

  sendOtp: email =>
    apiRequest('/auth/send-otp', 'POST', {email}, false, publicAuth),

  verifyOtp: ({email, phone, otp}) =>
    apiRequest(
      '/auth/verify-otp',
      'POST',
      {otp, ...identifierBody({email, phone})},
      false,
      publicAuth,
    ),

  resendOtp: ({email, phone}) =>
    apiRequest(
      '/auth/resend-otp',
      'POST',
      identifierBody({email, phone}),
      false,
      publicAuth,
    ),

  refreshToken: refreshToken =>
    apiRequest('/auth/refresh-token', 'POST', {refreshToken}),

  getAuthProfile: () => apiRequest('/auth/profile', 'GET'),

  getUserProfile: () => apiRequest('/user/profile', 'GET'),

  /** PUT /user/profile — always multipart/form-data (text fields + optional profile_photo) */
  updateUserProfile: formData =>
    apiRequest('/user/profile', 'PUT', formData, true),

  uploadAvatar: formData => apiRequest('/user/avatar', 'POST', formData, true),
};

/**
 * My account (/user/me). Photo and profile fields are updated separately;
 * both return the full account.
 */
export const accountService = {
  getMe: () => apiRequest('/user/me', 'GET'),

  /** JSON body with only the changed fields. Never includes the photo. */
  updateMe: fields => apiRequest('/user/me', 'PUT', fields),

  /** multipart/form-data with a single `photo` field. */
  updateMyPhoto: formData =>
    apiRequest('/user/me/photo', 'PUT', formData, true, {timeout: 60000}),
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
      booking_date,
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
    if (booking_date) {
      queryParams.append('booking_date', booking_date);
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
    return apiRequest(`/user/notifications?${queryParams.toString()}`, 'GET');
  },

  getInboxItem: id => apiRequest(`/inbox/${id}`, 'GET'),

  getUnreadCount: () => apiRequest('/user/notifications/unread-count', 'GET'),

  markAsRead: id => apiRequest(`/user/notifications/${id}/read`, 'PUT'),

  markAllAsRead: () => apiRequest('/user/notifications/read-all', 'POST'),

  deleteNotification: id => apiRequest(`/notifications/${id}`, 'DELETE'),
};

export const notificationPreferenceService = {
  getPreferences: () => apiRequest('/notifications/preferences', 'GET'),

  updatePreferences: payload =>
    apiRequest('/notifications/preferences', 'PUT', payload),
};

/**
 * Privacy Policies (public — no token)
 */
export const privacyPolicyService = {
  getByAudience: (audience = 'USER') =>
    apiRequest(`/privacy-policies/${audience}`, 'GET', null, false, {
      skipAuth: true,
    }),
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

  getLiveLocation: id => apiRequest(`/bookings/${id}/live-location`, 'GET'),

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

  acceptNextCaregiver: id =>
    apiRequest(`/bookings/${id}/accept-next-caregiver`, 'POST'),

  declineNextCaregiver: id =>
    apiRequest(`/bookings/${id}/decline-next-caregiver`, 'POST'),
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

/**
 * Support chat — one thread per user at /conversations/me.
 * New admin replies arrive by push; the app then refetches this REST API.
 */
export const conversationService = {
  getMyThread: () => apiRequest('/conversations/me', 'GET'),

  getUnreadCount: () => apiRequest('/conversations/me/unread-count', 'GET'),

  getMessages: ({limit = 30, before, after} = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', String(limit));
    if (before) {
      queryParams.append('before', before);
    }
    if (after) {
      queryParams.append('after', after);
    }
    return apiRequest(
      `/conversations/me/messages?${queryParams.toString()}`,
      'GET',
    );
  },

  sendText: ({message, client_message_id}) =>
    apiRequest('/conversations/me/messages', 'POST', {
      message,
      client_message_id,
    }),

  sendFile: (formData, onProgress) =>
    apiUpload('/conversations/me/messages', formData, {onProgress}),

  markAsRead: () => apiRequest('/conversations/me/read', 'PUT'),
};

/**
 * Booking chat — user <-> assigned caregiver, only while the booking is
 * SERVICE_IN_PROGRESS. Separate from support chat.
 */
export const bookingChatService = {
  getSummary: bookingId => apiRequest(`/bookings/${bookingId}/chat`, 'GET'),

  getMessages: (bookingId, {limit = 30, before, after} = {}) => {
    const queryParams = new URLSearchParams();
    if (after) {
      queryParams.append('after', after);
    } else {
      queryParams.append('limit', String(limit));
    }
    if (before) {
      queryParams.append('before', before);
    }
    return apiRequest(
      `/bookings/${bookingId}/chat/messages?${queryParams.toString()}`,
      'GET',
    );
  },

  sendText: (bookingId, {message, client_message_id}) =>
    apiRequest(`/bookings/${bookingId}/chat/messages`, 'POST', {
      message,
      client_message_id,
    }),

  sendFile: (bookingId, formData, onProgress) =>
    apiUpload(`/bookings/${bookingId}/chat/messages`, formData, {onProgress}),

  markAsRead: bookingId => apiRequest(`/bookings/${bookingId}/chat/read`, 'PUT'),
};

export default {
  apiRequest,
  authService,
  accountService,
  familyService,
  caregiverService,
  bookingService,
  paymentService,
  hospitalService,
  inboxService,
  notificationService,
  notificationPreferenceService,
  privacyPolicyService,
  conversationService,
  bookingChatService,
};
