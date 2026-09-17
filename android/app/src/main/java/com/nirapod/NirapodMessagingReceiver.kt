package com.nirapod

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.google.firebase.messaging.RemoteMessage

class NirapodMessagingReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    try {
      val extras = intent.extras ?: return
      if (extras.getString("google.message_id") == null) {
        return
      }
      val messageType = extras.getString("message_type")
      if (messageType != null && messageType != "gcm") {
        return
      }

      if (AppLifecycleTracker.isForeground) {
        Log.d(TAG, "app in foreground, skip tray")
        return
      }

      val remoteMessage = RemoteMessage(extras)
      NotificationHelper.showFromRemoteMessage(context, remoteMessage)
    } catch (error: Exception) {
      Log.e(TAG, "failed to handle FCM broadcast", error)
    }
  }

  companion object {
    private const val TAG = "NirapodFCM"
  }
}
