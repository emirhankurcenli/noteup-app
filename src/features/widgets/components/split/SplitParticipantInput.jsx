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
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        ))}
        <button
          className="split-add-person-btn"
          style={{
            padding: '9px 12px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            textAlign: 'center',
          }}
          onClick={() => {
            if (triggerHaptic) triggerHaptic('light');
            const nextInputs = [...inputs, ''];
            setBlockFormStates((prev) => ({
              ...prev,
              [blockId]: { ...prev[blockId], splitNameInputs: nextInputs },
            }));
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>{getTr('splitAddPerson', 'Kişi Ekle')}</span>
        </button>
      </div>

      <button
        className="btn-primary"
        style={{
          width: '100%',
          padding: '11px',
          fontSize: '0.88rem',
          fontWeight: 600,
          borderRadius: '10px',
          background: '#F97316',
          border: 'none',
          color: '#FFF',
          boxShadow: 'none',
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
