import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const triggerHaptic = async (style = 'medium') => {
  try {
    if (style === 'success') {
      await Haptics.notification({ type: NotificationType.Success });
    } else if (style === 'warning') {
      await Haptics.notification({ type: NotificationType.Warning });
    } else if (style === 'light') {
      await Haptics.impact({ style: ImpactStyle.Light });
    } else {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  } catch (err) {
    console.error("Haptics failed:", err);
  }
};
