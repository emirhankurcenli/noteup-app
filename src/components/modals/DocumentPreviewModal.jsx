import React from 'react';
import { registerPlugin } from '@capacitor/core';

const AppSettings = registerPlugin('AppSettings');

const DocumentPreviewModal = ({
  previewFileModal,
  setPreviewFileModal,
}) => {
  if (!previewFileModal) return null;

  const openFile = async () => {
    try {
      await AppSettings.openFile({ base64: previewFileModal.url, fileName: previewFileModal.name });
    } catch (e) {
      window.open(previewFileModal.url, '_blank');
    }
  };

  return (
    <div
      className="modal-backdrop animate-fade-in"
      onClick={() => setPreviewFileModal(null)}
      style={{ zIndex: 9999 }}
    >
      <div
        className="glass-panel animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '94%',
          maxWidth: '680px',
          height: '85vh',
          maxHeight: '800px',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          overflow: 'hidden',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface-elevated)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <span style={{ fontSize: '1.4rem' }}>
              {previewFileModal.isPdf ? '📄' : previewFileModal.isText ? '📝' : '📁'}
            </span>
            <div style={{ overflow: 'hidden' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
                {previewFileModal.name}
              </h3>
              {previewFileModal.size && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{previewFileModal.size}</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '10px' }}
              onClick={openFile}
              title="Dışarıda Aç"
            >
              ↗ Dışarıda Aç
            </button>
            <button
              className="btn-secondary"
              style={{ width: '34px', height: '34px', padding: 0, borderRadius: '50%', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setPreviewFileModal(null)}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body / Viewer Content */}
        <div style={{ flex: 1, overflow: 'hidden', background: '#121215', position: 'relative' }}>
          {previewFileModal.isPdf ? (
            <iframe
              src={previewFileModal.url}
              title={previewFileModal.name}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : previewFileModal.isText && previewFileModal.contentText !== null ? (
            <pre style={{
              margin: 0,
              padding: '20px',
              width: '100%',
              height: '100%',
              overflow: 'auto',
              fontSize: '0.88rem',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: 'var(--text-primary)'
            }}>
              {previewFileModal.contentText}
            </pre>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '30px', textAlign: 'center' }}>
              <span style={{ fontSize: '4rem', marginBottom: '16px' }}>📁</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{previewFileModal.name}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Bu dosya türü uygulama içinde doğrudan önizlenemiyor.
              </p>
              <button
                className="btn-primary"
                style={{ padding: '12px 24px', borderRadius: '12px' }}
                onClick={openFile}
              >
                🚀 Harici Uygulama İle Aç / İndir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
