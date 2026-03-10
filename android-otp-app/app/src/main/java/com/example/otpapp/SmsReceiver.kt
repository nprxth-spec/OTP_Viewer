package com.example.otpapp

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.telephony.SmsMessage
import android.util.Log
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.util.regex.Pattern

class SmsReceiver : BroadcastReceiver() {

    private val client = OkHttpClient()

    private fun getServerUrl(context: Context): String {
        val prefs = context.getSharedPreferences(MainActivity.PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(MainActivity.KEY_SERVER_URL, null)?.trim()
            ?: MainActivity.DEFAULT_SERVER_URL
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != "android.provider.Telephony.SMS_RECEIVED") return

        val bundle: Bundle? = intent.extras
        var msgBody = ""

        try {
            if (bundle != null) {
                val pdus = bundle["pdus"] as Array<*>
                val msgs = arrayOfNulls<SmsMessage>(pdus.size)
                for (i in pdus.indices) {
                    msgs[i] = SmsMessage.createFromPdu(pdus[i] as ByteArray)
                    msgBody += msgs[i]?.messageBody
                }

                val otp = extractOtpFromMessage(msgBody)
                if (otp != null) {
                    Log.d("SmsReceiver", "OTP detected: $otp")
                    sendOtpToServer(context, otp, msgBody)
                } else {
                    Log.d("SmsReceiver", "No OTP pattern in message: $msgBody")
                }
            }
        } catch (e: Exception) {
            Log.e("SmsReceiver", "Error: ${e.message}", e)
        }
    }

    private fun extractOtpFromMessage(message: String): String? {
        // 1. รูปแบบที่มี Prefix ชัดเจน (เช่น G-123456, OTP-9876)
        val prefixPattern = Pattern.compile("(?i)\\b[a-z]{1,4}-\\d{4,8}\\b")
        val prefixMatcher = prefixPattern.matcher(message)
        if (prefixMatcher.find()) {
            return prefixMatcher.group(0)
        }

        // 2. ค้นหาจากคำสำคัญ (Keyword) เช่น OTP, รหัส, code
        // รองรับคำคั่นกลางเช่น "คือ", " is ", ": "
        val keywordPattern = Pattern.compile("(?i)(?:otp|รหัส|code|pin|ref|อ้างอิง)(?:.*?(?:คือ|is|:))?\\s*([a-z0-9]{4,10})\\b")
        val keywordMatcher = keywordPattern.matcher(message)
        val ignoreWords = listOf("your", "this", "from", "with", "that", "here", "please", "share", "number", "which")
        
        while (keywordMatcher.find()) {
            val match = keywordMatcher.group(1)
            if (match != null && !ignoreWords.contains(match.lowercase())) {
                return match
            }
        }

        // 3. รูปแบบทั่วไป (ถ้าไม่มีคำสำคัญ):
        // จับเฉพาะ ตัวอักษรผสมตัวเลข (เช่น A1B2C3) หรือ ตัวเลขล้วน 4-8 หลัก
        val generalPattern = Pattern.compile("\\b((?=.*\\d)(?=.*[a-zA-Z])[a-zA-Z0-9]{4,10}|\\d{4,8})\\b")
        val generalMatcher = generalPattern.matcher(message)
        if (generalMatcher.find()) {
            return generalMatcher.group(1)
        }

        return null
    }

    private fun getDeviceId(context: Context): String {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID) ?: "unknown"
            } else {
                @Suppress("DEPRECATION")
                Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID) ?: "unknown"
            }
        } catch (e: Exception) {
            "unknown"
        }
    }

    private fun getDeviceName(context: Context): String {
        val prefs = context.getSharedPreferences(MainActivity.PREFS_NAME, Context.MODE_PRIVATE)
        val name = prefs.getString(MainActivity.KEY_DEVICE_NAME, null)?.trim()
        return if (!name.isNullOrEmpty()) name else "เครื่อง ${getDeviceId(context).take(8)}"
    }

    private fun sendOtpToServer(context: Context, otp: String, fullMessage: String) {
        val deviceId = getDeviceId(context)
        val deviceName = getDeviceName(context)

        val json = JSONObject()
            .put("otp", otp)
            .put("message", fullMessage)
            .put("deviceId", deviceId)
            .put("deviceName", deviceName)
            .toString()

        val mediaType = "application/json; charset=utf-8".toMediaType()
        val body = json.toRequestBody(mediaType)

        val request = Request.Builder()
            .url(getServerUrl(context))
            .post(body)
            .build()

        client.newCall(request).enqueue(object : okhttp3.Callback {
            override fun onFailure(call: okhttp3.Call, e: IOException) {
                Log.e("SmsReceiver", "Failed to send OTP: ${e.message}", e)
            }

            override fun onResponse(call: okhttp3.Call, response: okhttp3.Response) {
                response.close()
                Log.d("SmsReceiver", "OTP sent, status=${response.code}")
            }
        })
    }
}
