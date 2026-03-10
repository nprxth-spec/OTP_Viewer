package com.example.otpapp

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.os.LocaleListCompat
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText

class MainActivity : AppCompatActivity() {

    private val prefs by lazy {
        getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
    }

    private val requestPermissionLauncher =
        registerForActivityResult(
            ActivityResultContracts.RequestMultiplePermissions()
        ) {
            updatePermissionUI()
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val savedLang = getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
            .getString(KEY_APP_LANGUAGE, "th") ?: "th"
        androidx.appcompat.app.AppCompatDelegate.setApplicationLocales(
            LocaleListCompat.forLanguageTags(savedLang)
        )
        setContentView(R.layout.activity_main)

        val contentHome = findViewById<View>(R.id.content_home)
        val contentSettings = findViewById<View>(R.id.content_settings)
        val bottomNav = findViewById<BottomNavigationView>(R.id.bottom_nav)

        bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_home -> {
                    contentHome.visibility = View.VISIBLE
                    contentSettings.visibility = View.GONE
                    true
                }
                R.id.nav_settings -> {
                    contentHome.visibility = View.GONE
                    contentSettings.visibility = View.VISIBLE
                    refreshLanguageButtons()
                    true
                }
                else -> false
            }
        }

        val deviceNameInput = findViewById<TextInputEditText>(R.id.deviceNameInput)
        val deviceNameDisplay = findViewById<android.widget.TextView>(R.id.deviceNameDisplay)
        val deviceNameViewSection = findViewById<View>(R.id.deviceNameViewSection)
        val deviceNameEditSection = findViewById<View>(R.id.deviceNameEditSection)
        val btnSave = findViewById<MaterialButton>(R.id.btnSaveDeviceName)
        val btnEdit = findViewById<MaterialButton>(R.id.btnEditDeviceName)

        btnSave.setOnClickListener {
            val name = deviceNameInput.text?.toString()?.trim() ?: ""
            prefs.edit().putString(KEY_DEVICE_NAME, name).apply()
            Toast.makeText(this, R.string.toast_saved, Toast.LENGTH_SHORT).show()
            refreshDeviceNameUI()
        }

        btnEdit.setOnClickListener {
            deviceNameInput.setText(prefs.getString(KEY_DEVICE_NAME, "") ?: "")
            deviceNameViewSection.visibility = View.GONE
            deviceNameEditSection.visibility = View.VISIBLE
        }

        findViewById<MaterialButton>(R.id.btnSettings).setOnClickListener {
            openAppSettings()
        }

        val serverUrlInput = findViewById<TextInputEditText>(R.id.serverUrlInput)
        serverUrlInput.setText(prefs.getString(KEY_SERVER_URL, DEFAULT_SERVER_URL) ?: DEFAULT_SERVER_URL)

        findViewById<MaterialButton>(R.id.btnSaveServerUrl).setOnClickListener {
            val url = serverUrlInput.text?.toString()?.trim() ?: ""
            prefs.edit().putString(KEY_SERVER_URL, url).apply()
            Toast.makeText(this, R.string.toast_saved, Toast.LENGTH_SHORT).show()
        }

        val btnLangThai = findViewById<MaterialButton>(R.id.btnLangThai)
        val btnLangEnglish = findViewById<MaterialButton>(R.id.btnLangEnglish)
        btnLangThai.setOnClickListener { applyLanguageAndRecreate("th") }
        btnLangEnglish.setOnClickListener { applyLanguageAndRecreate("en") }
        refreshLanguageButtons()

        refreshDeviceNameUI()
        askSmsPermissionIfNeeded()
        updatePermissionUI()
    }

    private fun refreshDeviceNameUI() {
        val savedName = prefs.getString(KEY_DEVICE_NAME, null)?.trim()
        val deviceNameDisplay = findViewById<android.widget.TextView>(R.id.deviceNameDisplay)
        val deviceNameViewSection = findViewById<View>(R.id.deviceNameViewSection)
        val deviceNameEditSection = findViewById<View>(R.id.deviceNameEditSection)
        val deviceNameInput = findViewById<TextInputEditText>(R.id.deviceNameInput)

        if (!savedName.isNullOrEmpty()) {
            deviceNameDisplay.text = savedName
            deviceNameViewSection.visibility = View.VISIBLE
            deviceNameEditSection.visibility = View.GONE
        } else {
            deviceNameViewSection.visibility = View.GONE
            deviceNameEditSection.visibility = View.VISIBLE
            deviceNameInput.setText("")
        }
    }

    override fun onResume() {
        super.onResume()
        updatePermissionUI()
    }

    private fun askSmsPermissionIfNeeded() {
        val perms = arrayOf(
            Manifest.permission.RECEIVE_SMS,
            Manifest.permission.READ_SMS
        )

        val need = perms.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (need.isNotEmpty()) {
            requestPermissionLauncher.launch(need.toTypedArray())
        }
    }

    private fun updatePermissionUI() {
        val hasSms = hasSmsPermission()
        val statusIcon = findViewById<android.widget.ImageView>(R.id.statusIcon)
        val statusText = findViewById<android.widget.TextView>(R.id.statusText)
        val btnSettings = findViewById<MaterialButton>(R.id.btnSettings)
        val readyBadge = findViewById<View>(R.id.readyBadge)

        if (hasSms) {
            statusIcon.setImageResource(R.drawable.ic_check_circle)
            statusText.setText(R.string.permission_granted)
            btnSettings.visibility = View.GONE
            readyBadge.visibility = View.VISIBLE
        } else {
            statusIcon.setImageResource(R.drawable.ic_warning)
            statusText.setText(R.string.permission_denied)
            btnSettings.visibility = View.VISIBLE
            readyBadge.visibility = View.GONE
        }
    }

    private fun hasSmsPermission(): Boolean {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.RECEIVE_SMS) == PackageManager.PERMISSION_GRANTED &&
                ContextCompat.checkSelfPermission(this, Manifest.permission.READ_SMS) == PackageManager.PERMISSION_GRANTED
    }

    private fun openAppSettings() {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
            data = Uri.fromParts("package", packageName, null)
        }
        startActivity(intent)
    }

    private fun applyLanguageAndRecreate(lang: String) {
        prefs.edit().putString(KEY_APP_LANGUAGE, lang).apply()
        androidx.appcompat.app.AppCompatDelegate.setApplicationLocales(
            LocaleListCompat.forLanguageTags(lang)
        )
        recreate()
    }

    private fun refreshLanguageButtons() {
        val lang = prefs.getString(KEY_APP_LANGUAGE, "th") ?: "th"
        val btnLangThai = findViewById<MaterialButton>(R.id.btnLangThai)
        val btnLangEnglish = findViewById<MaterialButton>(R.id.btnLangEnglish)
        val primary = ContextCompat.getColor(this, R.color.purple_500)
        val surfaceVariant = ContextCompat.getColor(this, R.color.surface_variant)
        val textOnPrimary = ContextCompat.getColor(this, R.color.white)
        val textPrimary = ContextCompat.getColor(this, R.color.text_primary)
        if (lang == "th") {
            btnLangThai.setBackgroundColor(primary)
            btnLangThai.setTextColor(textOnPrimary)
            btnLangEnglish.setBackgroundColor(surfaceVariant)
            btnLangEnglish.setTextColor(textPrimary)
        } else {
            btnLangThai.setBackgroundColor(surfaceVariant)
            btnLangThai.setTextColor(textPrimary)
            btnLangEnglish.setBackgroundColor(primary)
            btnLangEnglish.setTextColor(textOnPrimary)
        }
    }

    companion object {
        const val PREFS_NAME = "otp_app"
        const val KEY_DEVICE_NAME = "device_name"
        const val KEY_SERVER_URL = "server_url"
        const val KEY_APP_LANGUAGE = "app_language"
        const val DEFAULT_SERVER_URL = "http://10.0.2.2:3000/api/otp"
    }
}
