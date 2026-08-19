import React from 'react';

export const SplitParticipantInput = ({
  blockId,
  sfs,
  setBlockFormStates,
  handleSetupSplit,
  triggerHaptic,
  getTr,
}) => {
  const inputs = sfs.splitNameInputs || ['', ''];

  return (
    <div className="split-setup">
      <p className="split-setup-hint" style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 10px 0' }}>
        {getTr('splitWhoJoins', 'Katılımcılar kimler?')}
      </p>

      <div className="split-name-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
        {inputs.map((name, idx) => (
          <div key={idx} className="split-name-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              id={`split-name-${blockId}-${idx}`}
              className="input-field"
              style={{ fontSize: '0.85rem', padding: '10px 14px', flex: 1, borderRadius: '10px' }}
              placeholder={`${idx + 1}${getTr('splitPersonPlaceholder', '. Kişi adı...')}`}
              value={name}
              onChange={(e) => {
                const nextInputs = [...inputs];
                nextInputs[idx] = e.target.value;
                setBlockFormStates((prev) => ({
                  ...prev,
                  [blockId]: { ...prev[blockId], splitNameInputs: nextInputs },
                }));
              }}
            />
            {inputs.length > 2 && (
              <button
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: 'none',
                  color: '#EF4444',
                  cursor: 'pointer',
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
                onClick={() => {
                  if (triggerHaptic) triggerHaptic('medium');
                  const nextInputs = inputs.filter((_, i) => i !== idx);
                  setBlockFormStates((prev) => ({
                    ...prev,
                    [blockId]: { ...prev[blockId], splitNameInputs: nextInputs },
                  }));
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          className="split-add-person-btn"
          style={{ padding: '8px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700 }}
          onClick={() => {
            if (triggerHaptic) triggerHaptic('light');
            const nextInputs = [...inputs, ''];
            setBlockFormStates((prev) => ({
              ...prev,
              [blockId]: { ...prev[blockId], splitNameInputs: nextInputs },
            }));
          }}
        >
          + {getTr('splitAddPerson', 'Kişi Ekle')}
        </button>
      </div>

      <button
        className="btn-primary"
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '0.9rem',
          fontWeight: 700,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #F97316, #EA580C)',
          border: 'none',
          color: '#FFF',
          cursor: 'pointer',
        }}
        onClick={() => {
          if (triggerHaptic) triggerHaptic('success');
          handleSetupSplit(blockId);
        }}
      >
        {getTr('splitStart', 'Başlat')}
      </button>
    </div>
  );
};

export default SplitParticipantInput;
