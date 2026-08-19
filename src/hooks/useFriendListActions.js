import { useState } from 'react';
import { supabase } from '../supabaseClient';

export const useFriendListActions = ({
  myCode,
  friends,
  setFriends,
  setToast,
}) => {
  const [selectedFriendCodes, setSelectedFriendCodes] = useState([]);

  const handleRemoveFriend = async (friendCode, friendName) => {
    try {
      await supabase
        .from('friend_requests')
        .delete()
        .or(`and(from_code.eq.${myCode},to_code.eq.${friendCode}),and(from_code.eq.${friendCode},to_code.eq.${myCode})`);

      const updatedFriends = friends.filter((f) => f.code !== friendCode);
      setFriends(updatedFriends);
      localStorage.setItem('s23_friends_' + myCode, JSON.stringify(updatedFriends));

      setToast?.({
        title: '🗑️ Arkadaş Çıkarıldı',
        msg: `${friendName || friendCode} arkadaş listenizden çıkarıldı.`,
      });
    } catch (e) {
      console.warn('Remove friend error:', e);
    }
  };

  const handleToggleSelectFriend = (code) => {
    setSelectedFriendCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSelectAllFriends = () => {
    if (selectedFriendCodes.length === friends.length) {
      setSelectedFriendCodes([]);
    } else {
      setSelectedFriendCodes(friends.map((f) => f.code));
    }
  };

  return {
    selectedFriendCodes,
    setSelectedFriendCodes,
    handleRemoveFriend,
    handleToggleSelectFriend,
    handleSelectAllFriends,
  };
};

export default useFriendListActions;
