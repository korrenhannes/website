import React from 'react';
import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";


const PayPalButton = ({ onSuccessfulPayment, selectedPlan, amount, userEmail}) => {  
  // Function to create an order
  const createOrder = (data, actions) => {
    return fetch(`${process.env.REACT_APP_API_URL}/paypal/create-order`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'PayPal-Request-Id': '7b92603e-77ed-4896-8e78-5dea2050476a',
        'Authorization': 'Bearer 6V7rbVwmlM1gFZKW_8QtzWXqpcwQ6T5vhEGYNJDAAdn3paCgRpdeMdVYmWzgbKSsECednupJ3Zx5Xd-g'
      },
      body: JSON.stringify({ amount: amount }),
    })
    .then(response => {
      console.log('response:', response);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Log the response to see its structure
      console.log('Order response:', data);
      console.log('checking next:', data.orderID);
      if (data.orderID) {
        console.log('setting data as order id:', data.orderID);
        return data.orderID;
      } else {
        throw new Error('frontend error: Order ID not found in the response');
      }
    })
    .catch(error => {
      console.error('Error creating order:', error);
    });
  };

  // Function to capture the order after payment
  const onApprove = (data, actions) => {
    const currentOrderID = data.orderID;  // Use the orderID from the data if available
    const updatePlanRequest = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/update-plan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail, paymentPlan: selectedPlan }),
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const responseData = await response.json();
        console.log('Plan updated:', responseData);
      } catch (error) {
        console.error('Error updating plan:', error);
      }
    };
    

    return fetch(`${process.env.REACT_APP_API_URL}/paypal/capture-order/${currentOrderID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'PayPal-Request-Id': '7b92603e-77ed-4896-8e78-5dea2050476a',
        'Authorization': 'Bearer access_token6V7rbVwmlM1gFZKW_8QtzWXqpcwQ6T5vhEGYNJDAAdn3paCgRpdeMdVYmWzgbKSsECednupJ3Zx5Xd-g'
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      console.log('capture response:', response.json)
      return response.json();
    })
    .then(order => {
      // Handle successful transaction
      console.log('handle transaction', currentOrderID,'order:', order);
      updatePlanRequest();
      if (onSuccessfulPayment) {
        onSuccessfulPayment(); // Call the passed callback
      }
    })
    .catch(error => {
      // Handle error
      console.error('capture frontend error:',error, 'orderid:', currentOrderID);
    });
  };

  // Handle errors
  const onError = (err) => {
    // Handle errors
    console.error("PayPal Checkout onError, no frontend or backend", err);
  };

  return (
    <PayPalScriptProvider options={{
      "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
      currency: "ILS",
      intent: "capture"
    }}>
      <PayPalButtons
        style={{"color": "blue", "shape": "pill"}}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
