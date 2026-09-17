package com.nirapod

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class LocalNotificationModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "LocalNotification"

  @ReactMethod
  fun createChannel(promise: Promise) {
    NotificationHelper.createChannel(reactApplicationContext)
    promise.resolve(true)
  }

  @ReactMethod
  fun show(title: String?, body: String?, data: ReadableMap?, promise: Promise) {
    val extras = mutableMapOf<String, String>()
    data?.toHashMap()?.forEach { (key, value) ->
      extras[key] = value?.toString() ?: ""
    }
    NotificationHelper.show(
      reactApplicationContext,
      title ?: "Nirapod",
      body ?: "",
      extras,
    )
    promise.resolve(true)
  }
}
