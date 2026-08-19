import React, { createContext, useContext } from 'react';

const EditorContext = createContext(null);

export const EditorProvider = ({ value, children }) => {
  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    // Fallback object to avoid crashes if rendered outside provider
    return {};
  }
  return context;
};

export default EditorContext;
