package com.notes.hub;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    public static String launchNoteId = null;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register custom local Capacitor plugins before calling super.onCreate
        registerPlugin(AlarmPlugin.class);
        registerPlugin(AppSettingsPlugin.class);
        registerPlugin(BiometricPlugin.class);

        super.onCreate(savedInstanceState);

        if (getIntent() != null && getIntent().hasExtra("openNoteId")) {
            launchNoteId = getIntent().getStringExtra("openNoteId");
            // Stop alarm ringing sound immediately when app is launched from notification
            try {
                android.content.Intent stopIntent = new android.content.Intent(this, AlarmService.class);
                stopIntent.setAction("STOP_ALARM");
                startService(stopIntent);
            } catch (Exception ignored) {}
        }

        // Set WebViewClient with onRenderProcessGone and WebChromeClient once here in onCreate
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().setWebViewClient(new com.getcapacitor.BridgeWebViewClient(bridge) {
                @Override
                public boolean onRenderProcessGone(android.webkit.WebView view, android.webkit.RenderProcessGoneDetail detail) {
                    if (view != null) {
                        try { view.destroy(); } catch (Exception ignored) {}
                    }
                    finish();
                    startActivity(getIntent());
                    return true;
                }
            });

            bridge.getWebView().setWebChromeClient(new BridgeWebChromeClient(bridge) {
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    // Grant WebView media permissions directly since we handle native perms on startup
                    request.grant(request.getResources());
                }
            });

            // Prevent white flash during screen transitions
            bridge.getWebView().setBackgroundColor(android.graphics.Color.parseColor("#0F1117"));
        }
    }

    @Override
    protected void onNewIntent(android.content.Intent intent) {
        try {
            super.onNewIntent(intent);
            setIntent(intent);
            if (intent != null && intent.hasExtra("openNoteId")) {
                launchNoteId = intent.getStringExtra("openNoteId");
                // Stop alarm ringing sound immediately when app is brought to front from notification
                try {
                    android.content.Intent stopIntent = new android.content.Intent(this, AlarmService.class);
                    stopIntent.setAction("STOP_ALARM");
                    startService(stopIntent);
                } catch (Exception ignored) {}
            }

            // One-time startup permission request (only on first launch)
            android.content.SharedPreferences prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);
            boolean hasPrompted = prefs.getBoolean("has_prompted_permissions", false);

            if (!hasPrompted && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                List<String> permissionsToRequest = new ArrayList<>();

                if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                        != PackageManager.PERMISSION_GRANTED) {
                    permissionsToRequest.add(Manifest.permission.RECORD_AUDIO);
                }
                if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                        != PackageManager.PERMISSION_GRANTED) {
                    permissionsToRequest.add(Manifest.permission.ACCESS_FINE_LOCATION);
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                            != PackageManager.PERMISSION_GRANTED) {
                        permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS);
                    }
                }

                if (!permissionsToRequest.isEmpty()) {
                    ActivityCompat.requestPermissions(this,
                            permissionsToRequest.toArray(new String[0]), 200);
                }

                prefs.edit().putBoolean("has_prompted_permissions", true).apply();
            }
        } catch (Exception e) {
            // Never let onNewIntent crash the app
            android.util.Log.e("NoteUp", "onNewIntent error: " + e.getMessage());
        }
    }
}
