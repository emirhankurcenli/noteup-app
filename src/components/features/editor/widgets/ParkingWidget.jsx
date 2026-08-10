import React from 'react';

const ParkingWidget = ({
  block,
  blockFormStates,
  updateBlockForm,
  handleUpdateBlock,
  handleDeleteBlock,
  triggerHaptic,
  setToast,
  t
}) => {
  const pfs = blockFormStates[block.id] || {};
  const lat = block.lat;
  const lng = block.lng;
  const note = block.note || '';

  const handleGetLocation = () => {
    updateBlockForm(block.id, { loadingLocation: true });
    triggerHaptic('light');

    if (!navigator.geolocation) {
      setToast({ title: t('gpsUnsupportedTitle'), msg: t('gpsUnsupportedMsg') });
      updateBlockForm(block.id, { loadingLocation: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleUpdateBlock(block.id, { lat: latitude, lng: longitude });
        updateBlockForm(block.id, { loadingLocation: false });
        setToast({ title: t('gpsSuccessTitle'), msg: t('gpsSuccessMsg') });
        triggerHaptic('success');
      },
      (error) => {
        let msg = t('gpsErrorMsg');
        if (error.code === 1) msg = t('gpsPermissionDenied');
        setToast({ title: t('gpsErrorTitle'), msg });
        updateBlockForm(block.id, { loadingLocation: false });
        triggerHaptic('warning');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleOpenMap = () => {
    if (!lat || !lng) return;
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(mapUrl, '_blank');
  };

  return (
    <div className="parking-widget" style={{ borderRadius: '18px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '16px' }} onClick={(e) => e.stopPropagation()}>
      <div className="parking-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #EF4444, #DC2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', flexShrink: 0, boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.0 10.9 2 11.2 2 11.5V16c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
          </svg>
        </div>
        <span className="parking-title" style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{t('parkTitle')}</span>
        <button
          style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 'auto' }}
          onClick={() => handleDeleteBlock(block.id)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="parking-location-section">
        {lat && lng ? (
          <>
            <div className="parking-location-status" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div className="parking-gps-info">
                <span className="parking-gps-dot"></span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{t('parkStatus')}</span>
              </div>
              <button className="btn-primary parking-map-btn" style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleOpenMap}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="1 6 1 22 8 18 15 22 22 18 22 2 15 6 8 2 1 6" />
                  <line x1="8" y1="2" x2="8" y2="18" />
                  <line x1="15" y1="6" x2="15" y2="22" />
                </svg>
                {t('parkShowMap')}
              </button>
            </div>
            <div className="parking-map-preview" style={{ overflow: 'hidden', borderRadius: '14px', border: '1px solid var(--border-color)', height: '180px', marginTop: '4px', marginBottom: '10px' }}>
              <iframe
                title="Parking Location Map"
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block' }}
                loading="lazy"
                src={`https://maps.google.com/maps?q=${lat},${lng}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
              />
            </div>
          </>
        ) : null}

        <button 
          className={`parking-gps-trigger-btn ${pfs.loadingLocation ? 'loading' : ''} ${lat ? 'secondary' : ''}`}
          style={{ padding: '10px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 700 }}
          onClick={handleGetLocation}
          disabled={pfs.loadingLocation}
        >
          {pfs.loadingLocation ? t('parkLoading') : (lat ? t('parkUpdate') : t('parkSave'))}
        </button>
      </div>

      <div className="parking-details" style={{ marginTop: '12px' }}>
        <div className="parking-field">
          <label className="parking-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', display: 'block' }}>{t('parkNote')}</label>
          <textarea
            id={`parking-note-${block.id}`}
            className="input-field"
            style={{ fontSize: '0.85rem', padding: '10px 12px', minHeight: '60px', borderRadius: '12px', resize: 'none', fontFamily: 'inherit' }}
            placeholder={t('parkNotePlaceholder')}
            value={note}
            onChange={e => handleUpdateBlock(block.id, { note: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

export default ParkingWidget;
