import AsyncStorage from '@react-native-async-storage/async-storage';


const BASE_URL = 'http://192.168.10.78:8000/api/v1';

const apiRequest = async (endpoint, method = 'GET', body = null, isFormData = false) => {
  const token = await AsyncStorage.getItem('userToken');
  
  const config = {
    method,
    headers: {},
  };

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (isFormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  } else {
    config.headers['Content-Type'] = 'application/json';
  }

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();
  return data;
};

export const registerUser = async (name, email, password) => {
  return apiRequest('/auth/register', 'POST', {name, email, password});
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

export const getFamilyMembers = async () => {
  return apiRequest('/family-members', 'GET');
};

export const addFamilyMember = async (formData) => {
  return apiRequest('/family-members', 'POST', formData, true);
};
