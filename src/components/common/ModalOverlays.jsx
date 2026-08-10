import React from 'react';
import PlanNotificationModal from '../modals/PlanNotificationModal';
import ConfirmDialogModal from '../modals/ConfirmDialogModal';

const ModalOverlays = ({
  planNotification,
  setPlanNotification,
  confirmDialog,
  setConfirmDialog,
  theme,
  triggerHaptic,
  getLostFeatures,
  getChangedFeatures,
  PLAN_LEVELS,
  t
}) => {
  if (!planNotification && !confirmDialog) return null;

  const isLight = theme === 'light';

  return (
    <>
      {planNotification && (
        <PlanNotificationModal
          planNotification={planNotification}
          setPlanNotification={setPlanNotification}
          isLight={isLight}
          triggerHaptic={triggerHaptic}
          getLostFeatures={getLostFeatures}
          getChangedFeatures={getChangedFeatures}
          PLAN_LEVELS={PLAN_LEVELS}
        />
      )}

      {confirmDialog && (
        <ConfirmDialogModal
          confirmDialog={confirmDialog}
          setConfirmDialog={setConfirmDialog}
          t={t}
        />
      )}
    </>
  );
};

export default ModalOverlays;
