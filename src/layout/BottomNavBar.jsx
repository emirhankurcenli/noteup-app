import React from 'react';
import Icons from '@shared/components/Icons';

const BottomNavBar = ({
  activeTab,
  handleTabClick,
  handleCreateNote,
  pendingShareCount = 0,
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
          <span>{t('notes')}</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => handleTabClick('search')}
        >
          <Icons.Search />
          <span>{t('search')}</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'shared' ? 'active' : ''}`}
          onClick={() => handleTabClick('shared')}
        >
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.Users />
            {pendingShareCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-8px',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  minWidth: '15px',
                  height: '15px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                  lineHeight: 1
                }}
              >
                {pendingShareCount}
              </span>
            )}
          </div>
          <span>{t('sharedNotes')}</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => handleTabClick('profile')}
        >
          <Icons.Profile />
          <span>{t('profile')}</span>
        </button>
      </div>
    </>
  );
};

export default BottomNavBar;
