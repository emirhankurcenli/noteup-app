import React from 'react';

export const AudioBlock = ({
  block,
  activeAudioPlayingId,
  activeAudioProgress,
  handlePlayPauseAudio,
  handleDeleteBlock,
}) => {
  const isPlaying = activeAudioPlayingId === block.id;

  return (
    <div
      className="audio-block-wrapper"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        background: 'var(--bg-card)',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        margin: '8px 0',
      }}
    >
      <button
        onClick={() => handlePlayPauseAudio(block)}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
          border: 'none',
          color: '#FFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {block.fileName || 'Ses Kaydı'}
        </span>
        <div style={{ width: '100%', height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${isPlaying ? activeAudioProgress || 0 : 0}%`,
              height: '100%',
              background: '#06B6D4',
              transition: 'width 0.1s linear',
            }}
          />
        </div>
      </div>

      <button
        onClick={() => handleDeleteBlock(block.id)}
        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
      >
        ✕
      </button>
    </div>
  );
};

export default AudioBlock;
