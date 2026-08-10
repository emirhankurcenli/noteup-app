import { useState, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';
import {
  checkNotificationPermission,
  requestNotificationPermissionRaw,
  getNotificationPermissionStatus
} from '../services/notificationService';

const AppSettings = registerPlugin('AppSettings');

export default function useAppPermissions({ setToast, lang, setConfirmDialog }) {
  const [permissionStates, setPermissionStates] = useState({
    microphone: 'unknown',
    notification: 'unknown',
    storage: 'unknown',
    audio: 'unknown',
    location: 'unknown'
  });

  const checkAndRequestNotificationPermissionRef = useRef(null);

  const showPermissionDialog = (type) => {
    const titles = {
      storage: lang === 'tr' ? '📁 Galeri & Medya İzni Gerekli' : '📁 Gallery Permission Required',
      microphone: lang === 'tr' ? '🎙️ Mikrofon İzni Gerekli' : '🎙️ Microphone Permission Required',
      audio: lang === 'tr' ? '🎵 Müzik & Ses İzni Gerekli' : '🎵 Audio Permission Required',
      location: lang === 'tr' ? '📍 Konum İzni Gerekli' : '📍 Location Permission Required',
      notification: lang === 'tr' ? '🔔 Bildirim İzni Gerekli' : '🔔 Notification Permission Required',
    };
    const messages = {
      storage: lang === 'tr'
        ? 'Notunuza fotoğraf veya dosya ekleyebilmek için cihaz ayarlarından galeri izinlerini etkinleştirmeniz gerekmektedir.'
        : 'Please enable gallery permissions in device settings to attach photos or files.',
      microphone: lang === 'tr'
        ? 'Ses kaydı yapabilmek için cihaz ayarlarından mikrofon iznini etkinleştirmeniz gerekmektedir.'
        : 'Please enable microphone permission in device settings to record audio.',
      audio: lang === 'tr'
        ? 'Ses dosyası ekleyebilmek için cihaz ayarlarından müzik ve ses izinlerini etkinleştirmeniz gerekmektedir.'
        : 'Please enable audio permissions in device settings to attach sound files.',
      location: lang === 'tr'
        ? 'Konum ekleyebilmek için cihaz ayarlarından konum iznini etkinleştirmeniz gerekmektedir.'
        : 'Please enable location permission in device settings.',
      notification: lang === 'tr'
        ? 'Hatırlatıcı alabilmek ve alarmları kullanabilmek için bildirim izinlerini etkinleştirmeniz gerekmektedir.'
        : 'Please enable notification permissions to receive reminders.',
    };

    if (setConfirmDialog) {
      setConfirmDialog({
        title: titles[type] || (lang === 'tr' ? '⚠️ İzin Gerekli' : '⚠️ Permission Required'),
        message: messages[type] || (lang === 'tr' ? 'Bu özelliği kullanabilmek için cihaz ayarlarından izinleri etkinleştirmeniz gerekmektedir.' : 'Please enable permissions in device settings.'),
        confirmText: lang === 'tr' ? '⚙️ Ayarları Aç' : '⚙️ Open Settings',
        cancelText: lang === 'tr' ? 'Vazgeç' : 'Cancel',
        confirmBg: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
        confirmShadow: '0 4px 16px rgba(59, 130, 246, 0.35)',
        onConfirm: async () => {
          try {
            if (Capacitor.isNativePlatform()) {
              if (Capacitor.getPlatform() === 'android') {
                await AppSettings.openSettings();
              } else if (Capacitor.getPlatform() === 'ios') {
                window.location.href = 'app-settings:';
              } else {
                try { await AppSettings.openSettings(); } catch (_) {}
              }
            }
          } catch (_) {}
        }
      });
    } else if (setToast) {
      setToast({
        title: titles[type] || '⚠️ İzin Gerekli',
        msg: messages[type] || 'Lütfen cihaz ayarlarından izin verin.'
      });
    }
  };

  const updatePermissionStates = async () => {
    const states = { microphone: 'unknown', notification: 'unknown', storage: 'unknown', audio: 'unknown', location: 'unknown' };
    const hasNotify = await checkNotificationPermission();
    states.notification = hasNotify ? 'granted' : 'denied';

    try {
      if (Capacitor.isNativePlatform()) {
        const nativeStatus = await AppSettings.getPermissionStatus();
        states.microphone = nativeStatus.microphone || 'unknown';
        states.storage = nativeStatus.storage || 'unknown';
        states.audio = nativeStatus.audio || 'unknown';
        states.location = nativeStatus.location || 'unknown';
      } else if (navigator.permissions && navigator.permissions.query) {
        try {
          const mic = await navigator.permissions.query({ name: 'microphone' });
          states.microphone = mic.state;
        } catch (e) {}
        try {
          const loc = await navigator.permissions.query({ name: 'geolocation' });
          states.location = loc.state;
        } catch (e) {}
        states.storage = 'granted';
        states.audio = 'granted';
      }
    } catch (err) {}

    if (setConfirmDialog) {
      setConfirmDialog(prev => {
        if (!prev || !prev.title) return prev;
        if (hasNotify && (prev.title.includes('Bildirim İzni Gerekli') || prev.title.includes('Notification Permission Required'))) {
          return null;
        }
        if (states.location === 'granted' && (prev.title.includes('Konum İzni Gerekli') || prev.title.includes('Location Permission Required'))) {
          return null;
        }
        if (states.microphone === 'granted' && (prev.title.includes('Mikrofon İzni Gerekli') || prev.title.includes('Microphone Permission Required'))) {
          return null;
        }
        if (states.storage === 'granted' && (prev.title.includes('Galeri') || prev.title.includes('Gallery'))) {
          return null;
        }
        if (states.audio === 'granted' && (prev.title.includes('Müzik') || prev.title.includes('Audio'))) {
          return null;
        }
        return prev;
      });
    }

    setPermissionStates(states);
  };

  const requestAllPermissionsAtStartup = async () => {
    await checkAndRequestNotificationPermission();
    if (Capacitor.isNativePlatform()) {
      try {
        await AppSettings.requestStoragePermission();
        await AppSettings.requestAudioPermission();
      } catch (e) {}
    }
    updatePermissionStates();
  };

  const checkAndRequestNotificationPermission = async () => {
    checkAndRequestNotificationPermissionRef.current = checkAndRequestNotificationPermission;

    let hasPermission = await checkNotificationPermission();
    if (hasPermission) {
      if (setConfirmDialog) {
        setConfirmDialog(prev => {
          if (prev && prev.title && (prev.title.includes('Bildirim İzni Gerekli') || prev.title.includes('Notification Permission Required'))) {
            return null;
          }
          return prev;
        });
      }
      updatePermissionStates();
      return true;
    }

    try {
      const permStatus = await requestNotificationPermissionRaw();
      hasPermission = permStatus?.display === 'granted' || (await checkNotificationPermission());

      if (hasPermission) {
        if (setConfirmDialog) {
          setConfirmDialog(prev => {
            if (prev && prev.title && (prev.title.includes('Bildirim İzni Gerekli') || prev.title.includes('Notification Permission Required'))) {
              return null;
            }
            return prev;
          });
        }
        if (setToast) {
          setToast({ title: "🔔 Bildirim İzni", msg: "Bildirimler başarıyla açıldı." });
        }
        updatePermissionStates();
        return true;
      }
    } catch (e) {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          if (setConfirmDialog) {
            setConfirmDialog(prev => {
              if (prev && prev.title && (prev.title.includes('Bildirim İzni Gerekli') || prev.title.includes('Notification Permission Required'))) {
                return null;
              }
              return prev;
            });
          }
          updatePermissionStates();
          return true;
        }
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            if (setConfirmDialog) {
              setConfirmDialog(prev => {
                if (prev && prev.title && (prev.title.includes('Bildirim İzni Gerekli') || prev.title.includes('Notification Permission Required'))) {
                  return null;
                }
                return prev;
              });
            }
            if (setToast) {
              setToast({ title: "🔔 Bildirim İzni", msg: "Bildirimler başarıyla açıldı." });
            }
            updatePermissionStates();
            return true;
          }
        } catch (_) {}
      }
    }

    updatePermissionStates();
    showPermissionDialog('notification');
    return false;
  };

  const handleRequestMicPermission = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const res = await AppSettings.requestMicrophonePermission();
        if (res.microphone === 'granted') {
          if (setToast) setToast({ title: "🎙️ İzin Verildi", msg: "Ses kaydetme/mikrofon izni başarıyla onaylandı." });
        } else {
          showPermissionDialog('microphone');
        }
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        if (setToast) setToast({ title: "🎙️ İzin Verildi", msg: "Ses kaydetme/mikrofon izni başarıyla onaylandı." });
      }
    } catch (e) {
      showPermissionDialog('microphone');
    }
    updatePermissionStates();
  };

  const handleRequestStoragePermission = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const res = await AppSettings.requestStoragePermission();
        if (res.storage === 'granted') {
          if (setToast) setToast({ title: "🖼️ Galeri İzni", msg: "Resim ve medya erişim izni onaylandı." });
        } else {
          showPermissionDialog('storage');
        }
      }
    } catch (e) {
      showPermissionDialog('storage');
    }
    updatePermissionStates();
  };

  const handleRequestAudioPermission = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const res = await AppSettings.requestAudioPermission();
        if (res.audio === 'granted') {
          if (setToast) setToast({ title: "🎵 Müzik İzni", msg: "Müzik ve ses dosyası erişim izni onaylandı." });
        } else {
          showPermissionDialog('audio');
        }
      }
    } catch (e) {
      showPermissionDialog('audio');
    }
    updatePermissionStates();
  };

  const checkAndRequestPermission = async (type) => {
    try {
      if (Capacitor.isNativePlatform()) {
        if (type === 'microphone') {
          const res = await AppSettings.requestMicrophonePermission();
          const ok = res.microphone === 'granted';
          if (!ok) showPermissionDialog('microphone');
          return ok;
        }
        if (type === 'storage') {
          const res = await AppSettings.requestStoragePermission();
          const ok = res.storage === 'granted';
          if (!ok) showPermissionDialog('storage');
          return ok;
        }
        if (type === 'audio') {
          const res = await AppSettings.requestAudioPermission();
          const ok = res.audio === 'granted';
          if (!ok) showPermissionDialog('audio');
          return ok;
        }
        if (type === 'location') {
          if (Capacitor.getPlatform() === 'android') {
            const res = await AppSettings.requestLocationPermission();
            const ok = res.location === 'granted';
            if (!ok) showPermissionDialog('location');
            return ok;
          } else {
            return new Promise((resolve) => {
              if (!navigator.geolocation) {
                showPermissionDialog('location');
                resolve(false);
                return;
              }
              navigator.geolocation.getCurrentPosition(
                () => resolve(true),
                (err) => {
                  if (err.code === 1) showPermissionDialog('location');
                  resolve(err.code !== 1);
                },
                { timeout: 10000 }
              );
            });
          }
        }
      } else {
        if (type === 'microphone') {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(t => t.stop());
          return true;
        }
        if (type === 'location') {
          return new Promise((resolve) => {
            if (!navigator.geolocation) {
              showPermissionDialog('location');
              resolve(false);
              return;
            }
            navigator.geolocation.getCurrentPosition(
              () => resolve(true),
              (err) => {
                if (err.code === 1) showPermissionDialog('location');
                resolve(err.code !== 1);
              },
              { timeout: 10000 }
            );
          });
        }
        return true;
      }
    } catch (e) {
      showPermissionDialog(type);
      return false;
    }
  };

  return {
    permissionStates,
    updatePermissionStates,
    requestAllPermissionsAtStartup,
    checkAndRequestNotificationPermission,
    handleRequestMicPermission,
    handleRequestStoragePermission,
    handleRequestAudioPermission,
    checkAndRequestPermission,
    showPermissionDialog,
    checkAndRequestNotificationPermissionRef
  };
}
