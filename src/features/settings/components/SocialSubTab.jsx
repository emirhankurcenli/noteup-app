import React from 'react';
import MyProfileCodeCard from '@features/social/components/MyProfileCodeCard';
import AddFriendInputForm from '@features/social/components/AddFriendInputForm';
import IncomingRequestsList from '@features/social/components/IncomingRequestsList';
import OutgoingRequestsList from '@features/social/components/OutgoingRequestsList';
import FriendsListSection from '@features/social/components/FriendsListSection';

const SocialSubTab = ({
  myCode,
  setToast,
  partnerCodeInput,
  setPartnerCodeInput,
  formatFriendCode,
  handleSendFriendRequest,
  friendRequests = [],
  handleAcceptFriendRequest,
  handleRejectFriendRequest,
  handleCancelFriendRequest,
  friends = [],
  handleDisconnect,
  isSendingRequest,
  lang,
  isLight,
  t,
}) => {
  const pendingRequests = friendRequests.filter(r => r.toCode === myCode && !r.processed && r.status === 'pending');
  const outgoingRequests = friendRequests.filter(r => r.fromCode === myCode && !r.processed && r.status === 'pending');

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <MyProfileCodeCard 
        myCode={myCode}
        setToast={setToast}
        lang={lang}
        isLight={isLight}
        t={t}
      />

      <AddFriendInputForm 
        partnerCodeInput={partnerCodeInput}
        setPartnerCodeInput={setPartnerCodeInput}
        formatFriendCode={formatFriendCode}
        handleSendFriendRequest={handleSendFriendRequest}
        isSendingRequest={isSendingRequest}
        lang={lang}
        isLight={isLight}
        t={t}
      />

      <IncomingRequestsList 
        pendingRequests={pendingRequests}
        handleAcceptFriendRequest={handleAcceptFriendRequest}
        handleRejectFriendRequest={handleRejectFriendRequest}
        lang={lang}
        isLight={isLight}
        t={t}
      />

      <OutgoingRequestsList 
        outgoingRequests={outgoingRequests}
        handleCancelFriendRequest={handleCancelFriendRequest}
        lang={lang}
        isLight={isLight}
      />

      <FriendsListSection 
        friends={friends}
        handleDisconnect={handleDisconnect}
        lang={lang}
        isLight={isLight}
        t={t}
      />
    </div>
  );
};

export default SocialSubTab;
