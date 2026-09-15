import React from 'react';
import { useLanguage } from '@shared/context/LanguageContext';
import { getSearchSnippet, normalizeTurkish } from '@shared/utils/textUtils';

// ── Highlight matched query with pleasant badge ──────────────────────────────
export const HighlightText = ({ text, query }) => {
  if (!query || !text) return <span>{text}</span>;
  const normText = normalizeTurkish(text);
  const normQuery = normalizeTurkish(query.trim());
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
          <mark
            key={i}
            style={{
              background: 'linear-gradient(135deg, #FDE68A, #FCD34D)',
              color: '#92400E',
              borderRadius: '3px',
              padding: '1px 3px',
              fontWeight: 700,
            }}
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </span>
  );
};

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

export const SearchResultsList = ({ results, openEditingNote, debouncedQuery, isLight, t: propT, lang: propLang }) => {
  const ctx = useLanguage();
  const t = propT || ctx?.t || ((k) => k);
  const lang = propLang || ctx?.lang || 'tr';

  if (!results || results.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
        <span style={{ fontSize: '2rem' }}>🔍</span>
        <p style={{ marginTop: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
          {t('noNotesFound') || 'Not bulunamadı'}
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
              <HighlightText text={note.title || t('untitledNote') || 'Başlıksız Not'} query={debouncedQuery} />
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {new Date(note.updatedAt || Date.now()).toLocaleDateString()}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {matchedStrings.slice(0, 3).map((match, i) => {
              const meta = TYPE_LABELS[match.type] || TYPE_LABELS.text;
              const snippet = getSearchSnippet(match.text, debouncedQuery, 13);
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '6px 10px',
                    borderRadius: '10px',
                    background: isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.05)',
                    fontSize: '0.80rem',
                    lineHeight: 1.45,
                    wordBreak: 'break-word',
                  }}
                >
                  <span style={{ color: meta.color, fontWeight: 800, flexShrink: 0, marginTop: '1px' }}>
                    {meta[lang] || meta.tr || meta.en}:
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <HighlightText text={snippet} query={debouncedQuery} />
                  </span>
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
