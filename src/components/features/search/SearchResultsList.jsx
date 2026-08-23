import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';

const TYPE_LABELS = {
  title: { tr: 'Başlık', en: 'Title', color: '#3B82F6' },
  text: { tr: 'Metin', en: 'Text', color: '#6366F1' },
  todo: { tr: 'Yapılacak', en: 'To-Do', color: '#10B981' },
  bill: { tr: 'Fatura', en: 'Bill', color: '#F59E0B' },
  password: { tr: 'Şifre', en: 'Password', color: '#EF4444' },
  debt: { tr: 'Borç', en: 'Debt', color: '#8B5CF6' },
  split: { tr: 'Hesap', en: 'Split', color: '#EC4899' },
  parking: { tr: 'Araç', en: 'Car', color: '#14B8A6' },
  exam: { tr: 'Sınav', en: 'Exam', color: '#F97316' },
  audio: { tr: 'Ses', en: 'Audio', color: '#06B6D4' },
  file: { tr: 'Dosya', en: 'File', color: '#84CC16' },
  image: { tr: 'Görsel', en: 'Image', color: '#F43F5E' },
};

export const SearchResultsList = ({ results, openEditingNote, debouncedQuery, isLight }) => {
  const { t, lang } = useLanguage();
  if (!results || results.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
        <span style={{ fontSize: '2rem' }}>🔍</span>
        <p style={{ marginTop: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
          {t('noNotesFound')}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {results.map(({ note, matchedStrings }) => (
        <div
          key={note.id}
          onClick={() => openEditingNote(note)}
          style={{
            padding: '14px 16px',
            borderRadius: '16px',
            background: isLight ? '#FFFFFF' : 'var(--bg-card)',
            border: isLight ? '1px solid #E2E8F0' : '1px solid var(--border-color)',
            cursor: 'pointer',
            boxShadow: isLight ? '0 4px 12px rgba(0,0,0,0.03)' : '0 4px 14px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {note.title || t('untitledNote')}
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {new Date(note.updatedAt || Date.now()).toLocaleDateString()}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {matchedStrings.slice(0, 3).map((match, i) => {
              const meta = TYPE_LABELS[match.type] || TYPE_LABELS.text;
              return (
                <div
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    background: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.05)',
                    fontSize: '0.76rem',
                  }}
                >
                  <span style={{ color: meta.color, fontWeight: 800 }}>{meta[lang] || meta.tr}:</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{match.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResultsList;
