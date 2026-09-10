import { useEffect, useRef, useState } from 'react';

const PLAN_LEVELS = { lite: 1, pro: 2, ultra: 3 };

export const useSubscriptionPlanWatcher = (userPlan) => {
  const [planNotification, setPlanNotification] = useState(null);
  const prevPlanRef = useRef(userPlan);

  useEffect(() => {
    const from = prevPlanRef.current;
    const to = userPlan;
    localStorage.setItem('s23_user_plan', to);

    if (from !== to) {
      const fromLevel = PLAN_LEVELS[from] || 1;
      const toLevel = PLAN_LEVELS[to] || 1;
      const isDown = toLevel < fromLevel;

      // Handle 7-Day Payment Grace Period
      if (isDown && (from === 'pro' || from === 'ultra') && to === 'lite') {
        const GRACE_PERIOD_DAYS = 7;
        const graceUntil = Date.now() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;
        localStorage.setItem('s23_payment_failed_flag', 'true');
        localStorage.setItem('s23_payment_grace_until', String(graceUntil));
        localStorage.setItem('s23_previous_paid_plan', from);
      } else if (to === 'pro' || to === 'ultra') {
        localStorage.removeItem('s23_payment_failed_flag');
        localStorage.removeItem('s23_payment_grace_until');
        localStorage.removeItem('s23_previous_paid_plan');
      }

      const seenKey = `s23_seen_plan_modal_${to}`;
      const isSeen = localStorage.getItem(seenKey) === 'true';

      if (!isSeen) {
        setPlanNotification({
          plan: to,
          fromPlan: from,
          title: isDown
            ? `NoteUp ${to === 'pro' ? 'Pro Planına Düşüldü' : 'Lite Planına Düşüldü'}`
            : to === 'ultra'
            ? "👑 NoteUp Ultra'ya Hoş Geldiniz!"
            : "⚡ NoteUp Pro'ya Hoş Geldiniz!",
          message: isDown
            ? `Aboneliğiniz sonlandırıldığı için NoteUp ${to === 'pro' ? 'Pro' : 'Lite (Ücretsiz)'} seviyesine geçildi.`
            : to === 'ultra'
            ? 'Tüm Ultra ayrıcalıklarınız (PDF Kaydet, 5GB Bulut, Sınırsız Paylaşım) aktif edildi!'
            : 'Tüm Pro ayrıcalıklarınız (1GB Bulut, Sınırsız Not Şifreleme, Reklamsız) aktif edildi!',
        });
      }

      prevPlanRef.current = to;
    }
  }, [userPlan]);

  return {
    planNotification,
    setPlanNotification,
  };
};

export default useSubscriptionPlanWatcher;
