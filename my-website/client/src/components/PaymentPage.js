import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

function PaymentPage() {
  const location = useLocation();
  const [plan, setPlan] = useState('');

  useEffect(() => {
    if (location.state && location.state.plan) {
      setPlan(location.state.plan);
    }
  }, [location.state]);

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          description: plan,
          amount: {
            // Replace with your plan's price
            value: "10.00", 
          },
        },
      ],
    });
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then((details) => {
      console.log("Payment Successful", details);
      // Handle post-payment actions such as updating database or redirecting to a success page
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
