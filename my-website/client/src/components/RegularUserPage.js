import React, { useState, useEffect } from 'react';
import InviteLink from './InviteLink'; // Make sure this is correctly imported
import '../styles/NavigationBar.css';

function RegularUserPage() {
  const [user, setUser] = useState({ inviteCode: '12345' }); // For testing, provide a dummy inviteCode

  useEffect(() => {
    // Retrieve user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div>
      {/* Render InviteLink only if user data is available */}
      {user && <InviteLink user={user} />}
    </div>
  );
}

export default RegularUserPage;
