# ─── 1. Stack Trace Symbolication for Google Play Vitals ──────────────────────
-keepattributes SourceFile,LineNumberTable,Signature,InnerClasses,EnclosingMethod,*Annotation*
-renamesourcefileattribute SourceFile

# ─── 2. Preserve Capacitor Core & JS Interface ─────────────────────────────────
-keep class com.getcapacitor.** { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ─── 3. Preserve RevenueCat SDK ───────────────────────────────────────────────
-keep class com.revenuecat.purchases.** { *; }
-keep class com.revenuecat.purchases.hybridcommon.** { *; }

# ─── 4. Preserve App Native Package & Services ─────────────────────────────────
-keep class com.notes.hub.** { *; }
-keep class com.noteup.notes.** { *; }

# ─── 5. Advanced R8 Repackaging & Access Modification Engine ────────────────────
-repackageclasses ''
-allowaccessmodification
-overloadaggressively

# ─── 6. Remove Log Output in Release Builds for Max Speed ──────────────────────
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}
