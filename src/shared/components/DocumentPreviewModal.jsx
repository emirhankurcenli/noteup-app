import React from 'react';
import { Browser } from '@capacitor/browser';

const FileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const LargeFolderIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const DocumentPreviewModal = ({ previewFileModal, setPreviewFileModal }) => {
  if (!previewFileModal) return null;

  const openFile = async () => {
    try {
      if (previewFileModal.url) {
        await Browser.open({ url: previewFileModal.url });
      }
    } catch (err) {
      console.warn("External open error:", err);
      window.open(previewFileModal.url, '_blank');
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={() => setPreviewFileModal(null)}
      style={{ zIndex: 100000 }}
    >
      <div 
        className="modal-content" 
        style={{
          width: '95vw',
          maxWidth: '850px',
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '20px',
          background: 'var(--bg-surface)'
        }}
        onClick={(e) => e.stopPropagation()}
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
            <FileIcon />
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
              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center' }}
              onClick={openFile}
              title="Dışarıda Aç"
            >
              <ExternalLinkIcon /> Dışarıda Aç
            </button>
            <button
              className="btn-secondary"
              style={{ width: '34px', height: '34px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setPreviewFileModal(null)}
            >
              <CloseIcon />
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
              <LargeFolderIcon />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{previewFileModal.name}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Bu dosya türü uygulama içinde doğrudan önizlenemiyor.
              </p>
              <button
                className="btn-primary"
                style={{ padding: '12px 24px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center' }}
                onClick={openFile}
              >
                <ExternalLinkIcon /> Harici Uygulama İle Aç / İndir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
