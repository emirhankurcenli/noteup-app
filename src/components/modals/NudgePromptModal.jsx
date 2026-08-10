import React, { useState, useEffect } from 'react';

const NudgePromptModal = ({
  nudgeTargetNote,
  setNudgeTargetNote,
  handleSendNudge,
  lang = 'tr',
  theme = 'dark',
  triggerHaptic
}) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (nudgeTargetNote) {
      setMessage('');
    }
  }, [nudgeTargetNote]);

  if (!nudgeTargetNote) return null;

  const isLight = theme === 'light';

  const handleSubmit = () => {
    const success = handleSendNudge(nudgeTargetNote, message);
    if (success) {
      setNudgeTargetNote(null);
      setMessage('');
    }
  };

  return (
    <div
      onClick={() => setNudgeTargetNote(null)}
      className="modal-overlay animate-fade-in"
      style={{
        position: 'fixed', zIndex: 9999,
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isLight ? 'rgba(15, 23, 42, 0.45)' : 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-content animate-pop"
        style={{
          width: '100%',
          maxWidth: '380px',
          background: isLight ? '#FFFFFF' : 'var(--bg-card, #1E293B)',
          border: isLight ? '1px solid rgba(226, 232, 240, 0.9)' : '1px solid var(--border-color, rgba(255,255,255,0.12))',
          borderRadius: '24px',
          padding: '24px 20px',
          boxShadow: isLight ? '0 20px 45px rgba(0,0,0,0.14)' : '0 24px 60px rgba(0,0,0,0.45)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: isLight ? '#0F172A' : '#F8FAFC', margin: 0 }}>
                {lang === 'tr' ? 'Bildirim Gönder' : 'Send Notification'}
              </h3>
              <span style={{ fontSize: '0.75rem', color: isLight ? '#64748B' : '#94A3B8' }}>
                {lang === 'tr' ? 'Paylaşılan arkadaşlara iletilir' : 'Sent to shared friends'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setNudgeTargetNote(null)}
            style={{
              background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(255, 255, 255, 0.08)',
              border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.12)',
              color: isLight ? '#475569' : '#94A3B8',
              cursor: 'pointer',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Note Target Banner */}
        <div style={{
          background: isLight ? '#F8FAFC' : 'rgba(245, 158, 11, 0.08)',
          border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '14px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '1rem' }}>📝</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isLight ? '#0F172A' : '#F8FAFC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {nudgeTargetNote.title || (lang === 'tr' ? 'Başlıksız Not' : 'Untitled Note')}
          </span>
        </div>

        {/* Message Input Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isLight ? '#475569' : '#CBD5E1' }}>
            {lang === 'tr' ? 'Ekleyeceğiniz Not / Mesaj (İsteğe Bağlı):' : 'Add Note / Message (Optional):'}
          </label>
          <textarea
            className="input-field"
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '14px',
              fontSize: '0.85rem',
              resize: 'none',
              lineHeight: 1.4,
            }}
            placeholder={lang === 'tr' ? 'Örn: Notu güncelledim kanka, yeni konuları ekledim baksana!' : 'e.g. Updated the note, check it out!'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* Cooldown Hint */}
        <div style={{ fontSize: '0.73rem', color: isLight ? '#64748B' : '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>⏱️</span>
          <span>{lang === 'tr' ? 'Bildirimler aynı not için 10 dakikada bir gönderilebilir.' : 'Notifications can be sent every 10 minutes.'}</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button
            onClick={() => setNudgeTargetNote(null)}
            className="btn-secondary"
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {lang === 'tr' ? 'İptal' : 'Cancel'}
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            style={{
              flex: 1.5,
              padding: '12px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#fff',
              fontSize: '0.88rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>📣</span>
            {lang === 'tr' ? 'Gönder' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NudgePromptModal;
