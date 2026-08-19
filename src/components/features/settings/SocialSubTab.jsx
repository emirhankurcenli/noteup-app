import React from 'react';
import MyProfileCodeCard from './social/MyProfileCodeCard';
import AddFriendInputForm from './social/AddFriendInputForm';
import IncomingRequestsList from './social/IncomingRequestsList';
import OutgoingRequestsList from './social/OutgoingRequestsList';
import FriendsListSection from './social/FriendsListSection';
import UltraGiftBannerCard from './social/UltraGiftBannerCard';

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
  userPlan,
  grantedUltraFriendCode,
  ultraGiftFrom,
  isGiftedUltra,
  handleGrantUltraGift,
  isSendingRequest,
  lang,
  isLight,
  t,
}) => {
  const pendingRequests = friendRequests.filter(r => r.toCode === myCode && !r.processed && r.status === 'pending');
  const outgoingRequests = friendRequests.filter(r => r.fromCode === myCode && !r.processed && r.status === 'pending');

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <UltraGiftBannerCard 
        isGiftedUltra={isGiftedUltra}
        ultraGiftFrom={ultraGiftFrom}
        isLight={isLight}
      />

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
        grantedUltraFriendCode={grantedUltraFriendCode}
        userPlan={userPlan}
        isGiftedUltra={isGiftedUltra}
        handleGrantUltraGift={handleGrantUltraGift}
        handleDisconnect={handleDisconnect}
        lang={lang}
        isLight={isLight}
        t={t}
      />
    </div>
  );
};

export default SocialSubTab;
