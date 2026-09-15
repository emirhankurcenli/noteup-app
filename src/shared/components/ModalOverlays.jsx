import React from 'react';
import ConfirmDialogModal from '@shared/components/ConfirmDialogModal';

const ModalOverlays = ({
  confirmDialog,
  setConfirmDialog,
  t
}) => {
  if (!confirmDialog) return null;

  return (
    <ConfirmDialogModal
      confirmDialog={confirmDialog}
      setConfirmDialog={setConfirmDialog}
      t={t}
    />
  );
};

export default ModalOverlays;
