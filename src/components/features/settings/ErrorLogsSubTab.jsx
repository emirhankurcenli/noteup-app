import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

const ErrorLogsSubTab = ({ theme, lang, setToast }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isLight = theme === 'light';

  const fetchErrorLogs = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setLogs(data);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchErrorLogs();
  }, []);

  const handleClearLogs = async () => {
    if (!window.confirm(lang === 'tr' ? 'Tüm hata loglarını silmek istediğinize emin misiniz?' : 'Are you sure you want to clear all error logs?')) return;
    try {
      const { error } = await supabase.from('error_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (!error) {
        setLogs([]);
        if (typeof setToast === 'function') {
          setToast({ title: '🧹 Loglar Temizlendi', msg: 'Tüm sistem hata kayıtları silindi.' });
        }
      }
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderRadius: '16px',
        background: isLight ? '#F1F5F9' : 'rgba(255,255,255,0.05)',
        border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            fontWeight: 800,
            fontSize: '0.9rem'
          }}>
            🚨
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              {lang === 'tr' ? 'Sistem Hata Raporları' : 'System Error Logs'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {logs.length} {lang === 'tr' ? 'Kayıtlı Çökme / Hata Raporu' : 'Recorded Crash Logs'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={fetchErrorLogs}
            disabled={refreshing}
            style={{
              padding: '6px 12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              color: '#FFF',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              opacity: refreshing ? 0.6 : 1
            }}
          >
            {refreshing ? '🔄 ...' : 'Yenile 🔄'}
          </button>

          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              style={{
                padding: '6px 12px',
                borderRadius: '10px',
                border: 'none',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#EF4444',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {lang === 'tr' ? 'Temizle' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      {/* Logs List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {lang === 'tr' ? 'Hata logları yükleniyor...' : 'Loading error logs...'}
        </div>
      ) : logs.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          borderRadius: '18px',
          background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.03)',
          border: isLight ? '1.5px dashed #CBD5E1' : '1.5px dashed rgba(255,255,255,0.1)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✅</div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 700 }}>
            {lang === 'tr' ? 'Hiç Hata Kaydı Yok' : 'No Error Logs'}
          </h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {lang === 'tr' ? 'Uygulamada kayıtlı çökme veya sistem hatası bulunmuyor. Sistem mükemmel çalışıyor!' : 'No crash logs detected. App is running cleanly!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {logs.map((log, index) => (
            <div
              key={log.id || index}
              style={{
                padding: '14px',
                borderRadius: '16px',
                background: isLight ? '#FFFFFF' : 'var(--bg-card, #1E293B)',
                border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: isLight ? '0 4px 12px rgba(0,0,0,0.03)' : '0 4px 16px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#EF4444',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  fontFamily: 'monospace'
                }}>
                  {log.error_name || 'ERROR'}
                </span>

                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {formatDate(log.created_at)}
                </span>
              </div>

              <div style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: isLight ? '#0F172A' : '#F8FAFC',
                wordBreak: 'break-word',
                fontFamily: 'monospace'
              }}>
                {log.error_message}
              </div>

              <div style={{
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                paddingTop: '6px',
                borderTop: isLight ? '1px solid #F1F5F9' : '1px solid rgba(255,255,255,0.06)'
              }}>
                <span>👤 {log.user_email || log.user_id || 'Misafir'}</span>
              </div>

              {log.error_stack && (
                <details style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, padding: '4px 0' }}>
                    {lang === 'tr' ? 'Teknik Stack Detayı' : 'Stack Trace'}
                  </summary>
                  <pre style={{
                    margin: '6px 0 0 0',
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.3)',
                    color: '#FCA5A5',
                    fontSize: '0.68rem',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}>
                    {log.error_stack}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ErrorLogsSubTab;
