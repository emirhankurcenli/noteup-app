import React, { useState, useCallback, useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { SearchBarInput } from './SearchBarInput';
import { SearchResultsList } from './SearchResultsList';

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
  lang: propLang,
  t: propT,
  searchQuery = '',
  setSearchQuery,
}) => {
  const { t: ctxT, lang: ctxLang } = useLanguage();
  const t = propT || ctxT;
  const lang = propLang || ctxLang;
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
          🔍 {t('search')}
        </h2>
      </div>

      {/* ── Search Bar ────────────────────────────────────────────────────────── */}
      <SearchBarInput
        searchQuery={searchQuery}
        handleQueryChange={handleQueryChange}
        clearSearch={clearSearch}
        isLight={isLight}
      />

      {/* ── Results List ──────────────────────────────────────────────────────── */}
      <SearchResultsList
        results={results}
        openEditingNote={openEditingNote}
        debouncedQuery={debouncedQuery}
        isLight={isLight}
      />
    </div>
  );
};

export default SearchTab;
