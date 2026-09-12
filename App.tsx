/**
 * Nirapod - Professional Care App
 *
 * @format
 */

import React, {useState, useCallback, useEffect, useRef} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import notificationService from './src/services/notificationService';
import {NavigationContainer} from '@react-navigation/native';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function AppContent() {
  const {isLoading, userToken} = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const navigationRef = useRef<any>(null);
  const listenersCleanupRef = useRef<(() => void) | null>(null);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  const setupNotificationListeners = useCallback(() => {
    if (typeof listenersCleanupRef.current === 'function') {
      listenersCleanupRef.current();
    }
    listenersCleanupRef.current = notificationService.setupMessageHandlers(
      navigationRef.current,
    );
  }, []);

  useEffect(() => {
    return () => {
      if (typeof listenersCleanupRef.current === 'function') {
        listenersCleanupRef.current();
      }
    };
  }, []);

  // Initialize notifications when user logs in.
  // Do not call handleLogout on the initial null token — that runs on every app launch.
  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (userToken) {
      notificationService.initialize(userToken).catch((error: any) => {
        console.error('Failed to initialize notifications:', error);
      });
    }
  }, [userToken, isLoading]);

  // Keep splash visible until auth is ready AND splash timer finishes
  if (showSplash || isLoading) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <NavigationContainer ref={navigationRef} onReady={setupNotificationListeners}>
      <AppNavigator />
    </NavigationContainer>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
