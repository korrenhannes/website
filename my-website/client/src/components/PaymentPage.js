import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function PaymentPage() {
  const location = useLocation();
  const [plan, setPlan] = useState('');

  useEffect(() => {
    // Retrieve the selected plan from the state
    if (location.state && location.state.plan) {
      setPlan(location.state.plan);
    }
  }, [location.state]);

  const handlePayment = () => {
    // Implement payment processing logic
  };

  return (
    <div>
      <h1>Complete Your Payment</h1>
      <p>You have selected: {plan}</p>
      <button onClick={handlePayment}>Proceed to Payment</button>
    </div>
  );
}

export default PaymentPage;
