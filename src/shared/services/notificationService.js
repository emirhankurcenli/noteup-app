import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const createNotificationChannels = async () => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    // Create alarm notification channel with custom sound (Android)
    await LocalNotifications.createChannel({
      id: 'alarm_channel',
      name: 'NoteUp Alarmları',
      description: 'Alarm bildirimleri ses ve titreşimle gelir',
      importance: 5,        // IMPORTANCE_HIGH
      visibility: 1,        // VISIBILITY_PUBLIC
      sound: 'alarm',       // res/raw/alarm.wav
      vibration: true,
      lights: true,
      lightColor: '#4A7FA5'
    });

    // Create system default notification channel (Android)
    await LocalNotifications.createChannel({
      id: 'system_default_channel_v4',
      name: 'Varsayılan Sistem Alarmları',
      description: 'Telefonun varsayılan sesini kullanan alarmlar',
      importance: 5,
      visibility: 1,
      vibration: true,
      lights: true,
      lightColor: '#4A7FA5'
    });
  } catch (e) {
    console.warn("Notification channel creation failed:", e);
  }
};

export const checkNotificationPermission = async () => {
  try {
    const permStatus = await LocalNotifications.checkPermissions();
    return permStatus.display === 'granted';
  } catch (e) {
    if ('Notification' in window) {
      return Notification.permission === 'granted';
    }
  }
  return false;
};

export const requestNotificationPermission = async () => {
  try {
    const res = await LocalNotifications.requestPermissions();
    return res.display === 'granted';
  } catch (e) {
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      return res === 'granted';
    }
  }
  return false;
};

export const scheduleLocalNotification = async ({ id, title, body, at, channelId, extra }) => {
  try {
    await LocalNotifications.schedule({
      notifications: [{
        id,
        title,
        body,
        schedule: { at },
        channelId, // 'alarm_channel' or 'system_default_channel_v4'
        extra,     // { noteId }
        smallIcon: 'ic_stat_name',
        iconColor: '#8B5CF6'
      }]
    });
    return true;
  } catch (e) {
    console.error("Failed to schedule notification:", e);
    return false;
  }
};

export const cancelLocalNotification = async (id) => {
  try {
    await LocalNotifications.cancel({
      notifications: [{ id }]
    });
    return true;
  } catch (e) {
    console.error("Failed to cancel notification:", e);
    return false;
  }
};

export const addNotificationListener = (eventName, callback) => {
  try {
    return LocalNotifications.addListener(eventName, callback);
  } catch (e) {
    console.warn(`LocalNotifications addListener failed for ${eventName}:`, e);
    return null;
  }
};

export const getNotificationPermissionStatus = async () => {
  try {
    return await LocalNotifications.checkPermissions();
  } catch (e) {
    if ('Notification' in window) {
      return { display: Notification.permission };
    }
  }
  return { display: 'unknown' };
};

export const requestNotificationPermissionRaw = async () => {
  try {
    return await LocalNotifications.requestPermissions();
  } catch (e) {
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      return { display: res };
    }
  }
  return { display: 'unknown' };
};
