export const PLAN_LEVELS = { lite: 1, pro: 2, ultra: 3 };

export const getChangedFeatures = (fromPlan, toPlan) => {
  if (fromPlan === 'lite' && toPlan === 'pro') {
    return [
      { key: 'storage', text: '1GB Bulut Depolama' },
      { key: 'sharing', text: 'Sınırsız Paylaşım & Ortaklık' },
      { key: 'encryption', text: 'Sınırsız Not Şifreleme' },
      { key: 'deviceMgmt', text: 'Aktif Cihaz Yönetimi' },
      { key: 'avatar', text: 'Galeri Profil Fotoğrafı' },
      { key: 'noAds', text: 'Reklamsız Deneyim' }
    ];
  }
  if (fromPlan === 'lite' && toPlan === 'ultra') {
    return [
      { key: 'storage', text: '5GB Bulut Depolama' },
      { key: 'devices', text: 'Sınırsız Cihaz Desteği' },
      { key: 'sharing', text: 'Sınırsız Paylaşım & Ortaklık' },
      { key: 'encryption', text: 'Sınırsız Not Şifreleme' },
      { key: 'deviceMgmt', text: 'Aktif Cihaz Yönetimi' },
      { key: 'avatar', text: 'Galeri Profil Fotoğrafı' },
      { key: 'noAds', text: 'Reklamsız Deneyim' },
      { key: 'pdfExport', text: 'PDF Olarak Kaydet / Paylaş' }
    ];
  }
  if (fromPlan === 'pro' && toPlan === 'ultra') {
    return [
      { key: 'storage', text: '5GB Bulut Depolama' },
      { key: 'devices', text: 'Sınırsız Cihaz Desteği' },
      { key: 'pdfExport', text: 'PDF Olarak Kaydet / Paylaş' }
    ];
  }
  return [];
};

export const getLostFeatures = (fromPlan, toPlan) => {
  if (fromPlan === 'ultra' && toPlan === 'pro') {
    return [
      { key: 'storage', text: '5GB Bulut Depolama Limiti' },
      { key: 'devices', text: 'Sınırsız Cihaz Desteği' },
      { key: 'pdfExport', text: 'PDF Olarak Kaydet / Paylaş' }
    ];
  }
  if (fromPlan === 'ultra' && toPlan === 'lite') {
    return [
      { key: 'storage', text: '5GB Bulut Depolama Limiti' },
      { key: 'devices', text: 'Sınırsız Cihaz Desteği' },
      { key: 'sharing', text: 'Sınırsız Paylaşım & Ortaklık' },
      { key: 'encryption', text: 'Sınırsız Not Şifreleme' },
      { key: 'deviceMgmt', text: 'Aktif Cihaz Yönetimi' },
      { key: 'avatar', text: 'Galeri Profil Fotoğrafı' },
      { key: 'noAds', text: 'Reklamsız Deneyim' },
      { key: 'pdfExport', text: 'PDF Olarak Kaydet / Paylaş' }
    ];
  }
  if (fromPlan === 'pro' && toPlan === 'lite') {
    return [
      { key: 'storage', text: '1GB Bulut Depolama Limiti' },
      { key: 'sharing', text: 'Sınırsız Paylaşım & Ortaklık' },
      { key: 'encryption', text: 'Sınırsız Not Şifreleme' },
      { key: 'deviceMgmt', text: 'Aktif Cihaz Yönetimi' },
      { key: 'avatar', text: 'Galeri Profil Fotoğrafı' },
      { key: 'noAds', text: 'Reklamsız Deneyim' }
    ];
  }
  return [];
};
