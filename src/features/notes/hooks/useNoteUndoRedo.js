import { useState, useRef, useEffect } from 'react';
import { triggerHaptic } from '@shared/services/haptics';

// Hafif ve hızlı blok klonlayıcı (JSON.parse(JSON.stringify(...)) yerine)
const cloneBlock = (b) => {
  if (!b) return b;
  const cloned = { ...b };
  if (Array.isArray(b.items)) cloned.items = b.items.map(it => ({ ...it }));
  if (Array.isArray(b.payments)) cloned.payments = b.payments.map(p => ({ ...p }));
  return cloned;
};

// JSON stringify yapmadan blokların eşitliğini hızlıca test eden fonksiyon
const areBlocksEqual = (blocksA, blocksB) => {
  if (blocksA === blocksB) return true;
  if (!blocksA || !blocksB || blocksA.length !== blocksB.length) return false;
  for (let i = 0; i < blocksA.length; i++) {
    const a = blocksA[i];
    const b = blocksB[i];
    if (a === b) continue;
    if (!a || !b) return false;
    if (a.id !== b.id || a.type !== b.type || a.content !== b.content) return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (key === 'content' || key === 'id' || key === 'type') continue;
      const valA = a[key];
      const valB = b[key];
      if (valA !== valB) {
        if (typeof valA === 'object' && valA !== null && typeof valB === 'object' && valB !== null) {
          if (JSON.stringify(valA) !== JSON.stringify(valB)) return false;
        } else {
          return false;
        }
      }
    }
  }
  return true;
};

const useNoteUndoRedo = ({
  editingNote,
  setEditingNote,
  setNotes,
  persistNotes,
}) => {
  const [editorUndoStack, setEditorUndoStack] = useState([]);
  const [editorRedoStack, setEditorRedoStack] = useState([]);

  const undoTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const lastLengthRef = useRef(0);

  const captureUndoSnapshot = (note) => {
    if (!note) return;
    const clone = {
      title: note.title,
      blocks: (note.blocks || []).map(cloneBlock)
    };
    setEditorUndoStack(prev => {
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        if (last.title === clone.title && areBlocksEqual(last.blocks, clone.blocks)) {
          return prev;
        }
      }
      const next = [...prev, clone];
      if (next.length > 40) next.shift();
      return next;
    });
    setEditorRedoStack([]);
  };

  const handleUndo = () => {
    if (editorUndoStack.length === 0 || !editingNote) return;
    triggerHaptic('light');
    const currentClone = {
      title: editingNote.title,
      blocks: (editingNote.blocks || []).map(cloneBlock)
    };
    setEditorRedoStack(prev => [...prev, currentClone]);
    const nextUndoStack = [...editorUndoStack];
    const prevSnapshot = nextUndoStack.pop();
    setEditorUndoStack(nextUndoStack);

    setEditingNote(prev => {
      const updated = { ...prev, title: prevSnapshot.title, blocks: prevSnapshot.blocks };
      setNotes(prevNotes => {
        const nextNotes = prevNotes.map(n => n.id === prev.id ? updated : n);
        persistNotes(nextNotes);
        return nextNotes;
      });
      return updated;
    });
  };

  const handleRedo = () => {
    if (editorRedoStack.length === 0 || !editingNote) return;
    triggerHaptic('light');
    const currentClone = {
      title: editingNote.title,
      blocks: (editingNote.blocks || []).map(cloneBlock)
    };
    setEditorUndoStack(prev => [...prev, currentClone]);
    const nextRedoStack = [...editorRedoStack];
    const nextSnapshot = nextRedoStack.pop();
    setEditorRedoStack(nextRedoStack);

    setEditingNote(prev => {
      const updated = { ...prev, title: nextSnapshot.title, blocks: nextSnapshot.blocks };
      setNotes(prevNotes => {
        const nextNotes = prevNotes.map(n => n.id === prev.id ? updated : n);
        persistNotes(nextNotes);
        return nextNotes;
      });
      return updated;
    });
  };

  useEffect(() => {
    if (!editingNote) {
      setEditorUndoStack([]);
      setEditorRedoStack([]);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      isTypingRef.current = false;
    }
  }, [editingNote]);

  return {
    editorUndoStack,
    editorRedoStack,
    setEditorUndoStack,
    setEditorRedoStack,
    undoTimeoutRef,
    isTypingRef,
    lastLengthRef,
    captureUndoSnapshot,
    handleUndo,
    handleRedo,
  };
};

export default useNoteUndoRedo;
