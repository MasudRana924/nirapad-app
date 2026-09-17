package com.nirapod

import android.util.Log
import com.google.firebase.messaging.RemoteMessage
import io.invertase.firebase.messaging.ReactNativeFirebaseMessagingService

class NirapodMessagingService : ReactNativeFirebaseMessagingService() {
  override fun onMessageReceived(remoteMessage: RemoteMessage) {
    Log.d(TAG, "native FCM received foreground=${AppLifecycleTracker.isForeground}")
    if (!AppLifecycleTracker.isForeground) {
      NotificationHelper.showFromRemoteMessage(this, remoteMessage)
    }
    super.onMessageReceived(remoteMessage)
  }

  companion object {
    private const val TAG = "NirapodFCM"
  }
}
