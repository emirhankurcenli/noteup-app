package com.notes.hub;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Alarm")
public class AlarmPlugin extends Plugin {

    @PluginMethod
    public void setAlarm(PluginCall call) {
        String idStr = call.getString("id");
        String noteId = call.getString("noteId");
        String title = call.getString("title");
        String timestampStr = call.getString("timestamp");

        if (idStr == null || title == null || timestampStr == null) {
            call.reject("Missing required parameters: id, title, timestamp");
            return;
        }

        long timestamp;
        try {
            timestamp = Long.parseLong(timestampStr);
        } catch (NumberFormatException e) {
            call.reject("Invalid timestamp format: must be a valid millisecond string");
            return;
        }

        int alarmId = Math.abs(idStr.hashCode());

        Context context = getContext();
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        Intent intent = new Intent(context, AlarmReceiver.class);
        intent.putExtra("title", title);
        intent.putExtra("noteId", noteId);
        intent.putExtra("alarmId", alarmId);

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            alarmId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        if (alarmManager != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, timestamp, pendingIntent);
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, timestamp, pendingIntent);
            } else {
                alarmManager.set(AlarmManager.RTC_WAKEUP, timestamp, pendingIntent);
            }
        }

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void cancelAlarm(PluginCall call) {
        String idStr = call.getString("id");
        if (idStr == null) {
            call.reject("Missing parameter: id");
            return;
        }

        int alarmId = Math.abs(idStr.hashCode());
        Context context = getContext();
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        Intent intent = new Intent(context, AlarmReceiver.class);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            alarmId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        if (alarmManager != null) {
            alarmManager.cancel(pendingIntent);
        }

        Intent serviceIntent = new Intent(context, AlarmService.class);
        context.stopService(serviceIntent);

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    // Called from JS banner dismiss — stops the ringing AlarmService immediately
    @PluginMethod
    public void stopAlarm(PluginCall call) {
        String idStr = call.getString("id");
        Context context = getContext();
        if (idStr != null) {
            int alarmId = Math.abs(idStr.hashCode());
            try {
                android.content.SharedPreferences prefs = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE);
                prefs.edit().putBoolean("alarm_dismissed_" + alarmId, true).apply();
            } catch (Exception ignored) {}
        }

        Intent stopIntent = new Intent(context, AlarmService.class);
        stopIntent.setAction("STOP_ALARM");
        // Also pass alarmId to STOP_ALARM intent
        if (idStr != null) {
            stopIntent.putExtra("alarmId", Math.abs(idStr.hashCode()));
        }
        context.startService(stopIntent);

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    // Called from JS banner snooze — triggers the AlarmService snooze action
    @PluginMethod
    public void snoozeAlarm(PluginCall call) {
        String idStr = call.getString("id");
        String noteId = call.getString("noteId");
        String title = call.getString("title");

        int alarmId = idStr != null ? Math.abs(idStr.hashCode()) : 0;
        Context context = getContext();
        Intent snoozeIntent = new Intent(context, AlarmService.class);
        snoozeIntent.setAction("SNOOZE_ALARM");
        snoozeIntent.putExtra("title", title);
        snoozeIntent.putExtra("noteId", noteId);
        snoozeIntent.putExtra("alarmId", alarmId);
        context.startService(snoozeIntent);

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    // Check if an alarm was dismissed on the native side (returns true if dismissed)
    @PluginMethod
    public void isAlarmDismissed(PluginCall call) {
        String idStr = call.getString("id");
        if (idStr == null) {
            call.reject("Missing parameter: id");
            return;
        }
        int alarmId = Math.abs(idStr.hashCode());
        Context context = getContext();
        android.content.SharedPreferences prefs = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE);
        
        boolean dismissed = prefs.getBoolean("alarm_dismissed_" + alarmId, false);
        String snoozedTime = prefs.getString("alarm_snoozed_time_" + alarmId, null);

        JSObject ret = new JSObject();
        ret.put("dismissed", dismissed);
        if (snoozedTime != null) {
            ret.put("snoozed", true);
            ret.put("snoozedTime", snoozedTime);
            // Read and consume: clear snooze preference immediately
            prefs.edit().remove("alarm_snoozed_time_" + alarmId).apply();
        } else {
            ret.put("snoozed", false);
        }
        
        if (dismissed) {
            // Read and consume: clear dismissed preference immediately
            prefs.edit().remove("alarm_dismissed_" + alarmId).apply();
        }

        call.resolve(ret);
    }
}
