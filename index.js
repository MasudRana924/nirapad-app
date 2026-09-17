/**
 * @format
 */

import {AppRegistry, NativeModules} from 'react-native';
import {getMessaging, setBackgroundMessageHandler} from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';

setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  console.log('📩 Background message received:', remoteMessage);

  // If FCM already included a notification payload, Android/iOS show it
  // in the system tray. Data-only pushes must be displayed here.
  if (remoteMessage?.notification?.title || remoteMessage?.notification?.body) {
    return;
  }

  const data = remoteMessage?.data || {};
  const title = data.title || data.notification_title || 'Nirapod';
  const body = data.body || data.notification_body || data.message || '';

  try {
    await NativeModules.LocalNotification?.show(title, body, data);
  } catch (error) {
    console.log('Failed to display background notification:', error);
  }
});

AppRegistry.registerComponent(appName, () => App);
