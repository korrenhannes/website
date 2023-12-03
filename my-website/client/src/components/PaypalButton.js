import React, { useState } from 'react';
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer
} from "@paypal/react-paypal-js";

const PayPalButton = () => {
  const style = { layout: "vertical" };
  const [plan, setPlan] = useState(''); // Update this as needed based on your app's logic

  // Function to create an order
  function createOrder() {
    return fetch(`http://localhost:3000/api/orders`, { // Updated to use REACT_APP_API_URL
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cart: [ // Update this part based on your actual cart items
          {
            sku: "1blwyeo8",
            quantity: 2,
          },
        ],
      }),
    })
    .then((response) => response.json())
    .then((order) => order.id);
  }

  // Function to handle order approval
  function onApprove(data) {
    return fetch(`http://localhost:3000/api/orders/${data.orderID}/capture`, { // Updated to use REACT_APP_API_URL
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.json())
    .then((orderData) => {
      // Your code here after capturing the order
    });
  }

  // Wrapper component for the PayPalButtons
  const ButtonWrapper = ({ showSpinner }) => {
    const [{ isPending }] = usePayPalScriptReducer();

    return (
      <>
        {showSpinner && isPending && <div className="spinner" />}
        <PayPalButtons
          style={style}
          disabled={false}
          forceReRender={[style]}
          fundingSource={undefined}
          createOrder={createOrder}
          onApprove={onApprove}
        />
      </>
    );
  };

  return (
    <div style={{ maxWidth: "750px", minHeight: "200px" }}>
      <PayPalScriptProvider options={{ clientId: "AVkoSETxNqk-fNzT5wZPZd-fRKOSwpoUwJzlC26D8XZJ0LcfFGP3U5LyFSzMOj9NaZg4gGvgOGWDgV0L", components: "buttons", currency: "USD" }}>
        <ButtonWrapper showSpinner={false} />
      </PayPalScriptProvider>
    </div>
  );
};

export default PayPalButton;