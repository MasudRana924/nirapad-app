package com.nirapod

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import java.util.Collections

object NotificationHelper {
  const val CHANNEL_ID = "nirapod_default"
  const val CHANNEL_NAME = "Nirapod Notifications"
  private val shownMessageIds = Collections.synchronizedSet(mutableSetOf<String>())

  fun createChannel(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val existing = manager.getNotificationChannel(CHANNEL_ID)
    if (existing != null) {
      return
    }
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
    }
    manager.createNotificationChannel(channel)
  }

  fun show(context: Context, title: String, body: String, extras: Map<String, String>) {
    createChannel(context)

    val messageId =
      extras["google.message_id"]
        ?: extras["message_id"]
        ?: extras["messageId"]
    if (!messageId.isNullOrBlank() && !shownMessageIds.add(messageId)) {
      return
    }

    val intent = Intent(context, MainActivity::class.java).apply {
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or
        Intent.FLAG_ACTIVITY_CLEAR_TOP or
        Intent.FLAG_ACTIVITY_SINGLE_TOP
      extras.forEach { (key, value) -> putExtra(key, value) }
    }

    val pendingIntent = PendingIntent.getActivity(
      context,
      (System.currentTimeMillis() % Int.MAX_VALUE).toInt(),
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    val notification = NotificationCompat.Builder(context, CHANNEL_ID)
      .setSmallIcon(R.drawable.ic_stat_notification)
      .setContentTitle(title.ifBlank { "Nirapod" })
      .setContentText(body)
      .setStyle(NotificationCompat.BigTextStyle().bigText(body))
      .setAutoCancel(true)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setDefaults(NotificationCompat.DEFAULT_ALL)
      .setContentIntent(pendingIntent)
      .build()

    try {
      val id = (System.currentTimeMillis() % Int.MAX_VALUE).toInt()
      NotificationManagerCompat.from(context).notify(id, notification)
    } catch (_: SecurityException) {
      // POST_NOTIFICATIONS not granted
    }
  }
}

  fun createChannel(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val existing = manager.getNotificationChannel(CHANNEL_ID)
    if (existing != null) {
      return
    }
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
    }
    manager.createNotificationChannel(channel)
  }

  fun show(context: Context, title: String, body: String, extras: Map<String, String>) {
    createChannel(context)

    val intent = Intent(context, MainActivity::class.java).apply {
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or
        Intent.FLAG_ACTIVITY_CLEAR_TOP or
        Intent.FLAG_ACTIVITY_SINGLE_TOP
      extras.forEach { (key, value) -> putExtra(key, value) }
    }

    val pendingIntent = PendingIntent.getActivity(
      context,
      (System.currentTimeMillis() % Int.MAX_VALUE).toInt(),
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    val notification = NotificationCompat.Builder(context, CHANNEL_ID)
      .setSmallIcon(R.drawable.ic_stat_notification)
      .setContentTitle(title.ifBlank { "Nirapod" })
      .setContentText(body)
      .setStyle(NotificationCompat.BigTextStyle().bigText(body))
      .setAutoCancel(true)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setDefaults(NotificationCompat.DEFAULT_ALL)
      .setContentIntent(pendingIntent)
      .build()

    try {
      val id = (System.currentTimeMillis() % Int.MAX_VALUE).toInt()
      NotificationManagerCompat.from(context).notify(id, notification)
    } catch (_: SecurityException) {
      // POST_NOTIFICATIONS not granted
    }
  }
}
