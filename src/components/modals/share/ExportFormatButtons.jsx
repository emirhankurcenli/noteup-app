import React from 'react';

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
        📄 PDF Yap
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
        📝 Metin (.txt)
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
        💾 JSON Sakla
      </button>
    </div>
  );
};

export default ExportFormatButtons;
