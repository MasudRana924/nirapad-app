package com.nirapod

import android.app.ActivityManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.google.firebase.messaging.RemoteMessage

class NirapodMessagingReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val extras = intent.extras ?: return
    if (extras.getString("google.message_id") == null) {
      return
    }
    val messageType = extras.getString("message_type")
    if (messageType != null && messageType != "gcm") {
      return
    }

    if (isAppInForeground(context)) {
      return
    }

    val remoteMessage = RemoteMessage(extras)
    val notification = remoteMessage.notification
    val data = remoteMessage.data.toMutableMap()
    remoteMessage.messageId?.let { data["google.message_id"] = it }
    val title =
      notification?.title
        ?: data["title"]
        ?: data["notification_title"]
        ?: "Nirapod"
    val body =
      notification?.body
        ?: data["body"]
        ?: data["notification_body"]
        ?: data["message"]
        ?: ""

    NotificationHelper.show(context.applicationContext, title, body, data)
  }

  private fun isAppInForeground(context: Context): Boolean {
    val activityManager =
      context.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
        ?: return false
    val processes = activityManager.runningAppProcesses ?: return false
    val packageName = context.packageName
    return processes.any { process ->
      process.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND &&
        process.processName == packageName
    }
  }
}
