import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

const RefreshIcon = ({ spin = false }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: spin ? 'spin 1s linear infinite' : 'none' }}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const InboxIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3B82F6' }}>
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const UserIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: '-1px' }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: '-1px' }}>
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14l-1.5-6H6.5L5 17z" />
    <path d="M9 11V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7" />
  </svg>
);

const FeedbackAdminSubTab = ({ theme, lang, setToast }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const isLight = theme === 'light';

  const fetchFeedbacks = async () => {
    setRefreshing(true);
    let remoteData = [];

    try {
      const { data, error } = await supabase
        .from('feedback_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        remoteData = data;
      }
    } catch (err) {
      console.error('Feedback fetch error:', err);
    }

    // Merge with local fallback storage
    try {
      const localData = JSON.parse(localStorage.getItem('s23_admin_feedback_list') || '[]');
      const combined = [...remoteData];
      localData.forEach(item => {
        if (!combined.some(c => c.id === item.id || (c.created_at === item.created_at && c.user_code === item.user_code))) {
          combined.push(item);
        }
      });
      combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setFeedbacks(combined);
    } catch (err) {
      setFeedbacks(remoteData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'hata':
      case 'bug':
        return { label: 'Hata Bildirimi', bg: '#FEF2F2', color: '#EF4444', border: '#FCA5A5' };
      case 'gorus':
      case 'general':
        return { label: 'Genel Görüş', bg: '#EFF6FF', color: '#3B82F6', border: '#93C5FD' };
      case 'hesap_silme':
      case 'delete_account':
        return { label: 'Hesap Silme Talebi', bg: '#FEE2E2', color: '#B91C1C', border: '#F87171' };
      default:
        return { label: 'İstek & Öneri', bg: '#FEF3C7', color: '#D97706', border: '#FCD34D' };
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => filterCategory === 'all' || f.category === filterCategory);

  const cardBg = isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)';
  const cardBorder = isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)';
  const textPrimary = isLight ? '#0F172A' : '#F8FAFC';
  const textSecondary = isLight ? '#64748B' : '#94A3B8';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderRadius: '16px',
        background: isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.04)',
        border: cardBorder,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <InboxIcon />
          <div>
            <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: textPrimary }}>
              {lang === 'tr' ? 'Gelen İstek & Öneriler' : 'Incoming Feedback'}
            </h4>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: textSecondary }}>
              {feedbacks.length} {lang === 'tr' ? 'toplam bildirim' : 'total submissions'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchFeedbacks}
          disabled={refreshing}
          style={{
            padding: '8px 12px', borderRadius: '10px',
            border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.12)',
            background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
            color: textPrimary, fontWeight: 700, fontSize: '0.78rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <RefreshIcon spin={refreshing} />
          {refreshing ? (lang === 'tr' ? 'Yükleniyor...' : 'Syncing...') : (lang === 'tr' ? 'Yenile' : 'Refresh')}
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: `Tümü (${feedbacks.length})` },
          { id: 'istek', label: 'İstekler' },
          { id: 'hata', label: 'Hatalar' },
          { id: 'gorus', label: 'Görüşler' },
          { id: 'hesap_silme', label: 'Hesap Silme' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            style={{
              padding: '6px 12px', borderRadius: '10px',
              border: filterCategory === tab.id ? '1.5px solid #3B82F6' : cardBorder,
              background: filterCategory === tab.id
                ? (isLight ? '#EFF6FF' : 'rgba(59, 130, 246, 0.15)')
                : (isLight ? '#F8FAFC' : 'rgba(255, 255, 255, 0.03)'),
              color: filterCategory === tab.id
                ? '#3B82F6'
                : textSecondary,
              fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: textSecondary, fontSize: '0.85rem' }}>
          {lang === 'tr' ? 'Mesajlar yükleniyor...' : 'Loading messages...'}
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '36px 20px', borderRadius: '16px',
          background: cardBg, border: cardBorder, color: textSecondary,
        }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: textPrimary }}>
            {lang === 'tr' ? 'Henüz bildirim bulunmuyor' : 'No feedback submissions yet'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredFeedbacks.map((fb, idx) => {
            const badge = getCategoryBadge(fb.category);
            return (
              <div
                key={fb.id || idx}
                style={{
                  padding: '16px', borderRadius: '16px',
                  background: cardBg, border: cardBorder,
                  display: 'flex', flexDirection: 'column', gap: '10px',
                }}
              >
                {/* Meta header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800,
                      background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                    }}>
                      {badge.label}
                    </span>
                    <span style={{
                      padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800,
                      background: fb.user_plan === 'ultra' ? '#FEF3C7' : fb.user_plan === 'pro' ? '#EFF6FF' : '#F1F5F9',
                      color: fb.user_plan === 'ultra' ? '#D97706' : fb.user_plan === 'pro' ? '#2563EB' : '#475569',
                      textTransform: 'uppercase',
                    }}>
                      {fb.user_plan || 'lite'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: textSecondary }}>
                    {formatDate(fb.created_at)}
                  </span>
                </div>

                {/* Sender info */}
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: textPrimary, display: 'flex', alignItems: 'center' }}>
                  <UserIcon /> {fb.user_name || 'Bilinmiyor'} <span style={{ fontWeight: 400, color: textSecondary, fontSize: '0.75rem', marginLeft: '4px' }}>({fb.user_code})</span>
                </div>

                {/* Subject */}
                {fb.subject && (
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: textPrimary, display: 'flex', alignItems: 'center' }}>
                    <PinIcon /> {fb.subject}
                  </div>
                )}

                {/* Message */}
                <div style={{
                  fontSize: '0.84rem', color: textPrimary,
                  background: isLight ? '#F8FAFC' : 'rgba(0,0,0,0.2)',
                  padding: '10px 12px', borderRadius: '10px',
                  lineHeight: 1.5, whiteSpace: 'pre-wrap',
                }}>
                  {fb.message}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FeedbackAdminSubTab;
