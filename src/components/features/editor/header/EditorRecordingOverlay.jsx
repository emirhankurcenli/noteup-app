import React from 'react';

export const EditorRecordingOverlay = ({
  isRecording,
  recordingSeconds,
  stopRecording,
}) => {
  if (!isRecording) return null;

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        position: 'sticky',
        top: '60px',
        zIndex: 110,
        margin: '10px 0',
        padding: '12px 18px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)',
        animation: 'pulse 2s infinite',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#FFFFFF',
            boxShadow: '0 0 10px #FFF',
          }}
        />
        <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>
          Ses Kaydediliyor... ({formatSeconds(recordingSeconds)})
        </span>
      </div>

      <button
        onClick={stopRecording}
        style={{
          background: '#FFFFFF',
          color: '#B91C1C',
          border: 'none',
          padding: '6px 14px',
          borderRadius: '10px',
          fontWeight: 800,
          fontSize: '0.82rem',
          cursor: 'pointer',
        }}
      >
        Duraklat / Bitir
      </button>
    </div>
  );
};

export default EditorRecordingOverlay;
