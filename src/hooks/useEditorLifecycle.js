import { useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

export default function useEditorLifecycle({
  notes,
  setNotes,
  reminders,
  user,
  editingNote,
  setEditingNote,
  lastEditingNoteId,
  setLastEditingNoteId,
  persistNotes,
  enforceTrailingTextBlock,
  deleteFromR2,
  gc
}) {
  const cleanupEmptyNote = (noteId) => {
    if (!noteId) return;
    setNotes(prevNotes => {
      const note = prevNotes.find(n => n.id === noteId);
      if (!note) return prevNotes;

      const defaultTitles = ['Yeni Not', 'untitledNote', 'New Note', 'Başlıksız Not', 'Untitled Note', 'Unbenannte Notiz', 'Note sans titre', 'Nota sin título', 'Nota senza titolo', 'Nota sem título', 'Заметка без названия', 'ملاحظة بدون عنوان', '無題のメモ', '未命名笔记'];
      const titleIsEmpty = !note.title || note.title.trim() === '' || defaultTitles.includes(note.title.trim());
      const blocksAreEmpty = !note.blocks || note.blocks.length === 0 || note.blocks.every(b => {
        if (!b) return true;
        if (b.type !== 'text') return false; // Has widget/image/audio -> NOT empty!
        const clean = (b.content || '')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/gi, ' ')
          .replace(/[\u200B\u8203\r\n]/g, '')
          .trim();
        return clean === '';
      });
      const currentReminders = reminders || [];
      const hasNoReminder = !currentReminders.some(r => r.noteId === noteId);

      if (titleIsEmpty && blocksAreEmpty && hasNoReminder) {
        const filtered = prevNotes.filter(n => n.id !== noteId);
        if (persistNotes) persistNotes(filtered);
        
        if (user && user.uid) {
          supabase.from('notes').delete().eq('id', noteId).then(({ error }) => {
            if (error) console.error("Error deleting empty note from Supabase:", error);
          });
        }
        return filtered;
      }
      return prevNotes;
    });
  };

  const openEditingNote = (note) => {
    if (!note) {
      if (editingNote && gc) {
        gc.flushOrphanedMedia(deleteFromR2, editingNote.blocks);
      }
      setEditingNote(null);
      return;
    }
    if (gc) {
      gc.clearPendingDeletions();
    }
    const sanitizedNote = {
      ...note,
      blocks: enforceTrailingTextBlock ? enforceTrailingTextBlock(note.blocks || []) : (note.blocks || [])
    };
    setEditingNote(sanitizedNote);
  };

  const handleCloseEditor = () => {
    const currentNoteId = editingNote?.id;
    if (window.history.state && window.history.state.page === 'editor') {
      window.history.back();
    } else {
      setEditingNote(null);
    }
    if (currentNoteId) {
      cleanupEmptyNote(currentNoteId);
    }
  };

  useEffect(() => {
    if (editingNote) {
      if (setLastEditingNoteId) setLastEditingNoteId(editingNote.id);
    } else if (lastEditingNoteId) {
      cleanupEmptyNote(lastEditingNoteId);
      if (setLastEditingNoteId) setLastEditingNoteId(null);
    }
  }, [editingNote]);

  return {
    openEditingNote,
    cleanupEmptyNote,
    handleCloseEditor
  };
}
