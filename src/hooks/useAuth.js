import { useState, useEffect, useRef } from 'react';
import { DEFAULT_AVATARS } from '../constants/avatars';
import { supabase } from '../supabaseClient';
import { syncRevenueCatUser } from '../services/billing';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import useSupabaseSync from './useSupabaseSync';
import useUserProfile from './useUserProfile';
import { useSubscriptionPlanWatcher } from './useSubscriptionPlanWatcher';
import { sanitizeSingleLine } from '../utils/securityUtils';
import { PLAN_LIMITS } from '../constants/paywallPlans';

const isMockMode = false;
const PLAN_LEVELS = { lite: 1, pro: 2, ultra: 3 };

export default function useAuth() {
  // --- CORE DATA CACHE STATES ---
  const [notes, setNotes] = useState([]);
  const [reminders, setReminders] = useState([]);

  // --- AUTH & PROFILE STATES ---
  const [user, setUser] = useState(() => {
    const localUser = localStorage.getItem('s23_user');
    return localUser ? JSON.parse(localUser) : null;
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [myCode, setMyCode] = useState('');
  const [profileName, setProfileName] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // --- BILLING / SUBSCRIPTION PLAN STATES ---
  const [userPlan, setUserPlan] = useState('lite');
  const prevPlanRef = useRef(userPlan);

  // --- SUB-HOOK: DATA SYNC ---
  const sync = useSupabaseSync({
    user,
    setNotes,
    setReminders,
  });

  // Delegate subscription plan changes & 7-day payment grace period monitoring to single-responsibility hook
  const { planNotification, setPlanNotification } = useSubscriptionPlanWatcher(userPlan);

  // --- TOAST NOTIFICATION STATE ---
  const [toast, setToast] = useState(null);

  // --- AUTH STATE CHANGE HANDLER ---
  const handleAuthChange = async (session) => {
    if (session && session.user) {
      const u = session.user;

      // Kullanıcının daha önce seçtiği özel avatarı koru (oturum kapatılsa dahi silinmez)
      let savedPhotoURL = localStorage.getItem(`s23_avatar_${u.id}`);
      if (!savedPhotoURL) {
        try {
          const localData = localStorage.getItem('s23_user');
          if (localData) {
            const parsed = JSON.parse(localData);
            if (parsed?.uid === u.id && parsed?.photoURL) {
              savedPhotoURL = parsed.photoURL;
            }
          }
        } catch (e) {}
      }

      // Eğer yerel depolamada yoksa Supabase 'profiles' tablosundaki kayıtlı avatarı ve planı kontrol et
      let dbPlan = null;
      try {
        const { data: dbProf } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', u.id)
          .maybeSingle();
        if (dbProf) {
          if (dbProf.photo_url && !savedPhotoURL) {
            savedPhotoURL = dbProf.photo_url;
            localStorage.setItem(`s23_avatar_${u.id}`, savedPhotoURL);
          }
          dbPlan = (dbProf.plan || dbProf.user_plan || dbProf.subscription_plan || dbProf.plan_type || dbProf.tier || dbProf.role || '').toLowerCase();
          
          // Profilde özel depolama limiti tanımı varsa
          const userStorageMb = dbProf.storage_limit_mb || dbProf.storage_limit;
          if (userStorageMb && typeof Number(userStorageMb) === 'number' && !isNaN(Number(userStorageMb))) {
            PLAN_STORAGE_LIMITS[dbPlan || 'lite'] = Number(userStorageMb) * 1024 * 1024;
          }
        }
      } catch (e) {
        console.warn("Profiles fetch error:", e);
      }

      // Supabase 'plan_limits' tablosundan tüm planların veri limitlerini canlı çek
      try {
        const { data: limitsData } = await supabase
          .from('plan_limits')
          .select('*');
        if (limitsData && Array.isArray(limitsData) && limitsData.length > 0) {
          limitsData.forEach(row => {
            const pId = (row.plan_id || row.plan_name || row.id || row.name || '').toLowerCase();
            const mb = row.storage_mb || row.max_storage_mb || row.storage_limit_mb || row.storage_limit || row.limit_mb || row.storage;
            if (pId && mb && typeof Number(mb) === 'number' && !isNaN(Number(mb))) {
              PLAN_STORAGE_LIMITS[pId] = Number(mb) * 1024 * 1024;
            }
          });
          localStorage.setItem('s23_remote_plan_limits', JSON.stringify(PLAN_STORAGE_LIMITS));
        }
      } catch (e) {
        console.warn("plan_limits table fetch error:", e);
      }

      let nameCandidate = savedPhotoURL ? (localStorage.getItem('s23_profile_name') || u.user_metadata?.full_name || u.email?.split('@')[0]) : (u.user_metadata?.full_name || u.email?.split('@')[0] || 'Kullanıcı');
      if (nameCandidate && (nameCandidate.includes('privaterelay') || /^[a-z0-9]{8,12}$/i.test(nameCandidate))) {
        nameCandidate = 'Apple Kullanıcısı';
      }

      const photoURL = savedPhotoURL || u.user_metadata?.avatar_url || DEFAULT_AVATARS[0].url;

      const userData = {
        uid: u.id,
        name: nameCandidate,
        email: u.email || '',
        photoURL: photoURL,
        providerId: u.app_metadata?.provider || 'google'
      };
      setUser(userData);
      localStorage.setItem('s23_user', JSON.stringify(userData));
      setProfileName(userData.name);
      localStorage.setItem('s23_profile_name', userData.name);

      // Load user-scoped local cache immediately for 0ms UI latency
      try {
        const storedN = sync.getScopedStorageItem('s23_notes', u.id);
        const storedR = sync.getScopedStorageItem('s23_reminders', u.id);
        setNotes(storedN ? JSON.parse(storedN) : []);
        setReminders(storedR ? JSON.parse(storedR) : []);
      } catch (e) {
        console.warn("Yerel önbellek okuma hatası:", e);
      }

      // Check active cloud gifts for this user
      let isCloudGiftActive = false;
      try {
        if (dbProf?.friend_code) {
          const { data: gifts } = await supabase
            .from('friend_gifts')
            .select('id')
            .eq('receiver_code', dbProf.friend_code)
            .gt('expires_at', Date.now())
            .limit(1);
          if (gifts && gifts.length > 0) isCloudGiftActive = true;
        }
      } catch (giftErr) {}

      // Sync RevenueCat plan & Supabase DB plan — Admin paneli hediye/değişikliğini anında uygular
      syncRevenueCatUser(u).then(activePlan => {
        // [EARLY ACCESS] Tüm özellikler ücretsiz — abonelik sistemi geçici olarak pasif
        const finalPlan = 'ultra';
        // [EARLY ACCESS ORIGINAL]
        // const getWeight = (p) => p === 'ultra' ? 3 : p === 'pro' ? 2 : 1;
        // const rcW = getWeight(activePlan);
        // const dbW = getWeight(dbPlan);
        // const localW = getWeight(localStorage.getItem('s23_user_plan'));
        // const giftW = isCloudGiftActive ? 3 : 1;
        // const maxW = Math.max(rcW, dbW, localW, giftW);
        // const finalPlan = maxW === 3 ? 'ultra' : maxW === 2 ? 'pro' : 'lite';

        setUserPlan(finalPlan);
        localStorage.setItem('s23_user_plan', finalPlan);

        // Check device limit with cryptographically secure Device ID
        let devId = localStorage.getItem('s23_device_id');
        if (!devId) {
          const randomBytes = new Uint8Array(16);
          window.crypto.getRandomValues(randomBytes);
          devId = 'dev_' + Array.from(randomBytes, b => b.toString(16).padStart(2, '0')).join('');
          localStorage.setItem('s23_device_id', devId);
        }
        const devKey = `s23_user_devices_${u.id}`;
        const savedDevs = JSON.parse(localStorage.getItem(devKey) || '[]');
        if (!savedDevs.includes(devId)) {
          const limits = PLAN_LIMITS[finalPlan] || PLAN_LIMITS.lite;
          if (limits.maxDevices !== Infinity && savedDevs.length >= limits.maxDevices) {
            setToast({
              title: "⚠️ Cihaz Limiti",
              msg: `NoteUp ${finalPlan.toUpperCase()} planında en fazla ${limits.maxDevices} cihaz kullanabilirsiniz. Pro/Ultra'ya geçerek cihaz kısıtlamasını kaldırın!`
            });
          } else {
            localStorage.setItem(devKey, JSON.stringify([...savedDevs, devId]));
          }
        }
      });

      // Generate deterministic friend code
      const userCode = `HUB-${u.id.replace(/-/g, '').substring(0, 4).toUpperCase()}-${u.id.replace(/-/g, '').slice(-4).toUpperCase()}`;
      setMyCode(userCode);
      localStorage.setItem('s23_my_code', userCode);

      // Device platform & country detection for Admin Panel tracking
      const getCountry = () => {
        try {
          const loc = navigator.language || navigator.userLanguage || 'tr-TR';
          const parts = loc.split('-');
          if (parts.length > 1 && parts[1].length === 2) {
            return parts[1].toUpperCase();
          }
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
          if (tz.includes('Istanbul') || tz.includes('Turkey')) return 'TR';
          if (tz.includes('Berlin')) return 'DE';
          if (tz.includes('London')) return 'GB';
          return (parts[0] || 'TR').substring(0, 2).toUpperCase();
        } catch (e) {
          return 'TR';
        }
      };

      // Robust platform detection — Capacitor + User-Agent çift kontrol
      // Apple Sign-In OAuth callback web context'inden gelince
      // Capacitor.getPlatform() yanlış 'web' veya 'android' dönebilir
      const detectPlatform = () => {
        const cap = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
        if (cap === 'ios' || cap === 'android') return cap;
        // Capacitor 'web' dönüyorsa User-Agent'a bak
        const ua = navigator.userAgent || '';
        if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
        if (/android/i.test(ua)) return 'android';
        return cap; // 'web' olarak kalsın
      };

      // Upsert profile row in Supabase
      const nowIso = new Date().toISOString();
      try {
        await supabase.from('profiles').upsert({
          id: u.id,
          email: u.email || '',
          name: userData.name,
          photo_url: userData.photoURL,
          friend_code: userCode,
          my_code: userCode,
          platform: detectPlatform(),
          country: getCountry(),
          last_seen: nowIso,
          last_seen_at: nowIso
        });
      } catch (err) {
        console.error("Profiles database sync failed:", err);
      }

      // Pull fresh data from Supabase
      sync.syncDataFromSupabase(u.id);
    } else {
      // LOGOUT: Clear in-memory state so previous user's data disappears
      setUser(null);
      localStorage.removeItem('s23_user');
      setNotes([]);
      setReminders([]);

      // Load guest cache if present
      try {
        const storedN = sync.getScopedStorageItem('s23_notes', 'guest');
        const storedR = sync.getScopedStorageItem('s23_reminders', 'guest');
        setNotes(storedN ? JSON.parse(storedN) : []);
        setReminders(storedR ? JSON.parse(storedR) : []);
      } catch (e) {
        console.warn("Misafir önbellek okuma hatası:", e);
      }

      syncRevenueCatUser(null);
      setUserPlan('lite');
    }
  };

  // --- AUTH LISTENER + DEEP LINKS + REALTIME PLAN EFFECT ---
  useEffect(() => {
    let profileChannel = null;

    const setupProfileRealtime = (userId) => {
      if (!userId) return;
      if (profileChannel) supabase.removeChannel(profileChannel);

      profileChannel = supabase
        .channel(`public:profiles:${userId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        }, (payload) => {
          if (payload.new) {
            const livePlan = (payload.new.plan || payload.new.user_plan || '').toLowerCase();
            if (livePlan && ['lite', 'pro', 'ultra'].includes(livePlan)) {
              setUserPlan(livePlan);
              localStorage.setItem('s23_user_plan', livePlan);
            }
          }
        })
        .subscribe();
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
      if (session?.user?.id) setupProfileRealtime(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session);
      if (session?.user?.id) setupProfileRealtime(session.user.id);
    });

    const setupDeepLinks = async () => {
      const appUrlListener = await CapApp.addListener('appUrlOpen', async (data) => {
        try {
          if (data && data.url) {
            // GÜVENLİK: Yalnızca com.notes.hub:// veya kendi domain'imizden gelen deep link'leri kabul et
            const isAllowedScheme = data.url.startsWith('com.notes.hub://') || 
                                    data.url.startsWith(window.location.origin);
            if (!isAllowedScheme) {
              console.warn("Güvenlik Uyarısı: Yetkisiz deep link URL'si engellendi:", data.url);
              return;
            }

            // In-App Browser'ı kapat — artık Chrome'da sekme kalmaz
            try { await Browser.close(); } catch (_) {}

            const urlObj = new URL(data.url);
            const rawParams = urlObj.hash ? urlObj.hash.substring(1) : urlObj.search;
            const params = new URLSearchParams(rawParams);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            const authCode = params.get('code');

            if (authCode) {
              setToast({ title: "⏳ Doğrulanıyor...", msg: "Giriş bilgileri doğrulanıyor." });
              const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(authCode);
              if (error) throw error;
              if (sessionData?.session) {
                await handleAuthChange(sessionData.session);
              }
              setToast({ title: "🔑 Giriş Başarılı", msg: "Başarıyla oturum açıldı." });
            } else if (accessToken && refreshToken) {
              setToast({ title: "⏳ Doğrulanıyor...", msg: "Giriş bilgileri doğrulanıyor." });
              const { data: sessionData, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
              if (error) throw error;
              if (sessionData?.session) {
                await handleAuthChange(sessionData.session);
              }
              setToast({ title: "🔑 Giriş Başarılı", msg: "Başarıyla oturum açıldı." });
            }
          }
        } catch (err) {
          console.error("Deep link processing error:", err);
        }
      });
      return appUrlListener;
    };

    const deepLinkPromise = setupDeepLinks();

    return () => {
      subscription.unsubscribe();
      deepLinkPromise.then(listener => {
        if (listener) listener.remove();
      });
    };
  }, []);

  // --- LOGIN HANDLER ---
  const handleLogin = async (providerName) => {
    setIsLoggingIn(true);
    if (isMockMode) {
      setTimeout(() => {
        const mockName = providerName === 'google' ? 'Emirhan (Google)' : 'Emirhan (Apple)';
        const mockEmail = providerName === 'google' ? 'emirhan@gmail.com' : 'emirhan@apple.com';
        const mockUser = {
          uid: 'mock-' + Date.now(),
          name: mockName,
          email: mockEmail,
          photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(mockName)}`,
          providerId: providerName === 'google' ? 'google.com' : 'apple.com'
        };
        setUser(mockUser);
        localStorage.setItem('s23_user', JSON.stringify(mockUser));
        setProfileName(mockUser.name);
        localStorage.setItem('s23_profile_name', mockUser.name);
        setIsLoggingIn(false);
        setToast({ title: "🔑 Giriş Başarılı", msg: "Simüle oturum başlatıldı." });
      }, 1000);
    } else {
      try {
        const redirectUrl = Capacitor.isNativePlatform()
          ? 'com.notes.hub://login'
          : window.location.origin;

        const isNative = Capacitor.isNativePlatform();

        // OAuth URL'sini Supabase'den al
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: providerName,
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: isNative,
            scopes: providerName === 'apple' ? 'name email' : undefined
          }
        });
        if (error) throw error;

        if (Capacitor.isNativePlatform() && data?.url) {
          // Native platformda: In-App Custom Tab'ı biz açıyoruz
          await Browser.open({
            url: data.url,
            windowName: '_self',
            presentationStyle: 'popover'
          });
          // Deep link callback geldiğinde Browser otomatik kapanacak
          // (useEffect içindeki appUrlOpen listener hallediyor)
        }
        // Web platformunda Supabase zaten yönlendiriyor (skipBrowserRedirect yok)
      } catch (error) {
        console.error("Giriş hatası:", error);
        setToast({
          title: "❌ Giriş Başarısız",
          msg: "Giriş yapılırken bir sorun oluştu. Lütfen tekrar deneyin."
        });
      } finally {
        setIsLoggingIn(false);
      }
    }
  };

  // --- LOGOUT HANDLER ---
  const handleLogout = async () => {
    setNotes([]);
    setReminders([]);
    if (isMockMode) {
      setUser(null);
      localStorage.removeItem('s23_user');
      localStorage.removeItem('s23_notes');
      setToast({ title: "🚪 Oturum Kapatıldı", msg: "Simüle oturum sonlandırıldı." });
    } else {
      try {
        await supabase.auth.signOut();
        setUser(null);
        localStorage.removeItem('s23_user');
        localStorage.removeItem('s23_notes');
        setToast({ title: "🚪 Oturum Kapatıldı", msg: "Başarıyla çıkış yapıldı." });
      } catch (error) {
        console.error("Çıkış hatası:", error);
        setToast({ title: "❌ Hata", msg: "Çıkış yapılırken bir hata oluştu." });
      }
    }
  };

  // --- AVATAR UPDATE HANDLER ---
  const handleSelectAvatar = async (avatarUrl) => {
    if (!user) return;
    setToast({ title: "Güncelleniyor..." });
    try {
      localStorage.setItem(`s23_avatar_${user.uid}`, avatarUrl);
      const updatedUser = { ...user, photoURL: avatarUrl };
      setUser(updatedUser);
      localStorage.setItem('s23_user', JSON.stringify(updatedUser));
      if (!isMockMode) {
        await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });
        try {
          await supabase.from('profiles').upsert({
            id: user.uid,
            email: user.email || '',
            name: user.name || '',
            photo_url: avatarUrl,
            last_seen: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn("Profiles DB avatar sync warning:", dbErr);
        }
      }
      setToast({ title: "Profil Resmi Güncellendi" });
      setShowAvatarPicker(false);
    } catch (err) {
      console.error("Avatar update error:", err);
      setToast({ title: "Hata", msg: "Profil resmi güncellenirken bir sorun oluştu." });
    }
  };

  // --- PROFILE NAME UPDATE HANDLER ---
  const handleUpdateProfileName = async (name) => {
    const cleanName = sanitizeSingleLine(name, 50);
    if (!cleanName) return;
    setProfileName(cleanName);
    localStorage.setItem('s23_profile_name', cleanName);

    if (user) {
      const updatedUser = { ...user, name: cleanName };
      setUser(updatedUser);
      localStorage.setItem('s23_user', JSON.stringify(updatedUser));

      if (!isMockMode) {
        try {
          await supabase.from('profiles').upsert({
            id: user.uid,
            email: user.email || '',
            name: cleanName,
            photo_url: user.photoURL || '',
            last_seen: new Date().toISOString(),
            last_seen_at: new Date().toISOString()
          });
          await supabase.auth.updateUser({ data: { full_name: cleanName, display_name: cleanName } });
        } catch (dbErr) {
          console.warn("Profiles DB name sync warning:", dbErr);
        }
      }
      setToast({ title: "✅ Profil Adı Güncellendi", msg: "Yeni isminiz başatıyla kaydedildi." });
    }
  };

  return {
    notes, setNotes,
    reminders, setReminders,

    user, setUser,
    isLoggingIn, setIsLoggingIn,
    myCode, setMyCode,
    profileName, setProfileName,
    showAvatarPicker, setShowAvatarPicker,

    userPlan, setUserPlan,
    planNotification, setPlanNotification,

    toast, setToast,

    getUserScopedKey: sync.getUserScopedKey,
    getScopedStorageItem: sync.getScopedStorageItem,

    handleLogin,
    handleLogout,
    handleSelectAvatar,
    handleUpdateProfileName,
    syncDataFromSupabase: sync.syncDataFromSupabase,
    syncDeltaSharedNotes: sync.syncDeltaSharedNotes
  };
}
