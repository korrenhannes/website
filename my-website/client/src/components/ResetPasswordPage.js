import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResetPasswordForm from './ResetPassword';

function ResetPasswordPage() {
  // Extract the token from the URL
  const { token } = useParams();
  const navigate = useNavigate();


  return (
    <div>
      <h1>Reset Your Password</h1>
      <p>Please enter your new password below.</p>
      {/* Pass the token to the ResetPasswordForm */}
      <ResetPasswordForm token={token} />
    </div>
  );
}

export default ResetPasswordPage;
