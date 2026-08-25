import React from 'react';
import { sanitizeText } from '../../utils/securityUtils';

const IncomingShareModal = ({
  incomingRequest,
  handleAcceptShare,
  handleRejectShare,
  lang,
  t,
  isLight,
  triggerHaptic,
}) => {
  if (!incomingRequest) return null;

  const getFirstLinePreview = () => {
    let blocks = incomingRequest.noteBlocks;
    if (typeof blocks === 'string') {
      try {
        blocks = JSON.parse(blocks);
      } catch (_) {
        blocks = [];
      }
    }
    if (Array.isArray(blocks) && blocks.length > 0) {
      for (const b of blocks) {
        if (!b) continue;
        if (b.type === 'text' && typeof b.content === 'string') {
          const plain = sanitizeText(b.content)
            .replace(/&nbsp;/gi, ' ')
            .replace(/[\u200B\u8203\r\n]/g, ' ')
            .trim();
          if (plain) return plain;
        } else if (b.type === 'todo' && Array.isArray(b.items) && b.items.length > 0) {
          const first = b.items.find(i => i && i.text && i.text.trim());
          if (first) return `${sanitizeText(first.text).trim()}`;
        } else if (b.type === 'bill' && b.name) {
          return `${sanitizeText(b.name)}: ${b.amount || ''}₺`;
        } else if (b.type === 'debt' && Array.isArray(b.items) && b.items.length > 0) {
          const first = b.items.find(d => d && d.name);
          if (first) return `${sanitizeText(first.name)}: ${first.amount || ''}₺`;
        }
      }
    }

    if (typeof incomingRequest.noteContent === 'string' && incomingRequest.noteContent.trim()) {
      const clean = sanitizeText(incomingRequest.noteContent)
        .replace(/&nbsp;/gi, ' ')
        .replace(/[\u200B\u8203\r\n]/g, ' ')
        .trim();
      if (clean) return clean;
    }

    return '';
  };

  const firstLineText = getFirstLinePreview();
  const noteTitle = incomingRequest.noteTitle || (lang === 'tr' ? 'Başlıksız Not' : 'Untitled Note');

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 9999,
      }}
      className="animate-fade-in"
      onClick={handleRejectShare}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          background: isLight
            ? 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'
            : 'linear-gradient(135deg, #181E2E 0%, #0F1420 100%)',
          borderRadius: '24px',
          padding: '24px 20px',
          border: isLight ? '1.5px solid #E2E8F0' : '1.5px solid rgba(99, 102, 241, 0.3)',
          boxShadow: isLight
            ? '0 20px 50px rgba(0, 0, 0, 0.15)'
            : '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(99, 102, 241, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Ambient Accent */}
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: isLight
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(255,255,255,0) 70%)'
              : 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Modern Clean SVG Badge */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
            flexShrink: 0,
            color: '#FFFFFF'
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>

        {/* Title & Sender */}
        <div style={{ textAlign: 'center' }}>
          <h3
            style={{
              fontSize: '1.18rem',
              fontWeight: 800,
              color: isLight ? '#0F172A' : '#F8FAFC',
              margin: '0 0 4px 0',
              letterSpacing: '-0.3px',
            }}
          >
            {t('collabNoteInvite') || 'Ortak Not Daveti'}
          </h3>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '12px',
              background: isLight ? 'rgba(59, 130, 246, 0.08)' : 'rgba(99, 102, 241, 0.15)',
              marginTop: '4px',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isLight ? '#2563EB' : '#93C5FD' }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: isLight ? '#2563EB' : '#93C5FD',
              }}
            >
              {incomingRequest.fromName}
            </span>
          </div>
        </div>

        {/* Note Card (Title + First Line Content) */}
        <div
          style={{
            width: '100%',
            background: isLight ? 'rgba(241, 245, 249, 0.8)' : 'rgba(255, 255, 255, 0.04)',
            padding: '14px 16px',
            borderRadius: '16px',
            textAlign: 'left',
            maxHeight: '110px',
            overflowY: 'auto',
            border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
          }}
        >
          <div
            style={{
              fontSize: '0.96rem',
              fontWeight: 800,
              color: isLight ? '#0F172A' : '#F1F5F9',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {noteTitle}
          </div>
          {firstLineText ? (
            <p
              style={{
                margin: 0,
                fontSize: '0.82rem',
                color: isLight ? '#64748B' : '#94A3B8',
                lineHeight: 1.4,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {firstLineText}
            </p>
          ) : (
            <span style={{ fontSize: '0.78rem', color: isLight ? '#94A3B8' : '#64748B', fontStyle: 'italic' }}>
              {lang === 'tr' ? '(İçerik boş)' : '(Empty content)'}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '4px' }}>
          <button
            onClick={() => {
              triggerHaptic?.('light');
              handleRejectShare();
            }}
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: '14px',
              border: isLight ? '1.5px solid #FCA5A5' : '1.5px solid rgba(239, 68, 68, 0.35)',
              background: isLight ? 'rgba(254, 242, 242, 0.8)' : 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {t('reject') || 'Reddet'}
          </button>
          <button
            onClick={() => {
              triggerHaptic?.('medium');
              handleAcceptShare();
            }}
            style={{
              flex: 1.2,
              padding: '12px 14px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)',
              color: '#FFFFFF',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              transition: 'all 0.15s ease',
            }}
          >
            {t('accept') || 'Kabul Et'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingShareModal;
