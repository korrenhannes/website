import React, { useState, useEffect } from 'react';
import '../styles/InviteLink.css'; // Import your stylesheet

const InviteLink = ({ user }) => {
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    const inviteCode = user.inviteCode;
    const link = `${window.location.origin}/register?invite=${inviteCode}`;
    setInviteLink(link);
  }, [user]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      alert('Invite link copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };
  

  return (
    <div className="invite-link-container">
      <div className="invite-link">
        <p>Your Invite Link:</p>
        <span>{inviteLink}</span>
        <button onClick={copyToClipboard}>Copy Link</button>
      </div>
    </div>
  );
};

export default InviteLink;
