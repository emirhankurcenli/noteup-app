import { useState, useRef, useEffect } from 'react';
import { triggerHaptic } from '../services/haptics';

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
      blocks: JSON.parse(JSON.stringify(note.blocks || []))
    };
    setEditorUndoStack(prev => {
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        if (last.title === clone.title && JSON.stringify(last.blocks) === JSON.stringify(clone.blocks)) {
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
      blocks: JSON.parse(JSON.stringify(editingNote.blocks || []))
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
      blocks: JSON.parse(JSON.stringify(editingNote.blocks || []))
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
