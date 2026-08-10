package com.notes.hub;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import androidx.core.app.NotificationCompat;
import android.widget.RemoteViews;

public class AlarmService extends Service {
    private MediaPlayer mediaPlayer;
    private Vibrator vibrator;
    private static final String CHANNEL_ID = "noteup_alarm_insistent_channel";
    private static final int NOTIF_ID = 1001;

    @Override
    public void onCreate() {
        super.onCreate();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager vm = (VibratorManager) getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            vibrator = vm != null ? vm.getDefaultVibrator() : null;
        } else {
            vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent != null ? intent.getAction() : null;

        // Guard: if intent is null (system restart), just stop gracefully
        if (intent == null) {
            stopSelf();
            return START_NOT_STICKY;
        }

        if ("STOP_ALARM".equals(action)) {
            int alarmId = intent.getIntExtra("alarmId", 0);
            try {
                android.content.SharedPreferences prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);
                prefs.edit().putBoolean("alarm_dismissed_" + alarmId, true).apply();
            } catch (Exception ignored) {}
            stopAlarm();
            return START_NOT_STICKY;
        }

        if ("SNOOZE_ALARM".equals(action)) {
            String title  = intent.getStringExtra("title");
            String noteId = intent.getStringExtra("noteId");
            int    alarmId = intent.getIntExtra("alarmId", 0);
            long triggerMs = System.currentTimeMillis() + 5 * 60 * 1000L;
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm", java.util.Locale.US);
            String snoozeTimeStr = sdf.format(new java.util.Date(triggerMs));
            try {
                android.content.SharedPreferences prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);
                prefs.edit()
                     .putString("alarm_snoozed_time_" + alarmId, snoozeTimeStr)
                     .putBoolean("alarm_dismissed_" + alarmId, false)
                     .apply();
            } catch (Exception ignored) {}
            snoozeAlarm(title, noteId, alarmId, triggerMs);
            return START_NOT_STICKY;
        }

        String title   = intent.getStringExtra("title");
        String noteId  = intent.getStringExtra("noteId");
        int    alarmId = intent.getIntExtra("alarmId", 0);

        // Reset dismissed status since a new alarm is starting
        try {
            android.content.SharedPreferences prefs = getSharedPreferences("AppPrefs", MODE_PRIVATE);
            prefs.edit().putBoolean("alarm_dismissed_" + alarmId, false).apply();
        } catch (Exception ignored) {}

        // Start continuous looping alarm audio and vibration
        startAlarmSoundAndVibration();

        createNotificationChannel();

        // --- STOP action (notification button) ---
        Intent stopIntent = new Intent(this, AlarmReceiver.class);
        stopIntent.setAction("STOP_ALARM");
        stopIntent.putExtra("alarmId", alarmId);
        PendingIntent stopPI = PendingIntent.getBroadcast(this, alarmId * 10 + 1,
                stopIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // --- SNOOZE action (notification button) ---
        Intent snoozeIntent = new Intent(this, AlarmReceiver.class);
        snoozeIntent.setAction("SNOOZE_ALARM");
        snoozeIntent.putExtra("title",   title);
        snoozeIntent.putExtra("noteId",  noteId);
        snoozeIntent.putExtra("alarmId", alarmId);
        PendingIntent snoozePI = PendingIntent.getBroadcast(this, alarmId * 10 + 2,
                snoozeIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // --- Open Note intent (notification body / button tap) ---
        Intent openAppIntent = new Intent(this, MainActivity.class);
        if (noteId != null && !noteId.trim().isEmpty() && !noteId.equals("null")) {
            openAppIntent.putExtra("openNoteId", noteId);
        }
        openAppIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent openAppPI = PendingIntent.getActivity(this, alarmId * 10 + 3,
                openAppIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // --- Full Screen Intent for Lockscreen Display ---
        Intent alertIntent = new Intent(this, AlarmAlertActivity.class);
        alertIntent.putExtra("title", title);
        alertIntent.putExtra("noteId", noteId);
        alertIntent.putExtra("alarmId", alarmId);
        alertIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent fullScreenPI = PendingIntent.getActivity(this, alarmId * 10 + 4,
                alertIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // Directly launch full screen alert activity if screen is locked or turned off
        try {
            android.app.KeyguardManager km = (android.app.KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
            android.os.PowerManager pm = (android.os.PowerManager) getSystemService(Context.POWER_SERVICE);
            boolean isLockedOrOff = (km != null && km.isKeyguardLocked()) || (pm != null && !pm.isInteractive());
            if (isLockedOrOff) {
                startActivity(alertIntent);
            }
        } catch (Exception ignored) {}

        int iconResId = getResources().getIdentifier("ic_stat_icon", "drawable", getPackageName());
        if (iconResId == 0) iconResId = android.R.drawable.ic_lock_idle_alarm;

        String noteTitle = (title != null && !title.trim().isEmpty()) ? title : "Not Alarmı";

        RemoteViews collapsedView = new RemoteViews(getPackageName(), R.layout.custom_collapsed_notification);
        collapsedView.setTextViewText(R.id.notification_subtitle, noteTitle);

        RemoteViews expandedView = new RemoteViews(getPackageName(), R.layout.custom_heads_up_notification);
        expandedView.setTextViewText(R.id.notification_subtitle, noteTitle);
        expandedView.setOnClickPendingIntent(R.id.btn_stop, stopPI);
        expandedView.setOnClickPendingIntent(R.id.btn_snooze, snoozePI);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(iconResId)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setFullScreenIntent(fullScreenPI, true)
                .setAutoCancel(true)
                .setOngoing(true)
                .setDeleteIntent(stopPI)
                .setContentIntent(openAppPI)
                .setCustomContentView(collapsedView)
                .setCustomBigContentView(expandedView)
                .setCustomHeadsUpContentView(expandedView);

        Notification notification = builder.build();
        notification.flags |= Notification.FLAG_INSISTENT;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIF_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(NOTIF_ID, notification);
        }

        return START_STICKY;
    }

    private void startAlarmSoundAndVibration() {
        // 1. Play continuous alarm sound using MediaPlayer
        try {
            if (mediaPlayer != null) {
                try {
                    if (mediaPlayer.isPlaying()) mediaPlayer.stop();
                    mediaPlayer.release();
                } catch (Exception ignored) {}
                mediaPlayer = null;
            }

            Uri alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (alarmUri == null) {
                alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
            }
            if (alarmUri == null) {
                alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            }

            mediaPlayer = new MediaPlayer();
            mediaPlayer.setDataSource(this, alarmUri);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                mediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build());
            } else {
                mediaPlayer.setAudioStreamType(AudioManager.STREAM_ALARM);
            }

            mediaPlayer.setLooping(true);
            mediaPlayer.prepare();
            mediaPlayer.start();
        } catch (Exception e) {
            e.printStackTrace();
        }

        // 2. Start continuous vibration
        try {
            if (vibrator != null && vibrator.hasVibrator()) {
                long[] pattern = new long[]{0, 800, 500, 800, 500};
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0));
                } else {
                    vibrator.vibrate(pattern, 0);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // ── Snooze: stop current alarm and reschedule after 5 minutes ───────────────
    private void snoozeAlarm(String title, String noteId, int alarmId, long triggerMs) {
        stopAlarm();

        Intent serviceIntent = new Intent(this, AlarmService.class);
        serviceIntent.putExtra("title",   title);
        serviceIntent.putExtra("noteId",  noteId);
        serviceIntent.putExtra("alarmId", alarmId);

        PendingIntent snoozePI = PendingIntent.getService(this, alarmId,
                serviceIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        AlarmManager am = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
        if (am != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerMs, snoozePI);
            } else {
                am.setExact(AlarmManager.RTC_WAKEUP, triggerMs, snoozePI);
            }
        }
    }

    // ── Fully stop alarm sound + vibration + foreground service ─────────────────
    private void stopAlarm() {
        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) mediaPlayer.stop();
                mediaPlayer.release();
            } catch (Exception ignored) {}
            mediaPlayer = null;
        }

        if (vibrator != null) {
            try { vibrator.cancel(); } catch (Exception ignored) {}
        }

        try {
            NotificationManager mgr = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (mgr != null) {
                mgr.cancel(NOTIF_ID);
            }
        } catch (Exception ignored) {}

        stopForeground(true);
        stopSelf();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel ch = new NotificationChannel(
                    CHANNEL_ID, "Alarm Çalma Servisi", NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("Alarm çaldığında çalışan ses servisi");
            
            Uri defaultUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (defaultUri == null) defaultUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .build();
            ch.setSound(defaultUri, audioAttributes);
            
            ch.enableVibration(true);
            ch.setVibrationPattern(new long[]{0, 800, 500, 800, 500});
            ch.enableLights(true);
            
            NotificationManager mgr = getSystemService(NotificationManager.class);
            if (mgr != null) mgr.createNotificationChannel(ch);
        }
    }

    @Override
    public void onDestroy() {
        stopAlarm();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }
}
