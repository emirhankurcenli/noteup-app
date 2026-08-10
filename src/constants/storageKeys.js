/**
 * STORAGE_KEYS — Merkezi localStorage anahtar sabit deposu
 *
 * Tüm localStorage.getItem / setItem / removeItem çağrıları
 * bu sabitlerle yapılmalıdır.
 *
 * ❌ localStorage.getItem('s23_notes')         ← sihirli string, tehlikeli
 * ✅ localStorage.getItem(STORAGE_KEYS.NOTES)  ← refactor-safe, typo-proof
 */
export const STORAGE_KEYS = {
  // ── Kullanıcı & Oturum ────────────────────────────────────────────────────
  USER: "s23_user",
  USER_PLAN: "s23_user_plan",
  MY_CODE: "s23_my_code",
  PROFILE_NAME: "s23_profile_name",

  // ── İçerik ────────────────────────────────────────────────────────────────
  NOTES: "s23_notes",
  FOLDERS: "s23_folders",
  REMINDERS: "s23_reminders",
  ATTACHMENT_COUNT: "s23_attachment_count",
  SYNC_QUEUE: "s23_sync_queue",

  // ── Sosyal ────────────────────────────────────────────────────────────────
  /** Arkadaş listesi — kullanımda UID ile birleştirilir: FRIENDS_PREFIX + uid */
  FRIENDS_PREFIX: "s23_friends_",
  FRIEND_REQUESTS: "s23_friend_requests",
  SHARE_REQUESTS: "s23_share_requests",

  // ── Uygulama Ayarları ─────────────────────────────────────────────────────
  THEME: "noteup-theme",
  LANG: "app_lang",
};

export default STORAGE_KEYS;
