import { useEffect } from 'react';

/**
 * Closes the 3-dot note context menu when the user clicks outside of it.
 */
export const useOutsideClickHandler = ({ setActiveMenuNoteId }) => {
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.three-dots-btn') && !e.target.closest('.glass-panel-menu')) {
        setActiveMenuNoteId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);
};