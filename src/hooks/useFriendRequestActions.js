import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { sanitizeFriendCode } from '../utils/securityUtils';
import { playChime } from '../services/soundService';

export const useFriendRequestActions = ({
  myCode,
  profileName,
  friends,
  setFriends,
  setFriendRequests,
  setToast,
  pollFriendRequests,
  prevRequestCountRef,
}) => {
  const [partnerCodeInput, setPartnerCodeInput] = useState('HUB-');
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const handleSendFriendRequest = async (onInputError) => {
    if (!partnerCodeInput.trim() || isSendingRequest) return;
    const targetCode = sanitizeFriendCode(partnerCodeInput);

    if (targetCode === myCode) {
      if (onInputError) onInputError('Kendi kodunuza istek gönderemezsiniz.');
      return;
    }

    setIsSendingRequest(true);
    let targetUserName = targetCode;
    let rpcSuccess = false;

    try {
      // 1. Try RPC Function first
      try {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc('send_friend_request', {
          p_from_code: myCode,
          p_from_name: profileName || 'Arkadaş',
          p_to_code: targetCode,
        });

        if (!rpcErr && rpcRes && rpcRes.success) {
          rpcSuccess = true;
          targetUserName = rpcRes.target_name || targetCode;
        } else if (rpcErr || (rpcRes && !rpcRes.success)) {
          const errMsg = rpcRes?.message || rpcErr?.message || '';
          if (errMsg.includes('Kendi kodunuza') || errMsg.includes('bulunamadı') || errMsg.includes('zaten arkadaş') || errMsg.includes('bekleyen bir davet')) {
            if (onInputError) onInputError(errMsg);
            setIsSendingRequest(false);
            return;
          }
        }
      } catch (rpcEx) {
        console.warn('RPC send_friend_request fallback:', rpcEx);
      }

      // 2. Direct Table Fallback
      if (!rpcSuccess) {
        const rawTarget = targetCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        const rawWithoutHub = rawTarget.replace(/^HUB/i, '');

        const { data: matchedProfiles } = await supabase
          .from('profiles')
          .select('friend_code, my_code, name, id')
          .or(`friend_code.eq.${targetCode},my_code.eq.${targetCode},friend_code.eq.${rawTarget},my_code.eq.${rawTarget}`)
          .limit(1);

        const foundProfile = matchedProfiles && matchedProfiles.length > 0 ? matchedProfiles[0] : null;

        if (!foundProfile) {
          if (onInputError) onInputError('Bu profil koduna sahip kullanıcı bulunamadı.');
          setIsSendingRequest(false);
          return;
        }

        const matchedCode = foundProfile.friend_code || foundProfile.my_code || targetCode;

        const newReqId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        const { error: insertErr } = await supabase.from('friend_requests').insert({
          id: newReqId,
          from_code: myCode,
          to_code: matchedCode,
          from_name: profileName || 'Arkadaş',
          to_name: foundProfile.name || matchedCode,
          status: 'pending',
        });

        if (insertErr) {
          if (onInputError) onInputError('İstek gönderilirken hata oluştu.');
          setIsSendingRequest(false);
          return;
        }

        targetUserName = foundProfile.name || matchedCode;
      }

      setPartnerCodeInput('HUB-');
      setToast?.({
        title: '✉️ İstek Gönderildi',
        msg: `${targetUserName} adlı kullanıcıya davet gönderildi.`,
      });
      playChime();
      pollFriendRequests();
    } catch (err) {
      if (onInputError) onInputError('Bir hata oluştu.');
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleAcceptFriendRequest = async (req) => {
    try {
      let rpcOk = false;
      try {
        const { error: rpcErr } = await supabase.rpc('accept_friend_request', {
          p_request_id: req.id,
          p_user_code: myCode,
        });
        if (!rpcErr) rpcOk = true;
      } catch (rpcEx) {}

      if (!rpcOk) {
        await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', req.id);
      }

      const newFriend = { code: req.fromCode, name: req.fromName, photo_url: req.fromPhotoUrl || null };
      const updatedFriends = [...friends.filter((f) => f.code !== req.fromCode), newFriend];
      setFriends(updatedFriends);
      localStorage.setItem('s23_friends_' + myCode, JSON.stringify(updatedFriends));

      const reqs = JSON.parse(localStorage.getItem('s23_friend_requests') || '[]');
      const updatedReqs = reqs.map((r) => (r.id === req.id ? { ...r, processed: true, status: 'accepted' } : r));
      localStorage.setItem('s23_friend_requests', JSON.stringify(updatedReqs));
      setFriendRequests(updatedReqs);

      setToast?.({
        title: '🤝 Arkadaş Eklendi',
        msg: `${req.fromName} ile artık arkadaşsınız!`,
      });
      playChime();
      pollFriendRequests();
    } catch (e) {
      setToast?.({ title: '❌ Hata', msg: 'Bir hata oluştu.' });
    }
  };

  const handleRejectFriendRequest = async (req) => {
    try {
      await supabase.from('friend_requests').delete().eq('id', req.id);
      const reqs = JSON.parse(localStorage.getItem('s23_friend_requests') || '[]');
      const updatedReqs = reqs.filter((r) => r.id !== req.id);
      localStorage.setItem('s23_friend_requests', JSON.stringify(updatedReqs));
      setFriendRequests(updatedReqs);

      setToast?.({ title: '🗑️ İstek Reddedildi', msg: 'Arkadaşlık isteği silindi.' });
      pollFriendRequests();
    } catch (e) {}
  };

  return {
    partnerCodeInput,
    setPartnerCodeInput,
    isSendingRequest,
    handleSendFriendRequest,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
  };
};

export default useFriendRequestActions;
