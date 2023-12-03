import React, { useState, useEffect } from 'react';
import PayPalButton from './PayPalButton';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Ensure axios is imported

function PaymentPage() {
  const location = useLocation();
  const [plan, setPlan] = useState('');
  //const setUserEmail = useState(''); // Add state to store user email

  useEffect(() => {
    // Assuming user's email and selected plan are passed in location.state
    if (location.state) {
      setPlan(location.state.plan);
      //setUserEmail(location.state.userEmail);
    }
  }, [location.state]);


  return (
    <div>
      <h1>Complete Your Payment</h1>
      <p>You have selected: {plan}</p>
      <PayPalButton />
    </div>
  );
};

export default PaymentPage;
