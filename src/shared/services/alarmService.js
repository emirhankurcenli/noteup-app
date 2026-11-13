import { registerPlugin, Capacitor } from '@capacitor/core';

export const Alarm = registerPlugin('Alarm');

export const setNativeAlarm = async ({ id, noteId, title, timestamp }) => {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    return await Alarm.setAlarm({
      id: String(id),
      noteId: String(noteId),
      title: title || '',
      timestamp: String(timestamp)
    });
  } catch (e) {
    console.log("Native AlarmPlugin scheduling skipped:", e);
    return null;
  }
};

export const cancelNativeAlarm = async (id) => {
  if (!Capacitor.isNativePlatform() || !id) return null;
  try {
    return await Alarm.cancelAlarm({ id: String(id) });
  } catch (e) {
    console.log("Native AlarmPlugin cancel skipped:", e);
    return null;
  }
};

export const checkNativeAlarmDismissed = async (id) => {
  if (!Capacitor.isNativePlatform() || !id) return null;
  try {
    return await Alarm.isAlarmDismissed({ id: String(id) });
  } catch (e) {
    console.error("isAlarmDismissed plugin call error:", e);
    return null;
  }
};

export default Alarm;
