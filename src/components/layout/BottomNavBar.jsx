import React from 'react';
import Icons from '../common/Icons';

const BottomNavBar = ({
  activeTab,
  handleTabClick,
  handleCreateNote,
  t,
}) => {
  return (
    <>
      {/* Floating Action Buttons */}
      {activeTab === 'notes' && (
        <button
          className="fab-btn animate-fade-in"
          onClick={handleCreateNote}
          title={t('newNote')}
        >
          <Icons.Plus />
        </button>
      )}


      {/* Bottom Tab Bar */}
      <div className="bottom-nav">
        <button
          className={`nav-item ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => handleTabClick('notes')}
        >
          <Icons.Note />
          {t('notes')}
        </button>
        <button
          className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => handleTabClick('search')}
        >
          <Icons.Search />
          {t('search')}
        </button>
        <button
          className={`nav-item ${activeTab === 'shared' ? 'active' : ''}`}
          onClick={() => handleTabClick('shared')}
        >
          <Icons.Users />
          {t('sharedNotes')}
        </button>
        <button
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => handleTabClick('profile')}
        >
          <Icons.Profile />
          {t('profile')}
        </button>
      </div>
    </>
  );
};

export default BottomNavBar;
