package com.notes.hub;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

public class AlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent != null ? intent.getAction() : null;

        if ("STOP_ALARM".equals(action)) {
            Intent stopIntent = new Intent(context, AlarmService.class);
            stopIntent.setAction("STOP_ALARM");
            context.startService(stopIntent);
            return;
        }

        if ("SNOOZE_ALARM".equals(action)) {
            Intent snoozeIntent = new Intent(context, AlarmService.class);
            snoozeIntent.setAction("SNOOZE_ALARM");
            snoozeIntent.putExtra("title", intent.getStringExtra("title"));
            snoozeIntent.putExtra("noteId", intent.getStringExtra("noteId"));
            snoozeIntent.putExtra("alarmId", intent.getIntExtra("alarmId", 0));
            context.startService(snoozeIntent);
            return;
        }

        String title = intent.getStringExtra("title");
        String noteId = intent.getStringExtra("noteId");
        int alarmId = intent.getIntExtra("alarmId", 0);

        // Start foreground service (handles notifications, music & vibration)
        Intent serviceIntent = new Intent(context, AlarmService.class);
        serviceIntent.putExtra("title", title);
        serviceIntent.putExtra("noteId", noteId);
        serviceIntent.putExtra("alarmId", alarmId);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent);
        } else {
            context.startService(serviceIntent);
        }
    }
}
