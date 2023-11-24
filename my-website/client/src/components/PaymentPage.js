import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from 'axios'; // Ensure axios is imported

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [plan, setPlan] = useState('');
  const [userEmail, setUserEmail] = useState(''); // Add state to store user email

  useEffect(() => {
    // Assuming user's email and selected plan are passed in location.state
    if (location.state) {
      setPlan(location.state.plan);
      setUserEmail(location.state.userEmail);
    }
  }, [location.state]);

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          description: plan,
          amount: {
            // Replace with your plan's price
            value: plan === 'premium' ? "20.00" : "10.00", // Example pricing
          },
        },
      ],
    });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then(async (details) => {
      console.log("Payment Successful", details);
      // After successful payment, update the user's payment plan in the database
      try {
        const response = await axios.post('/api/auth/update-plan', { 
          email: userEmail, 
          paymentPlan: plan 
        });
        console.log('Payment plan updated successfully:', response.data);
        // Redirect to a success page or perform other actions as needed
        navigate('/success'); // Example redirect
      } catch (error) {
        console.error('Failed to update payment plan:', error);
      }
    });
  };

  const onError = (err) => {
    console.error("Payment error", err);
    // Handle errors such as payment declined or network issues
  };

  return (
    <div>
      <h1>Complete Your Payment</h1>
      <p>You have selected: {plan}</p>
      <PayPalScriptProvider options={{ "client-id": "YOUR_CLIENT_ID" }}>
        <PayPalButtons 
          createOrder={createOrder} 
          onApprove={onApprove} 
          onError={onError} 
        />
      </PayPalScriptProvider>
    </div>
  );
}

export default PaymentPage;
