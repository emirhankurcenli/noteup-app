import React from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { convertHeicToJpegIfNecessary } from '../common/AppModals';
import AvatarCropper from '../features/auth/AvatarCropper';

const AvatarPickerModal = ({
  showAvatarPicker,
  setShowAvatarPicker,
  userPlan,
  setToast,
  setShowPaywall,
  cropperImage,
  setCropperImage,
  handleSelectAvatar,
  DEFAULT_AVATARS,
  user,
  checkAndRequestPermission,
  theme,
  t,
}) => {
  const handleUploadPhoto = () => {
    if (userPlan === 'lite') {
      setToast({
        title: '⭐ Pro Özellik',
        msg: 'Özel profil resmi yükleme Pro ve Ultra planlarına özeldir.',
      });
      setShowAvatarPicker(false);
      setShowPaywall(true);
    } else {
      if (Capacitor.isNativePlatform()) {
        Camera.getPhoto({
          quality: 80,
          width: 1024,
          height: 1024,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Photos,
        }).then((image) => {
          if (image) {
            const dataUrl = image.dataUrl || (image.base64String ? `data:image/jpeg;base64,${image.base64String}` : image.webPath);
            setCropperImage(prev => {
              if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
              return dataUrl;
            });
            setShowAvatarPicker(false);
          }
        }).catch((err) => {
          console.log('Native photo picker cancelled/failed:', err);
        });
      } else {
        checkAndRequestPermission('storage').then((granted) => {
          if (!granted) return;
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = async (event) => {
            let file = event.target.files?.[0];
            if (!file) return;
            setToast({ title: "⏳ Görsel Hazırlanıyor...", msg: "Görsel işleniyor." });
            file = await convertHeicToJpegIfNecessary(file);
            const blobUrl = URL.createObjectURL(file);
            setCropperImage(prev => {
              if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
              return blobUrl;
            });
            setShowAvatarPicker(false);
          };
          input.click();
        });
      }
    }
  };

  return (
    <>
      {showAvatarPicker && (
        <div className="avatar-picker-overlay" onClick={() => setShowAvatarPicker(false)}>
          <div className="avatar-picker-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('selectAvatar')}</h3>
            <p>{t('selectAvatarSub')}</p>

            {/* Custom Avatar Upload (Pro & Ultra feature) */}
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleUploadPhoto}
                style={{
                  background: userPlan === 'lite' ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  border: userPlan === 'lite' ? '1px dashed rgba(255,255,255,0.2)' : 'none',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>Özel Fotoğraf Yükle {userPlan === 'lite' ? '(Pro)' : ''}</span>
              </button>
            </div>

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

      {cropperImage && (
        <AvatarCropper
          imageSrc={cropperImage}
          theme={theme}
          onCancel={() => {
            if (cropperImage && cropperImage.startsWith('blob:')) {
              URL.revokeObjectURL(cropperImage);
            }
            setCropperImage(null);
          }}
          onCrop={(croppedDataUrl) => {
            if (cropperImage && cropperImage.startsWith('blob:')) {
              URL.revokeObjectURL(cropperImage);
            }
            handleSelectAvatar(croppedDataUrl);
            setCropperImage(null);
          }}
        />
      )}
    </>
  );
};

export default AvatarPickerModal;
