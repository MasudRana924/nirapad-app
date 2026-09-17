/**
 * @format
 */

import {AppRegistry, NativeModules} from 'react-native';
import {getMessaging, setBackgroundMessageHandler} from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';

setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  console.log('📩 Background message received:', remoteMessage);

  const notification = remoteMessage?.notification || {};
  const data = remoteMessage?.data || {};
  const title =
    notification.title ||
    data.title ||
    data.notification_title ||
    'Nirapod';
  const body =
    notification.body ||
    data.body ||
    data.notification_body ||
    data.message ||
    '';

  try {
    if (NativeModules.LocalNotification?.show) {
      await NativeModules.LocalNotification.show(title, body, {
        ...data,
        'google.message_id': remoteMessage.messageId || data.messageId || '',
      });
    }
  } catch (error) {
    console.log('Failed to display background notification:', error);
  }
});

AppRegistry.registerComponent(appName, () => App);
