import { useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

export const useFriendRealtimeChannel = ({ myCode, pollFriendRequests }) => {
  const channelRef = useRef(null);

  useEffect(() => {
    if (!myCode) return;

    let isMounted = true;

    try {
      // 1. Clean up any existing stale channels for this user code
      const activeChannels = supabase.getChannels();
      activeChannels.forEach((ch) => {
        if (ch && ch.topic && ch.topic.includes(`social_realtime_${myCode}`)) {
          try {
            supabase.removeChannel(ch);
          } catch (e) {}
        }
      });

      // 2. Create fresh isolated channel
      const channelName = `social_realtime_${myCode}_${Date.now()}`;
      const channel = supabase.channel(channelName);
      channelRef.current = channel;

      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
        },
        (payload) => {
          if (!isMounted) return;
          const rec = payload.new || payload.old;
          if (rec && (rec.to_code === myCode || rec.from_code === myCode)) {
            pollFriendRequests();
          }
        }
      );

      channel.subscribe((status, err) => {
        if (err) {
          console.warn(`[Realtime] social_realtime status: ${status}`, err);
        }
      });
    } catch (e) {
      console.warn('[Realtime] Failed to subscribe to friend realtime channel:', e);
    }

    return () => {
      isMounted = false;
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (e) {}
        channelRef.current = null;
      }
    };
  }, [myCode, pollFriendRequests]);
};

export default useFriendRealtimeChannel;
