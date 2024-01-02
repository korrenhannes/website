import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/InviteLink.css';

const InviteLink = ({ user }) => {
  const [inviteLink, setInviteLink] = useState('');
  const navigate = useNavigate();

  // Temporary function to generate a random invite code (not recommended for production)
  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  useEffect(() => {
    // Using generateInviteCode if user.inviteCode is not available
    const inviteCode = user.inviteCode || generateInviteCode();
    const link = `${window.location.origin}/signup?invite=${inviteCode}`;
    setInviteLink(link);
  }, [user]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink)
      .then(() => {
        alert('Invite link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
      });
  };

  const redirectToSignup = () => {
    navigate(`/signup?invite=${user.inviteCode}`);
  };

  return (
    <div className="invite-link-container">
      <div className="invite-link">
        <p>Your Invite Link:</p>
        <span onClick={redirectToSignup}>{inviteLink}</span>
        <button onClick={copyToClipboard}>Copy Link</button>
      </div>
    </div>
  );
};

export default InviteLink;
