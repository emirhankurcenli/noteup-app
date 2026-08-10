package com.notes.hub;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.TextClock;
import android.app.KeyguardManager;

public class AlarmAlertActivity extends Activity {
    private String alarmTitle;
    private String noteId;
    private int alarmId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Turn screen on, keep it on, show over lockscreen
        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
            WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON
        );

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
            try {
                KeyguardManager km = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
                if (km != null) {
                    km.requestDismissKeyguard(this, null);
                }
            } catch (Exception ignored) {}
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setStatusBarColor(Color.TRANSPARENT);
            getWindow().setNavigationBarColor(Color.TRANSPARENT);
        }

        alarmTitle = getIntent().getStringExtra("title");
        noteId     = getIntent().getStringExtra("noteId");
        alarmId    = getIntent().getIntExtra("alarmId", 0);
        if (alarmTitle == null || alarmTitle.trim().isEmpty()) alarmTitle = "Not Hatırlatıcısı";

        KeyguardManager km = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
        boolean isLocked = (km != null && km.isKeyguardLocked());
        String displayTitle = isLocked ? "🔒 Gizli Hatırlatıcı" : alarmTitle.replace("[noSnooze]", "").trim();

        // ── Root layout with deep dark gradient background ─────────────────────
        LinearLayout layout = new LinearLayout(this);
        layout.setFitsSystemWindows(true);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER_HORIZONTAL);
        
        GradientDrawable bgGradient = new GradientDrawable(
            GradientDrawable.Orientation.TOP_BOTTOM,
            new int[]{Color.parseColor("#090B14"), Color.parseColor("#111625"), Color.parseColor("#090B14")}
        );
        layout.setBackground(bgGradient);
        layout.setPadding(40, 60, 40, 100);

        // Top Spacer
        layout.addView(new View(this), new LinearLayout.LayoutParams(1, 0, 1.0f));

        // ── Digital Clock Section ───────────────────────────────────────────────
        TextClock textClock = new TextClock(this);
        textClock.setFormat12Hour("HH:mm");
        textClock.setFormat24Hour("HH:mm");
        textClock.setTextSize(84);
        textClock.setTextColor(Color.WHITE);
        textClock.setTypeface(Typeface.create("sans-serif-thin", Typeface.BOLD));
        textClock.setGravity(Gravity.CENTER);
        layout.addView(textClock);

        // Date Display
        TextClock dateClock = new TextClock(this);
        dateClock.setFormat12Hour("EEEE, d MMMM");
        dateClock.setFormat24Hour("EEEE, d MMMM");
        dateClock.setTextSize(16);
        dateClock.setTextColor(Color.parseColor("#94A3B8"));
        dateClock.setTypeface(Typeface.create("sans-serif-medium", Typeface.NORMAL));
        dateClock.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams dateParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        dateParams.setMargins(0, 4, 0, 30);
        dateClock.setLayoutParams(dateParams);
        layout.addView(dateClock);

        // ── Glowing Alarm Icon Badge ───────────────────────────────────────────
        LinearLayout iconContainer = new LinearLayout(this);
        iconContainer.setGravity(Gravity.CENTER);
        int badgeSize = 130;
        LinearLayout.LayoutParams iconBgParams = new LinearLayout.LayoutParams(badgeSize, badgeSize);
        iconBgParams.setMargins(0, 10, 0, 40);
        iconContainer.setLayoutParams(iconBgParams);
        
        GradientDrawable iconBg = new GradientDrawable();
        iconBg.setShape(GradientDrawable.OVAL);
        iconBg.setColor(Color.parseColor("#1E2538"));
        iconBg.setStroke(3, Color.parseColor("#3B82F6"));
        iconContainer.setBackground(iconBg);

        TextView alarmIcon = new TextView(this);
        alarmIcon.setText("🔔");
        alarmIcon.setTextSize(32);
        alarmIcon.setGravity(Gravity.CENTER);
        iconContainer.addView(alarmIcon);
        layout.addView(iconContainer);

        // Mid Spacer
        layout.addView(new View(this), new LinearLayout.LayoutParams(1, 0, 0.4f));

        // ── Glassmorphism Info Card ─────────────────────────────────────────────
        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setGravity(Gravity.CENTER);
        card.setPadding(40, 45, 40, 45);
        
        GradientDrawable cardBg = new GradientDrawable();
        cardBg.setColor(Color.parseColor("#151A2B"));
        cardBg.setCornerRadius(28);
        cardBg.setStroke(2, Color.parseColor("#2E3754"));
        card.setBackground(cardBg);
        
        LinearLayout.LayoutParams cardParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        cardParams.setMargins(15, 0, 15, 0);
        card.setLayoutParams(cardParams);

        // Badge pill label: "HATIRLATICI"
        TextView badgePill = new TextView(this);
        badgePill.setText("HATIRLATICI ALARMI");
        badgePill.setTextSize(12);
        badgePill.setTextColor(Color.parseColor("#60A5FA"));
        badgePill.setTypeface(null, Typeface.BOLD);
        badgePill.setGravity(Gravity.CENTER);
        badgePill.setPadding(24, 8, 24, 8);
        
        GradientDrawable pillBg = new GradientDrawable();
        pillBg.setColor(Color.parseColor("#1E293B"));
        pillBg.setCornerRadius(20);
        pillBg.setStroke(1, Color.parseColor("#3B82F6"));
        badgePill.setBackground(pillBg);
        card.addView(badgePill);

        // Note Title
        TextView titleView = new TextView(this);
        titleView.setText(displayTitle);
        titleView.setTextSize(20);
        titleView.setTextColor(Color.WHITE);
        titleView.setTypeface(null, Typeface.BOLD);
        titleView.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams tp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        tp.setMargins(0, 18, 0, 0);
        titleView.setLayoutParams(tp);
        card.addView(titleView);

        if (isLocked) {
            TextView infoView = new TextView(this);
            infoView.setText("İçerik kilit ekranında gizlendi");
            infoView.setTextSize(13);
            infoView.setTextColor(Color.parseColor("#64748B"));
            infoView.setGravity(Gravity.CENTER);
            LinearLayout.LayoutParams ip = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
            ip.setMargins(0, 10, 0, 0);
            infoView.setLayoutParams(ip);
            card.addView(infoView);
        }
        layout.addView(card);

        // Bottom Spacer
        layout.addView(new View(this), new LinearLayout.LayoutParams(1, 0, 0.4f));

        // ── Action Buttons Container ───────────────────────────────────────────
        LinearLayout btnContainer = new LinearLayout(this);
        btnContainer.setOrientation(LinearLayout.VERTICAL);
        btnContainer.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams cp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        cp.setMargins(15, 0, 15, 40);
        btnContainer.setLayoutParams(cp);

        // Row for Snooze + Stop side-by-side
        LinearLayout rowButtons = new LinearLayout(this);
        rowButtons.setOrientation(LinearLayout.HORIZONTAL);
        rowButtons.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams rowParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        rowParams.setMargins(0, 0, 0, 16);
        rowButtons.setLayoutParams(rowParams);

        boolean hideSnooze = (alarmTitle != null && (alarmTitle.contains("[noSnooze]") || alarmTitle.toLowerCase().contains("2 saat kaldı")));

        if (!hideSnooze) {
          // ── ERTELE (Snooze) Button ────────────────────────────────────────────
          Button snoozeBtn = new Button(this);
          snoozeBtn.setText("Ertele (5 dk)");
          snoozeBtn.setTextSize(15);
          snoozeBtn.setTextColor(Color.parseColor("#F59E0B"));
          snoozeBtn.setTypeface(null, Typeface.BOLD);
          snoozeBtn.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_snooze_vector, 0, 0, 0);
          snoozeBtn.setCompoundDrawablePadding(12);
          
          GradientDrawable snoozeBg = new GradientDrawable();
          snoozeBg.setColor(Color.parseColor("#1E2436"));
          snoozeBg.setCornerRadius(40);
          snoozeBg.setStroke(2, Color.parseColor("#D97706"));
          snoozeBtn.setBackground(snoozeBg);
          snoozeBtn.setPadding(30, 32, 30, 32);
          
          LinearLayout.LayoutParams snoozeParams = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
          snoozeParams.setMargins(0, 0, 8, 0);
          snoozeBtn.setLayoutParams(snoozeParams);
          snoozeBtn.setOnClickListener(v -> snoozeAlarm());
          rowButtons.addView(snoozeBtn);
        }

        // ── DURDUR (Dismiss/Stop) Button ─────────────────────────────────────
        Button dismissBtn = new Button(this);
        dismissBtn.setText("Durdur");
        dismissBtn.setTextSize(15);
        dismissBtn.setTextColor(Color.WHITE);
        dismissBtn.setTypeface(null, Typeface.BOLD);
        dismissBtn.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_stop_vector, 0, 0, 0);
        dismissBtn.setCompoundDrawablePadding(12);
        
        GradientDrawable dismissBg = new GradientDrawable(
            GradientDrawable.Orientation.TL_BR,
            new int[]{Color.parseColor("#EF4444"), Color.parseColor("#B91C1C")}
        );
        dismissBg.setCornerRadius(40);
        dismissBtn.setBackground(dismissBg);
        dismissBtn.setPadding(30, 32, 30, 32);
        
        LinearLayout.LayoutParams dismissParams = new LinearLayout.LayoutParams(hideSnooze ? LinearLayout.LayoutParams.MATCH_PARENT : 0, LinearLayout.LayoutParams.WRAP_CONTENT, hideSnooze ? 0f : 1f);
        if (!hideSnooze) dismissParams.setMargins(8, 0, 0, 0);
        dismissBtn.setLayoutParams(dismissParams);
        dismissBtn.setOnClickListener(v -> dismissAlarm());
        rowButtons.addView(dismissBtn);

        btnContainer.addView(rowButtons);

        // ── NOTU AÇ Button (Primary Sapphire Pill) ────────────────────────────
        Button openBtn = new Button(this);
        openBtn.setText(noteId != null && !noteId.trim().isEmpty() && !noteId.equals("null")
                ? "NOTU AÇ" : "UYGULAMAYI AÇ");
        openBtn.setTextSize(16);
        openBtn.setTextColor(Color.WHITE);
        openBtn.setTypeface(null, Typeface.BOLD);
        
        GradientDrawable openBg = new GradientDrawable(
            GradientDrawable.Orientation.TL_BR,
            new int[]{Color.parseColor("#3B82F6"), Color.parseColor("#1D4ED8")}
        );
        openBg.setCornerRadius(40);
        openBtn.setBackground(openBg);
        openBtn.setPadding(36, 32, 36, 32);
        openBtn.setLayoutParams(new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));
        openBtn.setOnClickListener(v -> openNote());
        btnContainer.addView(openBtn);

        layout.addView(btnContainer);
        setContentView(layout);
    }

    // ── Stop alarm + close activity ─────────────────────────────────────────────
    private void dismissAlarm() {
        Intent si = new Intent(this, AlarmService.class);
        si.setAction("STOP_ALARM");
        startService(si);
        finish();
    }

    // ── Snooze: stop sound now, reschedule in 5 minutes ─────────────────────────
    private void snoozeAlarm() {
        Intent si = new Intent(this, AlarmService.class);
        si.setAction("SNOOZE_ALARM");
        si.putExtra("title",   alarmTitle);
        si.putExtra("noteId",  noteId);
        si.putExtra("alarmId", alarmId);
        startService(si);
        finish();
    }

    // ── Open the specific note in the app ────────────────────────────────────────
    private void openNote() {
        Intent si = new Intent(this, AlarmService.class);
        si.setAction("STOP_ALARM");
        startService(si);

        Intent openIntent = new Intent(this, MainActivity.class);
        if (noteId != null && !noteId.trim().isEmpty() && !noteId.equals("null")) {
            openIntent.putExtra("openNoteId", noteId);
        }
        openIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK |
                            Intent.FLAG_ACTIVITY_SINGLE_TOP |
                            Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(openIntent);
        finish();
    }

    @Override
    public void onBackPressed() {
        dismissAlarm();
        super.onBackPressed();
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        switch (keyCode) {
            case KeyEvent.KEYCODE_VOLUME_UP:
            case KeyEvent.KEYCODE_VOLUME_DOWN:
            case KeyEvent.KEYCODE_POWER:
                dismissAlarm();
                return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
