package com.nirapod

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.RemoteMessage
import java.util.Collections

object NotificationHelper {
  const val CHANNEL_ID = "nirapod_default"
  const val CHANNEL_NAME = "Nirapod Notifications"
  private const val TAG = "NirapodNotify"
  private val shownMessageIds = Collections.synchronizedSet(mutableSetOf<String>())

  fun createChannel(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val channel = NotificationChannel(
      CHANNEL_ID,
      CHANNEL_NAME,
      NotificationManager.IMPORTANCE_HIGH,
    ).apply {
      description = "Booking and service updates"
      enableVibration(true)
      enableLights(true)
      lightColor = Color.parseColor("#008178")
      setShowBadge(true)
      lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
    }
    manager.createNotificationChannel(channel)
  }

  fun showFromRemoteMessage(context: Context, remoteMessage: RemoteMessage) {
    val data = remoteMessage.data.toMutableMap()
    remoteMessage.messageId?.let { data["google.message_id"] = it }

    val title =
      remoteMessage.notification?.title
        ?: data["title"]
        ?: data["notification_title"]
        ?: "Nirapod"
    val body =
      remoteMessage.notification?.body
        ?: data["body"]
        ?: data["notification_body"]
        ?: data["message"]
        ?: ""

    show(context, title, body, data)
  }

  fun showFromIntentExtras(context: Context, extras: Bundle) {
    val data = mutableMapOf<String, String>()
    for (key in extras.keySet()) {
      val value = extras.get(key) ?: continue
      data[key] = value.toString()
    }

    val title =
      extras.getString("gcm.notification.title")
        ?: extras.getString("title")
        ?: extras.getString("notification_title")
        ?: "Nirapod"
    val body =
      extras.getString("gcm.notification.body")
        ?: extras.getString("body")
        ?: extras.getString("notification_body")
        ?: extras.getString("message")
        ?: ""

    show(context, title, body, data)
  }

  fun show(context: Context, title: String, body: String, extras: Map<String, String>) {
    val appContext = context.applicationContext
    createChannel(appContext)

    val messageId =
      extras["google.message_id"]
        ?: extras["message_id"]
        ?: extras["messageId"]
        ?: extras["gcm.message_id"]
    if (!messageId.isNullOrBlank() && !shownMessageIds.add(messageId)) {
      Log.d(TAG, "skip duplicate $messageId")
      return
    }

    Log.d(TAG, "show title=$title body=$body foreground=${AppLifecycleTracker.isForeground}")

    val intent = Intent(appContext, MainActivity::class.java).apply {
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or
        Intent.FLAG_ACTIVITY_CLEAR_TOP or
        Intent.FLAG_ACTIVITY_SINGLE_TOP
      extras.forEach { (key, value) -> putExtra(key, value) }
    }

    val requestCode = (System.currentTimeMillis() % Int.MAX_VALUE).toInt()
    val pendingIntent = PendingIntent.getActivity(
      appContext,
      requestCode,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    val notification = NotificationCompat.Builder(appContext, CHANNEL_ID)
      .setSmallIcon(R.drawable.ic_stat_notification)
      .setContentTitle(title.ifBlank { "Nirapod" })
      .setContentText(body)
      .setStyle(NotificationCompat.BigTextStyle().bigText(body))
      .setAutoCancel(true)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setDefaults(NotificationCompat.DEFAULT_ALL)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setContentIntent(pendingIntent)
      .build()

    val manager = appContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && !manager.areNotificationsEnabled()) {
      Log.e(TAG, "notifications disabled in system settings")
      return
    }

    try {
      manager.notify(requestCode, notification)
    } catch (error: SecurityException) {
      Log.e(TAG, "POST_NOTIFICATIONS not granted", error)
    } catch (error: Exception) {
      Log.e(TAG, "failed to notify", error)
    }
  }
}
