export const PLANS = {
  lite: {
    id: "lite",
    name: "NoteUp Lite",
    badge: null,
    badgeColor: null,
    priceLabel: "Ücretsiz",
    color: "#6B7280",
    borderGlow: "rgba(107,114,128,0.4)",
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    features: [
      { key: "storage", text: "50MB Bulut Depolama", included: true },
      { key: "devices", text: "1 Cihaz Desteği", included: true },
      { key: "sharing", text: "Max 5 Paylaşımlı Not (Nota Max 1 Davet)", included: true },
      { key: "encryption", text: "Max 5 Not Şifreleme", included: true },
      { key: "deviceMgmt", text: "Aktif Cihaz Yönetimi", included: false },
      { key: "noAds", text: "Reklamsız Deneyim", included: false },
      {key: "avatar", text: "Galeri Profil Fotoğrafı", included: false },
      { key: "pdfExport", text: "PDF Olarak İndir & Paylaş", included: false },
      { key: "ultraShare", text: "1 Arkadaşına Ultra Plan Hediye Et", included: false },
    ],
  },
  pro: {
    id: "pro",
    name: "NoteUp Pro",
    badge: "EN POPÜLER",
    badgeColor: "#3B82F6",
    color: "#3B82F6",
    borderGlow: "rgba(59,130,246,0.6)",
    gradient: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
    features: [
      { key: "storage", text: "1GB Bulut Depolama", included: true },
      { key: "devices", text: "3 Cihaz Desteği", included: true },
      { key: "sharing", text: "Sınırsız Paylaşımlı Not (Nota Max 8 Davet)", included: true },
      { key: "encryption", text: "Sınırsız Not Şifreleme", included: true },
      { key: "deviceMgmt", text: "Aktif Cihaz Yönetimi", included: true },
      { key: "noAds", text: "Reklamsız Deneyim", included: true },
      { key: "avatar", text: "Galeri Profil Fotoğrafı", included: true },
      { key: "pdfExport", text: "PDF Olarak İndir & Paylaş", included: false },
      { key: "ultraShare", text: "1 Arkadaşına Ultra Plan Hediye Et", included: false },
    ],
  },
  ultra: {
    id: "ultra",
    name: "NoteUp Ultra",
    badge: "👑 ULTRA",
    badgeColor: "#F59E0B",
    color: "#F59E0B",
    borderGlow: "rgba(245,158,11,0.6)",
    gradient: "linear-gradient(135deg, #1a1200 0%, #2d1f00 100%)",
    features: [
      { key: "storage", text: "5GB Bulut Depolama", included: true },
      { key: "devices", text: "Sınırsız Cihaz Desteği", included: true },
      { key: "sharing", text: "Sınırsız Paylaşımlı Not (Nota Max 20 Davet)", included: true },
      { key: "encryption", text: "Sınırsız Not Şifreleme", included: true },
      { key: "deviceMgmt", text: "Aktif Cihaz Yönetimi", included: true },
      { key: "noAds", text: "Reklamsız Deneyim", included: true },
      { key: "avatar", text: "Galeri Profil Fotoğrafı", included: true },
      { key: "pdfExport", text: "PDF Olarak İndir & Paylaş", included: true },
      { key: "ultraShare", text: "1 Arkadaşına Ultra Plan Hediye Et", included: true },
    ],
  },
};

export const PLAN_LEVELS = { lite: 1, pro: 2, ultra: 3 };

// [EARLY ACCESS] Tüm planlar Ultra limitleriyle çalışır — abonelik sistemi geçici olarak pasif
export const PLAN_LIMITS = {
  lite: { maxDevices: Infinity, maxStorageMb: 5120, maxSharedNotes: Infinity, maxEncryptedNotes: Infinity },
  pro: { maxDevices: Infinity, maxStorageMb: 5120, maxSharedNotes: Infinity, maxEncryptedNotes: Infinity },
  ultra: { maxDevices: Infinity, maxStorageMb: 5120, maxSharedNotes: Infinity, maxEncryptedNotes: Infinity },
};
// [EARLY ACCESS ORIGINAL]
// lite: { maxDevices: 1, maxStorageMb: 50, maxSharedNotes: 5, maxEncryptedNotes: 5 },
// pro: { maxDevices: 3, maxStorageMb: 1024, maxSharedNotes: Infinity, maxEncryptedNotes: Infinity },
