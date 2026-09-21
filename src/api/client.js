/**
 * Single API helper for the CareMate envelope.
 * Success payload is always json.data. Errors throw ApiError.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {getFullUrl} from './endpoints';

export const API_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  CONFLICT: 'CONFLICT',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  NOT_FOUND: 'NOT_FOUND',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  OTP_INVALID: 'OTP_INVALID',
};

const AUTH_SKIP_REFRESH = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-otp',
  '/auth/resend-otp',
  '/auth/send-otp',
  '/auth/refresh-token',
];

let authFailureHandler = null;
let refreshInFlight = null;
let loggingOut = false;

export const setAuthFailureHandler = handler => {
  authFailureHandler = handler;
};

export class ApiError extends Error {
  constructor(code, message, errors = [], statusCode) {
    super(message || 'Request failed');
    this.name = 'ApiError';
    this.code = code || null;
    this.errors = Array.isArray(errors) ? errors : [];
    this.statusCode = statusCode;
  }
}

export const createUuid = () => {
  const cryptoObj = globalThis.crypto;
  if (typeof cryptoObj?.randomUUID === 'function') {
    return cryptoObj.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

export const getApiErrorMessage = (error, fallback = 'Request failed') => {
  if (!error) {
    return fallback;
  }
  if (error.statusCode === 503) {
    return (
      error.message ||
      'Server is temporarily unavailable. Please try again in a moment.'
    );
  }
  if (Array.isArray(error.errors) && error.errors.length > 0) {
    const first = error.errors[0];
    const fieldMessage =
      typeof first === 'string' ? first : first?.message || first?.msg;
    if (fieldMessage) {
      return fieldMessage;
    }
  }
  return error.message || fallback;
};

export const extractAuthPayload = response => {
  const data =
    response?.data && typeof response.data === 'object' ? response.data : {};
  return {
    token: data.token,
    refreshToken: data.refreshToken,
    user: data.user,
  };
};

export const asList = value => {
  if (Array.isArray(value)) {
    return value;
  }
  if (Array.isArray(value?.data)) {
    return value.data;
  }
  return [];
};

const persistAuthTokens = async data => {
  if (data?.token) {
    await AsyncStorage.setItem('userToken', data.token);
  }
  if (data?.refreshToken) {
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
  }
};

const clearAuthTokens = async () => {
  await AsyncStorage.multiRemove(['userToken', 'refreshToken']);
};

const parseJsonSafe = async response => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

const isAuthFailure = (json, status) =>
  status === 401 ||
  json?.code === API_CODES.UNAUTHORIZED ||
  json?.code === API_CODES.TOKEN_EXPIRED;

const notifyAuthFailure = async () => {
  if (loggingOut) {
    return;
  }
  loggingOut = true;
  try {
    await clearAuthTokens();
    if (typeof authFailureHandler === 'function') {
      authFailureHandler();
    }
  } finally {
    setTimeout(() => {
      loggingOut = false;
    }, 1500);
  }
};

const refreshAccessToken = async () => {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
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
      const json = await parseJsonSafe(response);
      const token = json?.data?.token;
      if (json?.success && token) {
        await persistAuthTokens(json.data);
        return token;
      }
    } catch (error) {
      console.error('Refresh token error:', error);
    }
    return null;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
};

const unwrapSuccess = json => {
  const hasPagination = Boolean(json?.meta?.pagination);
  let data = json?.data;
  if (data == null && hasPagination) {
    data = [];
  }
  return {
    success: true,
    statusCode: json?.statusCode,
    message: json?.message,
    data,
    meta: json?.meta || {},
  };
};

export const parseEnvelope = (json, httpStatus) => {
  if (!json || typeof json !== 'object') {
    const friendly =
      httpStatus === 503
        ? 'Server is temporarily unavailable. Please try again in a moment.'
        : httpStatus === 502 || httpStatus === 504
          ? 'Server gateway error. Please try again.'
          : `HTTP error! status: ${httpStatus}`;
    throw new ApiError(undefined, friendly, [], httpStatus);
  }

  if (!json.success) {
    throw new ApiError(
      json.code,
      json.message || `HTTP error! status: ${httpStatus}`,
      json.errors,
      json.statusCode || httpStatus,
    );
  }

  return unwrapSuccess(json);
};

export const apiRequest = async (
  endpoint,
  method = 'GET',
  body = null,
  isFormData = false,
  {retry = true, headers: extraHeaders = {}, idempotencyKey} = {},
) => {
  const token = await AsyncStorage.getItem('userToken');
  const headers = {...extraHeaders};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(getFullUrl(endpoint), config);
  const json = await parseJsonSafe(response);
  const skipRefresh = AUTH_SKIP_REFRESH.some(path =>
    endpoint.startsWith(path),
  );

  if (isAuthFailure(json, response.status) && retry && token && !skipRefresh) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiRequest(endpoint, method, body, isFormData, {
        retry: false,
        headers: extraHeaders,
        idempotencyKey,
      });
    }
    await notifyAuthFailure();
    throw new ApiError(
      json?.code || API_CODES.UNAUTHORIZED,
      json?.message || 'Session expired. Please log in again.',
      json?.errors,
      json?.statusCode || response.status,
    );
  }

  return parseEnvelope(json, response.status);
};

export default apiRequest;
