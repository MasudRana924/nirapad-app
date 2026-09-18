import {
  getMessaging,
  getToken,
  getAPNSToken,
  requestPermission,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  getInitialNotification,
} from '@react-native-firebase/messaging';
import {NativeModules, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import {apiRequest} from './api';
import {requestNotificationPermission} from '../utils/permissions';

const AUTHORIZED = 1;
const PROVISIONAL = 2;

const safeUnsubscribe = unsubscribe => {
  if (typeof unsubscribe === 'function') {
    unsubscribe();
  }
};

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.foregroundBannerHandler = null;
  }

  setForegroundBannerHandler(handler) {
    this.foregroundBannerHandler = handler;
    return () => {
      if (this.foregroundBannerHandler === handler) {
        this.foregroundBannerHandler = null;
      }
    };
  }

  /**
   * Step 1: Request notification permission from user
   */
  async requestPermission() {
    try {
      console.log('🔔 Requesting notification permission...');

      if (Platform.OS === 'ios') {
        const authStatus = await requestPermission(getMessaging());
        const enabled = authStatus === AUTHORIZED || authStatus === PROVISIONAL;

        if (enabled) {
          console.log('✅ iOS notification permission granted');
        } else {
          console.log('❌ iOS notification permission denied');
        }

        return enabled;
      }

      const androidGranted = await requestNotificationPermission();
      if (androidGranted) {
        console.log('✅ Android notification permission granted');
      } else {
        console.log('❌ Android notification permission denied');
      }
      try {
        await NativeModules.LocalNotification?.createChannel();
      } catch (channelError) {
        console.log('⚠️ Notification channel create failed:', channelError);
      }
      return androidGranted;
    } catch (error) {
      console.error('❌ Permission request error:', error);
      return false;
    }
  }

  /**
   * Step 2: Get FCM token from Firebase
   */
  async getFCMToken() {
    try {
      console.log('📱 Getting FCM token...');

      // Check if we have apns token for iOS
      const messagingInstance = getMessaging();

      if (Platform.OS === 'ios') {
        const apnsToken = await getAPNSToken(messagingInstance);
        if (!apnsToken) {
          console.log('❌ No APNS token found for iOS');
          return null;
        }
      }

      const token = await getToken(messagingInstance);

      if (token) {
        console.log('✅ FCM Token obtained:', token.substring(0, 20) + '...');
        await AsyncStorage.setItem('fcmToken', token);
        return token;
      } else {
        console.log('❌ No FCM token available');
        return null;
      }
    } catch (error) {
      console.error('❌ FCM Token error:', error);
      return null;
    }
  }

  /**
   * Step 3: Get or create unique device ID
   */
  async getOrCreateDeviceId() {
    try {
      let deviceId = await AsyncStorage.getItem('deviceId');

      if (!deviceId) {
        // Generate unique device ID
        deviceId = await DeviceInfo.getUniqueId();
        await AsyncStorage.setItem('deviceId', deviceId);
        console.log('✅ New device ID created:', deviceId);
      } else {
        console.log('✅ Existing device ID:', deviceId);
      }

      return deviceId;
    } catch (error) {
      console.error('❌ Device ID error:', error);
      // Fallback to timestamp-based ID
      const fallbackId =
        'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      await AsyncStorage.setItem('deviceId', fallbackId);
      return fallbackId;
    }
  }

  /**
   * Step 4: Register FCM token with server
   */
  async registerTokenWithServer(authToken) {
    try {
      console.log('📤 Registering token with server...');

      const token = await this.getFCMToken();
      if (!token) {
        console.log('❌ No FCM token available to register');
        return false;
      }

      const deviceId = await this.getOrCreateDeviceId();

      const response = await apiRequest(
        '/notifications/tokens',
        'POST',
        {
          token: token,
          device_id: deviceId,
          platform: Platform.OS, // 'android' or 'ios'
        },
        false,
      );

      const tokenId = response?.data?.id;
      await AsyncStorage.setItem('tokenRegistered', 'true');
      if (tokenId) {
        await AsyncStorage.setItem('fcmTokenId', tokenId);
      }
      console.log('✅ Token registered successfully with server');
      return true;
    } catch (error) {
      console.error('❌ Token registration error:', error);
      return false;
    }
  }

  /**
   * Step 5: Complete initialization flow
   */
  async initialize(authToken) {
    try {
      if (this.isInitialized) {
        console.log('⚠️ Notification service already initialized');
        return true;
      }

      console.log('🚀 Initializing notification service...');

      // Step 1: Request permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('❌ Notification permission not granted');
        return false;
      }

      // Step 2: Get FCM token
      const token = await this.getFCMToken();
      if (!token) {
        console.log('❌ Failed to get FCM token');
        return false;
      }

      // Step 3: Register with server (if auth token provided)
      if (authToken) {
        const registered = await this.registerTokenWithServer(authToken);
        if (!registered) {
          console.log(
            '⚠️ Token registration with server failed, but service is functional',
          );
        }
      }

      this.isInitialized = true;
      console.log('✅ Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Notification service initialization error:', error);
      return false;
    }
  }

  /**
   * Step 6: Setup message handlers for notifications
   */
  setupMessageHandlers(navigation) {
    try {
      const messagingInstance = getMessaging();

      const unsubscribeForeground = onMessage(
        messagingInstance,
        async remoteMessage => {
          console.log('📱 Foreground message received:', remoteMessage);
          this.handleNotification(remoteMessage, navigation);
        },
      );

      const unsubscribeOpened = onNotificationOpenedApp(
        messagingInstance,
        remoteMessage => {
          console.log('📱 Notification opened app:', remoteMessage);
          this.navigateToScreen(remoteMessage?.data || {}, navigation);
        },
      );

      getInitialNotification(messagingInstance)
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log('📱 Initial notification (app killed):', remoteMessage);
            this.navigateToScreen(remoteMessage?.data || {}, navigation);
          }
        })
        .catch(error => {
          console.log('⚠️ Initial notification check failed:', error);
        });

      const unsubscribeTokenRefresh = onTokenRefresh(
        messagingInstance,
        token => {
          console.log('🔄 Token refreshed:', token.substring(0, 20) + '...');
          this.handleTokenRefresh(token);
        },
      );

      return () => {
        safeUnsubscribe(unsubscribeForeground);
        safeUnsubscribe(unsubscribeOpened);
        safeUnsubscribe(unsubscribeTokenRefresh);
      };
    } catch (error) {
      console.error('❌ Failed to setup message handlers:', error);
      return () => {};
    }
  }

  /**
   * Step 7: Handle incoming notifications
   */
  handleNotification(remoteMessage, navigation) {
    const notification = remoteMessage.notification || {};
    const data = remoteMessage.data || {};
    const title = notification.title;
    const body = notification.body;
    const type = data.type;
    const id = data.booking_id || data.bookingId;
    const payload = {
      ...data,
      type,
      booking_id: id,
    };

    console.log('🔔 Notification:', {title, body, type, id, data: payload});

    if (typeof this.foregroundBannerHandler === 'function') {
      this.foregroundBannerHandler({
        title: title || 'Notification',
        body: body || '',
        data: payload,
        navigation,
      });
      return;
    }

    if (navigation) {
      this.navigateToScreen(payload, navigation);
    }
  }

  /**
   * Step 8: Navigate to appropriate screen based on notification
   */
  navigateToScreen(data, navigation) {
    if (!data) {
      console.log('⚠️ No navigation data in notification');
      navigation.navigate('Inbox');
      return;
    }

    console.log('🧭 Navigating to screen with data:', data);

    const bookingId = data.booking_id || data.bookingId;
    const inboxId = data.inbox_id || data.inboxId;
    const type = data.type || data.action;
    const openBooking =
      type === 'SERVICE_STARTED' ||
      type === 'SERVICE_COMPLETED' ||
      type === 'BOOKING_ACCEPTED' ||
      type === 'BOOKING_REASSIGNED' ||
      type === 'BOOKING_REJECTED' ||
      type === 'BOOKING_CANCELLED' ||
      type === 'DISPUTE_UPDATED' ||
      type === 'OPEN_BOOKING' ||
      data.action === 'OPEN_BOOKING' ||
      data.screen === 'booking_details' ||
      data.show_review === true ||
      data.show_review === 'true';

    if (openBooking) {
      if (bookingId) {
        navigation.navigate('BookingDetails', {
          bookingId,
          inboxId,
          notificationOpenedAt: Date.now(),
        });
      } else {
        navigation.navigate('Inbox', {inboxId});
      }
      return;
    }

    if (data.showPaymentButton === 'true') {
      navigation.navigate('PaymentScreen', {
        bookingId,
        amount: data.amount,
        bookingNumber: data.booking_number || data.bookingNumber,
      });
      return;
    }

    if (data.showReviewButton === 'true') {
      navigation.navigate('ReviewScreen', {bookingId});
      return;
    }

    if (data.screen === 'inbox' && !bookingId) {
      navigation.navigate('Inbox', {inboxId});
      return;
    }

    switch (type) {
      case 'BOOKING_CREATED':
      case 'BOOKING_ACCEPTED':
      case 'BOOKING_REASSIGNED':
      case 'BOOKING_CANCELLED':
      case 'BOOKING_REJECTED':
      case 'SERVICE_STARTED':
      case 'SERVICE_COMPLETED':
      case 'DISPUTE_UPDATED':
      case 'PATIENT_PICKED_UP':
        if (bookingId) {
          navigation.navigate('BookingDetails', {
            bookingId,
            inboxId,
            notificationOpenedAt: Date.now(),
          });
        } else {
          navigation.navigate('Inbox', {inboxId});
        }
        break;

      case 'PAYMENT_SUCCESS':
        navigation.navigate('PaymentHistory');
        break;

      case 'NEW_REVIEW':
        navigation.navigate('Reviews');
        break;

      default:
        if (bookingId) {
          navigation.navigate('BookingDetails', {
            bookingId,
            inboxId,
            notificationOpenedAt: Date.now(),
          });
        } else {
          navigation.navigate('Inbox', {inboxId});
        }
    }
  }

  /**
   * Step 9: Handle token refresh
   */
  async handleTokenRefresh(newToken) {
    try {
      console.log('🔄 Handling token refresh...');

      // Update local storage
      await AsyncStorage.setItem('fcmToken', newToken);

      // Get auth token
      const authToken = await AsyncStorage.getItem('userToken');

      if (authToken) {
        // Register new token with server
        await this.registerTokenWithServer(authToken);
      }
    } catch (error) {
      console.error('❌ Token refresh handling error:', error);
    }
  }

  /**
   * Step 10: Logout - remove this device's FCM token
   */
  async handleLogout(authToken) {
    try {
      console.log('🚪 Handling logout - deactivating tokens...');

      if (authToken) {
        try {
          const tokenId = await AsyncStorage.getItem('fcmTokenId');
          if (tokenId) {
            await apiRequest(`/notifications/tokens/${tokenId}`, 'DELETE');
          } else {
            const list = await apiRequest('/notifications/tokens', 'GET');
            const tokens = Array.isArray(list?.data) ? list.data : [];
            for (const item of tokens) {
              if (item?.id) {
                await apiRequest(`/notifications/tokens/${item.id}`, 'DELETE');
              }
            }
          }
          console.log('✅ Notification tokens removed on server');
        } catch (error) {
          console.log('⚠️ Token deletion on server failed:', error);
        }
      }

      await Promise.all([
        AsyncStorage.removeItem('fcmToken'),
        AsyncStorage.removeItem('tokenRegistered'),
        AsyncStorage.removeItem('deviceId'),
        AsyncStorage.removeItem('fcmTokenId'),
      ]);

      this.isInitialized = false;
      console.log('✅ Logout handled successfully');
    } catch (error) {
      console.error('❌ Logout token handling error:', error);
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
export default new NotificationService();
