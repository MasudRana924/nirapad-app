/**
 * Nirapod - Professional Care App
 *
 * @format
 */

import './src/language/i18n';
import React, {useState, useCallback, useEffect, useRef} from 'react';
import {StatusBar} from 'react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import notificationService from './src/services/notificationService';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import NotificationBanner from './src/components/common/NotificationBanner';
import {handleNotificationClick, parseNotificationData} from './src/utils/notificationHandler';
import {isSupportMessagePush} from './src/utils/supportPush';
import {queryKeys} from './src/api/queryKeys';
import {ModalProvider} from './src/contexts/ModalContext';
import BookingAlertHost from './src/components/booking/BookingAlertHost';
import {showBookingAlertFromPush} from './src/utils/bookingAlerts';
import {isBookingChatPush} from './src/utils/bookingChatPush';
import BookingChatHost from './src/components/booking/BookingChatHost';
import {
  incrementBookingChatUnread,
  isChatSocketConnected,
  setBookingChatQueryClient,
} from './src/services/bookingChat';

const navTheme = {
  ...DefaultTheme,
  colors: {...DefaultTheme.colors, background: '#FFFFFF'},
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        const code = error?.code;
        if (code === 'UNAUTHORIZED' || code === 'TOKEN_EXPIRED') {
          return false;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

setBookingChatQueryClient(queryClient);

function AppContent() {
  const {isLoading, userToken} = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const navigationRef = useRef<any>(null);
  const listenersCleanupRef = useRef<(() => void) | null>(null);
  const [banner, setBanner] = useState({
    visible: false,
    title: '',
    body: '',
    data: null as any,
  });

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
    notificationService.requestPermission().catch((error: any) => {
      console.log('Notification permission request failed:', error);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = notificationService.setForegroundBannerHandler(
      payload => {
        const data = payload?.data || {};
        if (isSupportMessagePush(data)) {
          queryClient.setQueryData(queryKeys.supportChat.unread(), (current: any) => {
            const previous = Number(current?.data?.unread_count || 0);
            return {
              success: true,
              ...(current || {}),
              data: {
                ...(current?.data || {}),
                unread_count: previous + 1,
              },
            };
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.supportChat.unread(),
          });
        } else if (isBookingChatPush(data)) {
          const chatBookingId = data.booking_id || data.bookingId;
          // With the socket up, chat:message already bumped the badge.
          if (chatBookingId && !isChatSocketConnected()) {
            incrementBookingChatUnread(chatBookingId, null);
          }
        } else {
          queryClient.invalidateQueries({queryKey: queryKeys.inbox.all});
          queryClient.invalidateQueries({queryKey: queryKeys.bookings.all});
          if (
            showBookingAlertFromPush(data, {
              title: payload?.title,
              body: payload?.body,
            })
          ) {
            return;
          }
        }
        setBanner({
          visible: true,
          title: payload?.title || 'Notification',
          body: payload?.body || '',
          data: payload?.data || null,
        });
      },
    );
    return unsubscribe;
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
    <>
      <NavigationContainer
        ref={navigationRef}
        theme={navTheme}
        onReady={setupNotificationListeners}>
        <AppNavigator />
      </NavigationContainer>
      <NotificationBanner
        visible={banner.visible}
        title={banner.title}
        body={banner.body}
        onHide={() => setBanner(prev => ({...prev, visible: false}))}
        onPress={() => {
          const nav = navigationRef.current;
          if (nav) {
            handleNotificationClick(
              parseNotificationData(banner.data),
              nav,
            );
          }
        }}
      />
      {userToken ? <BookingAlertHost navigationRef={navigationRef} /> : null}
      {userToken ? <BookingChatHost /> : null}
    </>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ModalProvider>
            <AppContent />
          </ModalProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
