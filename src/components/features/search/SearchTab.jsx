import React, { useState, useCallback, useRef } from 'react';

// ── Turkish-aware normalize helper ─────────────────────────────────────────────
function normalize(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/İ/g, 'i').replace(/I/g, 'ı').replace(/Ş/g, 'ş')
    .replace(/Ğ/g, 'ğ').replace(/Ü/g, 'ü').replace(/Ö/g, 'ö')
    .replace(/Ç/g, 'ç');
}

// ── Yellow highlight component ─────────────────────────────────────────────────
const HighlightText = ({ text, query }) => {
  if (!query || !text) return <span>{text}</span>;
  const normText = normalize(text);
  const normQuery = normalize(query);
  if (!normQuery || !normText.includes(normQuery)) return <span>{text}</span>;

  const parts = [];
  let lastIndex = 0;
  let searchFrom = 0;
  while (true) {
    const idx = normText.indexOf(normQuery, searchFrom);
    if (idx === -1) break;
    if (idx > lastIndex) parts.push({ text: text.slice(lastIndex, idx), highlight: false });
    parts.push({ text: text.slice(idx, idx + normQuery.length), highlight: true });
    lastIndex = idx + normQuery.length;
    searchFrom = lastIndex;
  }
  if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), highlight: false });

  return (
    <span>
      {parts.map((part, i) =>
        part.highlight ? (
          <mark key={i} style={{
            background: 'linear-gradient(135deg, #FDE68A, #FCD34D)',
            color: '#92400E',
            borderRadius: '3px',
            padding: '0 2px',
            fontWeight: 800,
          }}>{part.text}</mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </span>
  );
};

// ── Deep search: extracts all searchable strings from a note ──────────────────
function getSearchableStrings(note) {
  const strings = [];
  if (note.title) strings.push({ text: note.title, type: 'title' });

  (note.blocks || []).forEach(block => {
    if (!block) return;

    // ── Generic block-level title/name/label (widget headers) ──────────────
    if (block.title) strings.push({ text: block.title, type: block.type || 'text' });
    if (block.name && block.type !== 'audio' && block.type !== 'file' && block.type !== 'image') {
      strings.push({ text: block.name, type: block.type || 'text' });
    }
    if (block.label) strings.push({ text: block.label, type: block.type || 'text' });

    // ── Per-type specific fields ────────────────────────────────────────────
    if (block.type === 'text' && block.content) strings.push({ text: block.content, type: 'text' });
    if (block.type === 'audio' && block.name) strings.push({ text: block.name, type: 'audio' });
    if (block.type === 'file' && block.name) strings.push({ text: block.name, type: 'file' });
    if (block.type === 'image' && block.name) strings.push({ text: block.name, type: 'image' });

    // Todo widget
    if (block.type === 'todo') {
      (block.items || []).forEach(item => {
        if (item.text) strings.push({ text: item.text, type: 'todo' });
      });
    }
    // Bill widget
    if (block.type === 'bill') {
      if (block.amount) strings.push({ text: String(block.amount), type: 'bill' });
      if (block.category) strings.push({ text: block.category, type: 'bill' });
    }
    // Password widget
    if (block.type === 'password') {
      if (block.username) strings.push({ text: block.username, type: 'password' });
      if (block.platform) strings.push({ text: block.platform, type: 'password' });
    }
    // Debt widget
    if (block.type === 'debt') {
      if (block.personName) strings.push({ text: block.personName, type: 'debt' });
      (block.items || []).forEach(item => {
        if (item.description) strings.push({ text: item.description, type: 'debt' });
      });
    }
    // Split widget
    if (block.type === 'split') {
      (block.participants || []).forEach(p => {
        if (p.name) strings.push({ text: p.name, type: 'split' });
      });
      (block.expenses || []).forEach(e => {
        if (e.description) strings.push({ text: e.description, type: 'split' });
      });
    }
    // Parking widget
    if (block.type === 'parking') {
      if (block.note) strings.push({ text: block.note, type: 'parking' });
    }
    // Exam widget
    if (block.type === 'exam') {
      if (block.courseName) strings.push({ text: block.courseName, type: 'exam' });
      if (block.subject) strings.push({ text: block.subject, type: 'exam' });
    }
  });

  return strings;
}

// ── Type badge labels ─────────────────────────────────────────────────────────
const TYPE_LABELS = {
  title: { tr: 'Başlık', en: 'Title', de: 'Titel', es: 'Título', fr: 'Titre', it: 'Titolo', ru: 'Заголовок', ar: 'عنوان', ja: 'タイトル', zh: '标题', color: '#3B82F6' },
  text: { tr: 'Metin', en: 'Text', de: 'Text', es: 'Texto', fr: 'Texte', it: 'Testo', ru: 'Текст', ar: 'نص', ja: 'テキスト', zh: '文本', color: '#6366F1' },
  todo: { tr: 'Yapılacak', en: 'To-Do', de: 'Aufgabe', es: 'Tarea', fr: 'Tâche', it: 'Da fare', ru: 'Задача', ar: 'مهمة', ja: 'ToDo', zh: '待办', color: '#10B981' },
  bill: { tr: 'Fatura', en: 'Bill', de: 'Rechnung', es: 'Factura', fr: 'Facture', it: 'Bolletta', ru: 'Счёт', ar: 'فاتورة', ja: '請求書', zh: '账单', color: '#F59E0B' },
  password: { tr: 'Şifre', en: 'Password', de: 'Passwort', es: 'Contraseña', fr: 'Mot de passe', it: 'Password', ru: 'Пароль', ar: 'كلمة المرور', ja: 'パスワード', zh: '密码', color: '#EF4444' },
  debt: { tr: 'Borç', en: 'Debt', de: 'Schulden', es: 'Deuda', fr: 'Dette', it: 'Debito', ru: 'Долг', ar: 'دين', ja: '借金', zh: '借贷', color: '#8B5CF6' },
  split: { tr: 'Hesap', en: 'Split', de: 'Teilen', es: 'Dividir', fr: 'Partage', it: 'Conto', ru: 'Раздел', ar: 'تقسيم', ja: '割り勘', zh: 'AA分摊', color: '#EC4899' },
  parking: { tr: 'Araç', en: 'Car', de: 'Auto', es: 'Coche', fr: 'Voiture', it: 'Auto', ru: 'Машина', ar: 'سيارة', ja: '駐車', zh: '车辆', color: '#14B8A6' },
  exam: { tr: 'Sınav', en: 'Exam', de: 'Prüfung', es: 'Examen', fr: 'Examen', it: 'Esame', ru: 'Экзамен', ar: 'امتحان', ja: '試験', zh: '考试', color: '#F97316' },
  audio: { tr: 'Ses', en: 'Audio', de: 'Audio', es: 'Audio', fr: 'Audio', it: 'Audio', ru: 'Аудио', ar: 'صوت', ja: '音声', zh: '音频', color: '#06B6D4' },
  file: { tr: 'Dosya', en: 'File', de: 'Datei', es: 'Archivo', fr: 'Fichier', it: 'File', ru: 'Файл', ar: 'ملف', ja: 'ファイル', zh: '文件', color: '#84CC16' },
  image: { tr: 'Görsel', en: 'Image', de: 'Bild', es: 'Imagen', fr: 'Image', it: 'Immagine', ru: 'Изображение', ar: 'صورة', ja: '画像', zh: '图片', color: '#F43F5E' },
};

// ── Main SearchTab Component ──────────────────────────────────────────────────
const SearchTab = ({
  notes = [],
  openEditingNote,
  theme,
  lang,
  t,
  searchQuery = '',
  setSearchQuery,
}) => {
  const isLight = theme === 'light';
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const debounceRef = useRef(null);

  const handleQueryChange = useCallback((e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(val);
    }, 150);
  }, [setSearchQuery]);

  // Sync debounced value when coming back to tab with existing query
  React.useEffect(() => {
    setDebouncedQuery(searchQuery);
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
  };

  // ── Filter & search logic ─────────────────────────────────────────────────
  const results = React.useMemo(() => {
    const q = normalize(debouncedQuery.trim());
    if (!q || q.length < 1) return [];

    // Locked notes and deleted notes are excluded to protect private content
    const activeNotes = notes.filter(n => n && !n.deletedAt && !n.isLocked);
    const matched = [];

    for (const note of activeNotes) {
      const strings = getSearchableStrings(note);
      const matchedStrings = strings.filter(s => normalize(s.text).includes(q));
      if (matchedStrings.length > 0) {
        matched.push({ note, matchedStrings });
      }
    }

    return matched;
  }, [debouncedQuery, notes]);

  const hasQuery = debouncedQuery.trim().length > 0;

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '4px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          {lang === 'tr' ? '🔍 Arama' : '🔍 Search'}
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {lang === 'tr' ? 'Tüm notlarda, başlıklarda ve eklentilerde ara' : 'Search across all notes, titles and widgets'}
        </span>
      </div>

      {/* ── Search Bar ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(30,30,50,0.85)',
        backdropFilter: 'blur(16px)',
        borderRadius: '18px',
        border: isLight
          ? '1.5px solid rgba(99,102,241,0.25)'
          : '1.5px solid rgba(99,102,241,0.4)',
        padding: '12px 16px',
        boxShadow: '0 4px 24px rgba(99,102,241,0.10)',
        transition: 'all 0.2s ease',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={handleQueryChange}
          placeholder={lang === 'tr' ? 'Arama yap...' : 'Search...'}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            caretColor: '#6366F1',
          }}
        />
        {searchQuery.length > 0 && (
          <button
            onClick={clearSearch}
            style={{
              background: 'rgba(99,102,241,0.12)',
              border: 'none',
              borderRadius: '50%',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              color: '#6366F1',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Result count badge ────────────────────────────────────────────────── */}
      {hasQuery && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: results.length > 0 ? '#6366F1' : 'var(--text-muted)',
            background: results.length > 0 ? 'rgba(99,102,241,0.10)' : 'transparent',
            padding: results.length > 0 ? '4px 12px' : '0',
            borderRadius: '20px',
          }}>
            {results.length > 0
              ? (lang === 'tr' ? `${results.length} sonuç bulundu` : `${results.length} result${results.length !== 1 ? 's' : ''} found`)
              : (lang === 'tr' ? 'Sonuç bulunamadı' : 'No results found')
            }
          </span>
        </div>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────────── */}
      {!hasQuery && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              {lang === 'tr' ? 'Ne aramak istiyorsunuz?' : 'What are you looking for?'}
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              {lang === 'tr'
                ? 'Başlık, metin, yapılacak, fatura, şifre, borç ve tüm eklentilerde anlık arama yapabilirsiniz.'
                : 'Search instantly across titles, text, todos, bills, passwords, debts and all widgets.'}
            </p>
          </div>
        </div>
      )}

      {/* ── No Results State ──────────────────────────────────────────────────── */}
      {hasQuery && results.length === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          padding: '40px 24px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '20px',
            background: 'rgba(239,68,68,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="8" x2="14" y2="14" />
              <line x1="14" y1="8" x2="8" y2="14" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              {lang === 'tr' ? `"${debouncedQuery}" bulunamadı` : `"${debouncedQuery}" not found`}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              {lang === 'tr' ? 'Farklı bir kelime ya da kısaltma deneyin' : 'Try a different word or abbreviation'}
            </p>
          </div>
        </div>
      )}

      {/* ── Results List ──────────────────────────────────────────────────────── */}
      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {results.map(({ note, matchedStrings }) => (
            <div
              key={note.id}
              onClick={() => {
                window.history.pushState({ page: 'editor', noteId: note.id }, '');
                openEditingNote(note);
              }}
              style={{
                background: isLight ? 'rgba(255,255,255,0.90)' : 'rgba(24,24,37,0.80)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                border: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.07)',
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              }}
            >
              {/* Note title */}
              <p style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.3 }}>
                <HighlightText text={note.title || (lang === 'tr' ? 'Başlıksız Not' : 'Untitled Note')} query={debouncedQuery} />
              </p>

              {/* Match snippets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {matchedStrings.slice(0, 3).map((match, idx) => {
                  const badge = TYPE_LABELS[match.type] || { tr: match.type, en: match.type, color: '#6B7280' };
                  const badgeText = badge[lang] || badge['en'] || badge['tr'] || match.type;
                  const trimLen = 120;
                  const normMatch = normalize(match.text);
                  const normQ = normalize(debouncedQuery);
                  const matchIdx = normMatch.indexOf(normQ);
                  let snippet = match.text;
                  if (match.text.length > trimLen && matchIdx > -1) {
                    const start = Math.max(0, matchIdx - 30);
                    const end = Math.min(match.text.length, matchIdx + normQ.length + 60);
                    snippet = (start > 0 ? '...' : '') + match.text.slice(start, end) + (end < match.text.length ? '...' : '');
                  }

                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '6px',
                        background: `${badge.color}18`,
                        color: badge.color,
                        flexShrink: 0,
                        marginTop: '2px',
                        whiteSpace: 'nowrap',
                        border: `1px solid ${badge.color}30`,
                      }}>{badgeText}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        <HighlightText text={snippet} query={debouncedQuery} />
                      </span>
                    </div>
                  );
                })}
                {matchedStrings.length > 3 && (
                  <span style={{ fontSize: '0.75rem', color: '#6366F1', fontWeight: 700, marginTop: '2px' }}>
                    +{matchedStrings.length - 3} {lang === 'tr' ? 'daha fazla eşleşme' : 'more matches'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchTab;
