import React, { useState, useCallback, useRef } from 'react';
import { useLanguage } from '@shared/context/LanguageContext';
import { htmlToPlainText, normalizeTurkish } from '@shared/utils/textUtils';
import { SearchBarInput } from './SearchBarInput';
import { SearchResultsList } from './SearchResultsList';

// ── Deep search: extracts all searchable strings from a note (HTML stripped) ──
function getSearchableStrings(note) {
  const strings = [];
  if (note.title) strings.push({ text: htmlToPlainText(note.title), type: 'title' });

  (note.blocks || []).forEach(block => {
    if (!block) return;

    // ── Generic block-level title/name/label (widget headers) ──────────────
    if (block.title) strings.push({ text: htmlToPlainText(block.title), type: block.type || 'text' });
    if (block.name && block.type !== 'audio' && block.type !== 'file' && block.type !== 'image') {
      strings.push({ text: htmlToPlainText(block.name), type: block.type || 'text' });
    }
    if (block.label) strings.push({ text: htmlToPlainText(block.label), type: block.type || 'text' });

    // ── Per-type specific fields ────────────────────────────────────────────
    if (block.type === 'text' && block.content) {
      const clean = htmlToPlainText(block.content);
      if (clean) strings.push({ text: clean, type: 'text' });
    }
    if (block.type === 'audio' && block.name) strings.push({ text: block.name, type: 'audio' });
    if (block.type === 'file' && block.name) strings.push({ text: block.name, type: 'file' });
    if (block.type === 'image' && block.name) strings.push({ text: block.name, type: 'image' });

    // Todo widget
    if (block.type === 'todo') {
      (block.items || []).forEach(item => {
        if (item.text) {
          const clean = htmlToPlainText(item.text);
          if (clean) strings.push({ text: clean, type: 'todo' });
        }
      });
    }
    // Bill widget
    if (block.type === 'bill') {
      if (block.amount) strings.push({ text: String(block.amount), type: 'bill' });
      if (block.category) strings.push({ text: htmlToPlainText(block.category), type: 'bill' });
    }
    // Password widget
    if (block.type === 'password') {
      if (block.username) strings.push({ text: htmlToPlainText(block.username), type: 'password' });
      if (block.platform) strings.push({ text: htmlToPlainText(block.platform), type: 'password' });
    }
    // Debt widget
    if (block.type === 'debt') {
      if (block.personName) strings.push({ text: htmlToPlainText(block.personName), type: 'debt' });
      (block.items || []).forEach(item => {
        if (item.description) strings.push({ text: htmlToPlainText(item.description), type: 'debt' });
      });
    }
    // Split widget
    if (block.type === 'split') {
      (block.participants || []).forEach(p => {
        if (p.name) strings.push({ text: htmlToPlainText(p.name), type: 'split' });
      });
      (block.expenses || []).forEach(e => {
        if (e.description) strings.push({ text: htmlToPlainText(e.description), type: 'split' });
      });
    }
    // Parking widget
    if (block.type === 'parking') {
      if (block.note) strings.push({ text: htmlToPlainText(block.note), type: 'parking' });
    }
    // Exam widget
    if (block.type === 'exam') {
      if (block.courseName) strings.push({ text: htmlToPlainText(block.courseName), type: 'exam' });
      if (block.subject) strings.push({ text: htmlToPlainText(block.subject), type: 'exam' });
    }
  });

  return strings;
}

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
  const ctx = useLanguage();
  const t = propT || ctx?.t || ((k) => k);
  const lang = propLang || ctx?.lang || 'tr';
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
    const q = normalizeTurkish(debouncedQuery.trim());
    if (!q || q.length < 1) return [];

    // Locked notes and deleted notes are excluded to protect private content
    const activeNotes = notes.filter(n => n && !n.deletedAt && !n.isLocked);
    const matched = [];

    for (const note of activeNotes) {
      const strings = getSearchableStrings(note);
      const matchedStrings = strings.filter(s => normalizeTurkish(s.text).includes(q));
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
