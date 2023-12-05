import React from 'react';
import '../styles/UserInfo.css';

function UserInfo({ user, description }) {
  return (
    <div className="user-info">
      <h4>{user.name}</h4>
      <p>{description}</p>
    </div>
  );
}

export default UserInfo;
