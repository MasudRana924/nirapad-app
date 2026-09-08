/**
 * Nirapod - Professional Care App
 *
 * @format
 */

import React, {useState, useCallback} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';

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
  const {isLoading} = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Keep splash visible until auth is ready AND splash timer finishes
  if (showSplash || isLoading) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return <AppNavigator />;
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
