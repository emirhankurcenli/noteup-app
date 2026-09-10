import React from 'react';

const PdfIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const TextIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const JsonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const ExportFormatButtons = ({ handleExportTxt, handleExportPdf, handleExportJson, isLight }) => {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={handleExportPdf}
        style={{
          flex: 1,
          padding: '12px 10px',
          borderRadius: '14px',
          border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)',
          background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
          color: isLight ? '#0F172A' : '#FFFFFF',
          fontSize: '0.82rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}
      >
        <PdfIcon /> PDF Yap
      </button>

      <button
        onClick={handleExportTxt}
        style={{
          flex: 1,
          padding: '12px 10px',
          borderRadius: '14px',
          border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)',
          background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
          color: isLight ? '#0F172A' : '#FFFFFF',
          fontSize: '0.82rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}
      >
        <TextIcon /> Metin (.txt)
      </button>

      <button
        onClick={handleExportJson}
        style={{
          flex: 1,
          padding: '12px 10px',
          borderRadius: '14px',
          border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)',
          background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.04)',
          color: isLight ? '#0F172A' : '#FFFFFF',
          fontSize: '0.82rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}
      >
        <JsonIcon /> JSON Sakla
      </button>
    </div>
  );
};

export default ExportFormatButtons;
