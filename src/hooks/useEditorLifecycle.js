import { useEffect } from 'react';
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

    // 1. Check if DOM currently has unsaved text in any editor block
    let domHasContent = false;
    try {
      const activeBlocks = document.querySelectorAll('.content-editable-block');
      for (const el of activeBlocks) {
        const text = (el.innerText || el.textContent || '').replace(/[\u200B\u8203\r\n\s]/g, '').trim();
        if (text.length > 0) {
          domHasContent = true;
          break;
        }
      }
    } catch (_) {}

    if (domHasContent) {
      // DOM contains typed content! Do NOT delete the note under any circumstances!
      return;
    }

    setNotes(prevNotes => {
      const note = prevNotes.find(n => n.id === noteId);
      if (!note) return prevNotes;

      // 2. If the note currently in memory (editingNote) has text or widgets, do NOT delete
      if (editingNote && editingNote.id === noteId) {
        const memoryHasTitle = editingNote.title && editingNote.title.trim().length > 0;
        const memoryHasBlocks = (editingNote.blocks || []).some(b => {
          if (!b) return false;
          if (b.type !== 'text') return true;
          const clean = (b.content || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').replace(/[\u200B\u8203\r\n\s]/g, '').trim();
          return clean.length > 0;
        });
        if (memoryHasTitle || memoryHasBlocks) {
          return prevNotes;
        }
      }

      const defaultTitles = ['Yeni Not', 'untitledNote', 'New Note', 'Başlıksız Not', 'Untitled Note', 'Unbenannte Notiz', 'Note sans titre', 'Nota sin título', 'Nota senza titolo', 'Nota sem título', 'Заметка без названия', 'ملاحظة بدون عنوان', '無題のメモ', '未命名笔记'];
      const titleIsEmpty = !note.title || note.title.trim() === '' || defaultTitles.includes(note.title.trim());
      const blocksAreEmpty = !note.blocks || note.blocks.length === 0 || note.blocks.every(b => {
        if (!b) return true;
        if (b.type !== 'text') return false; // Has widget/image/audio -> NOT empty!
        const clean = (b.content || '')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/gi, ' ')
          .replace(/[\u200B\u8203\r\n\s]/g, '')
          .trim();
        return clean === '';
      });
      const currentReminders = reminders || [];
      const hasNoReminder = !currentReminders.some(r => r.noteId === noteId);

      // 3. ONLY delete if 100% confirmed that title is empty, all blocks are empty, no widgets exist, and no reminders exist!
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
    // Flush any pending active input to prevent race conditions when closing fast
    try {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.classList.contains('content-editable-block') || activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        activeEl.blur();
      }
    } catch (_) {}

    if (window.history.state && window.history.state.page === 'editor') {
      window.history.back();
    } else {
      setEditingNote(null);
    }
  };

  useEffect(() => {
    if (editingNote) {
      if (setLastEditingNoteId) setLastEditingNoteId(editingNote.id);
    } else if (lastEditingNoteId) {
      // Safely schedule cleanup with a small timeout to let all state updates settle
      const timer = setTimeout(() => {
        cleanupEmptyNote(lastEditingNoteId);
        if (setLastEditingNoteId) setLastEditingNoteId(null);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [editingNote]);

  return {
    openEditingNote,
    cleanupEmptyNote,
    handleCloseEditor
  };
}
