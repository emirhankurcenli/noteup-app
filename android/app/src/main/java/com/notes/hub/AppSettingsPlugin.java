package com.notes.hub;

import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;
import android.util.Base64;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import android.Manifest;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.getcapacitor.PermissionState;
import java.io.File;
import java.io.FileOutputStream;
import android.content.pm.PackageManager;
import androidx.core.content.ContextCompat;
import android.os.Build;


@CapacitorPlugin(
    name = "AppSettings",
    permissions = {
        @Permission(
            alias = "microphone",
            strings = { Manifest.permission.RECORD_AUDIO }
        ),
        @Permission(
            alias = "location",
            strings = { Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION }
        ),
        @Permission(
            alias = "storage",
            strings = { Manifest.permission.READ_EXTERNAL_STORAGE }
        ),
        @Permission(
            alias = "storage_tiramisu",
            strings = { Manifest.permission.READ_MEDIA_IMAGES, Manifest.permission.READ_MEDIA_VIDEO }
        ),
        @Permission(
            alias = "audio_tiramisu",
            strings = { Manifest.permission.READ_MEDIA_AUDIO }
        )
    }
)
public class AppSettingsPlugin extends Plugin {

    @PluginMethod
    public void openSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            Uri uri = Uri.fromParts("package", getContext().getPackageName(), null);
            intent.setData(uri);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Could not open settings", e);
        }
    }

    @PluginMethod
    public void openFile(PluginCall call) {
        String base64Data = call.getString("base64");
        String fileName = call.getString("fileName");

        if (base64Data == null || fileName == null) {
            call.reject("Missing required parameters: base64 or fileName");
            return;
        }

        try {
            String cleanBase64 = base64Data;
            String mimeType = "*/*";
            
            if (base64Data.contains(",")) {
                String[] parts = base64Data.split(",");
                String header = parts[0];
                cleanBase64 = parts[1];
                
                if (header.contains(":") && header.contains(";")) {
                    mimeType = header.substring(header.indexOf(":") + 1, header.indexOf(";"));
                }
            }

            byte[] decodedBytes = Base64.decode(cleanBase64, Base64.DEFAULT);

            // Write decoded bytes to a temp file in the app cache directory
            File cacheDir = getContext().getCacheDir();
            File tempFile = new File(cacheDir, fileName);
            FileOutputStream fos = new FileOutputStream(tempFile);
            fos.write(decodedBytes);
            fos.close();

            // Share URI via FileProvider
            String authority = getContext().getPackageName() + ".fileprovider";
            Uri fileUri = FileProvider.getUriForFile(getContext(), authority, tempFile);

            // Trigger Intent to view the file
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(fileUri, mimeType);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to open file: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void getLaunchNoteId(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("noteId", MainActivity.launchNoteId);
        // Clear it so it doesn't get consumed multiple times
        MainActivity.launchNoteId = null;
        call.resolve(ret);
    }

    @PluginMethod
    public void getPermissionStatus(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("microphone", getPermissionState("microphone").toString().toLowerCase());
        
        // Programmatic check for storage/media
        boolean hasStorage = false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) { // Android 13+
            hasStorage = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_MEDIA_IMAGES) == PackageManager.PERMISSION_GRANTED &&
                         ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_MEDIA_VIDEO) == PackageManager.PERMISSION_GRANTED;
        } else {
            hasStorage = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
        }
        ret.put("storage", hasStorage ? "granted" : "prompt");

        // Programmatic check for audio
        boolean hasAudio = false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            hasAudio = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_MEDIA_AUDIO) == PackageManager.PERMISSION_GRANTED;
        } else {
            hasAudio = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
        }
        ret.put("audio", hasAudio ? "granted" : "prompt");

        // Programmatic check for location (GPS)
        boolean hasLocation = ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
                              ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        ret.put("location", hasLocation ? "granted" : "prompt");

        call.resolve(ret);
    }


    @PluginMethod
    public void requestMicrophonePermission(PluginCall call) {
        if (getPermissionState("microphone") == PermissionState.GRANTED) {
            JSObject ret = new JSObject();
            ret.put("microphone", "granted");
            call.resolve(ret);
        } else {
            requestPermissionForAlias("microphone", call, "permissionCallback");
        }
    }

    @PluginMethod
    public void requestStoragePermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_MEDIA_IMAGES) == PackageManager.PERMISSION_GRANTED &&
                ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_MEDIA_VIDEO) == PackageManager.PERMISSION_GRANTED) {
                JSObject ret = new JSObject();
                ret.put("storage", "granted");
                call.resolve(ret);
            } else {
                requestPermissionForAlias("storage_tiramisu", call, "permissionCallback");
            }
        } else {
            if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED) {
                JSObject ret = new JSObject();
                ret.put("storage", "granted");
                call.resolve(ret);
            } else {
                requestPermissionForAlias("storage", call, "permissionCallback");
            }
        }
    }

    @PluginMethod
    public void requestAudioPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_MEDIA_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                JSObject ret = new JSObject();
                ret.put("audio", "granted");
                call.resolve(ret);
            } else {
                requestPermissionForAlias("audio_tiramisu", call, "permissionCallback");
            }
        } else {
            if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED) {
                JSObject ret = new JSObject();
                ret.put("audio", "granted");
                call.resolve(ret);
            } else {
                requestPermissionForAlias("storage", call, "permissionCallback");
            }
        }
    }

    @PluginMethod
    public void requestLocationPermission(PluginCall call) {
        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(getContext(), Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            JSObject ret = new JSObject();
            ret.put("location", "granted");
            call.resolve(ret);
        } else {
            requestPermissionForAlias("location", call, "permissionCallback");
        }
    }

    @PermissionCallback
    private void permissionCallback(PluginCall call) {
        getPermissionStatus(call);
    }
}
