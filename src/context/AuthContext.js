import React, {createContext, useState, useEffect, useContext, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../services/notificationService';
import {setAuthFailureHandler} from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [userToken, setUserToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      console.log('🚪 Handling logout...');
      await notificationService.handleLogout(userToken);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      setUserToken(null);
      setRefreshToken(null);
      setUser(null);
      console.log('✅ Logout completed successfully');
    } catch (error) {
      console.error('Failed to remove token:', error);
      setUserToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  }, [userToken]);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
        const storedUser = await AsyncStorage.getItem('user');

        if (storedToken) {
          setUserToken(storedToken);
          setRefreshToken(storedRefreshToken);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Failed to load token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  useEffect(() => {
    setAuthFailureHandler(() => {
      logout();
    });
    return () => setAuthFailureHandler(null);
  }, [logout]);

  const login = async (token, refresh, userData) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      if (refresh) {
        await AsyncStorage.setItem('refreshToken', refresh);
      }
      if (userData) {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      }
      setUserToken(token);
      setRefreshToken(refresh);
      setUser(userData);
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        refreshToken,
        user,
        isLoading,
        login,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
