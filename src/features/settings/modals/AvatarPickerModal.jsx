import React from 'react';

const AvatarPickerModal = ({
  showAvatarPicker,
  setShowAvatarPicker,
  handleSelectAvatar,
  DEFAULT_AVATARS,
  user,
  t,
}) => {
  return (
    <>
      {showAvatarPicker && (
        <div className="avatar-picker-overlay" onClick={() => setShowAvatarPicker(false)}>
          <div className="avatar-picker-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('selectAvatar')}</h3>
            <p>{t('selectAvatarSub')}</p>

            <div className="avatar-grid">
              {DEFAULT_AVATARS.map((avatar) => {
                const isActive = user && user.photoURL === avatar.url;
                return (
                  <div
                    key={avatar.id}
                    className={`avatar-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectAvatar(avatar.url)}
                    title={avatar.name}
                  >
                    <img src={avatar.url} alt={avatar.name} />
                  </div>
                );
              })}
            </div>
            <button className="avatar-picker-close-btn" onClick={() => setShowAvatarPicker(false)}>
              {t('closeBtn')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AvatarPickerModal;
