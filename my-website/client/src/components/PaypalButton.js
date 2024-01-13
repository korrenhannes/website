import React from 'react';
import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";
// At the top of your PayPalButton.js and OffersPage.js files
import updatePlanRequest from './UpdatePlanService'; // Adjust the path as necessary



const PayPalButton = ({ onSuccessfulPayment, selectedPlan, userEmail }) => { 
  let plan_id='P-3PK71724A58777006MWRINPI';
  if (process.env.REACT_APP_ENVIRONMENT!=='sandbox'){
    if (selectedPlan==='regular'){
      plan_id='P-6BL85933NM352352MMWRG7EI';
    } else if (selectedPlan==='premium'){
      plan_id='P-93724068X3761532FMWRHCQI';
    }
}
  // Function to create a subscription
  const createSubscription = (data, actions) => {
    return actions.subscription.create({
      'plan_id': plan_id // Replace with your actual plan ID
    });
  };

  // Function to handle the successful subscription
  const onApprove = (data, actions) => {
    console.log('Subscription successful:', data.subscriptionID);
    updatePlanRequest(userEmail, selectedPlan);
    if (onSuccessfulPayment) {
      onSuccessfulPayment(); // Call the passed callback
    }
  };

  // Handle errors
  const onError = (err) => {
    console.error("PayPal Checkout onError", err);
  };

  return (
      <PayPalButtons
        style={{"color": "blue", "shape": "pill"}}
        createSubscription={createSubscription}
        onApprove={onApprove}
        onError={onError}
      />
  );
};

export default PayPalButton;
