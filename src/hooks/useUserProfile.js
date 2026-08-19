import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { DEFAULT_AVATARS } from '../constants/avatars';

export const useUserProfile = ({ user, setToast }) => {
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem('s23_profile_name') || user?.name || '';
  });
  const [myCode, setMyCode] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('friend_code, name, photo_url')
          .eq('id', user.uid)
          .maybeSingle();

        if (profile) {
          if (profile.friend_code) setMyCode(profile.friend_code);
          if (profile.name) {
            setProfileName(profile.name);
            localStorage.setItem('s23_profile_name', profile.name);
          }
        }
      } catch (e) {
        console.warn('Profile fetch error:', e);
      }
    };

    loadProfile();
  }, [user]);

  const handleUpdateName = async (newName) => {
    if (!user || !newName.trim()) return;
    setProfileName(newName);
    localStorage.setItem('s23_profile_name', newName);

    try {
      await supabase.from('profiles').upsert({ id: user.uid, name: newName });
      setToast?.({ title: '✅ Profil Güncellendi', msg: 'Kullanıcı adınız başarıyla kaydedildi.' });
    } catch (e) {
      console.warn('Profile name update error:', e);
    }
  };

  const handleSelectAvatar = async (photoUrl) => {
    if (!user) return;
    try {
      await supabase.from('profiles').upsert({ id: user.uid, photo_url: photoUrl });
      localStorage.setItem(`s23_avatar_${user.uid}`, photoUrl);
      setShowAvatarPicker(false);
      setToast?.({ title: '🖼️ Profil Fotoğrafı Güncellendi', msg: 'Profil fotoğrafınız kaydedildi.' });
    } catch (e) {
      console.warn('Avatar update error:', e);
    }
  };

  return {
    profileName,
    setProfileName,
    myCode,
    setMyCode,
    showAvatarPicker,
    setShowAvatarPicker,
    handleUpdateName,
    handleSelectAvatar,
    DEFAULT_AVATARS,
  };
};

export default useUserProfile;
