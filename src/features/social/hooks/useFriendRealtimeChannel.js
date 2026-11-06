import { useEffect } from 'react';

/**
 * useFriendRealtimeChannel
 * useSharedNotesSync içindeki birleşik (unified) WebSocket kanalı üzerinden
 * tetiklenen arkadaşlık değişikliklerini dinler ve pollFriendRequests'i çalıştırır.
 * Böylece gereksiz çift WebSocket kanalı açılmasının ve bellek/pil tüketiminin önüne geçilir.
 */
export const useFriendRealtimeChannel = ({ myCode, pollFriendRequests }) => {
  useEffect(() => {
    if (!myCode) return;

    const handleFriendRequestsChanged = () => {
      pollFriendRequests();
    };

    window.addEventListener('noteup_friend_requests_changed', handleFriendRequestsChanged);

    return () => {
      window.removeEventListener('noteup_friend_requests_changed', handleFriendRequestsChanged);
    };
  }, [myCode, pollFriendRequests]);
};

export default useFriendRealtimeChannel;
