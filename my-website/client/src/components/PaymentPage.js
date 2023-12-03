import React, { useState, useEffect } from 'react';
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer
} from "@paypal/react-paypal-js";

function PaymentPage() {
  const style = {"layout":"vertical"};
  const [plan, setPlan] = useState('');
  function createOrder() {
    // replace this url with your server
    return fetch("https://react-paypal-js-storybook.fly.dev/api/paypal/create-order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // use the "body" param to optionally pass additional order information
        // like product ids and quantities
        body: JSON.stringify({
            cart: [
                {
                    sku: "1blwyeo8",
                    quantity: 2,
                },
            ],
        }),
    })
        .then((response) => response.json())
        .then((order) => {
            // Your code here after create the order
            return order.id;
        });
}
function onApprove(data) {
    // replace this url with your server
    return fetch("https://react-paypal-js-storybook.fly.dev/api/paypal/capture-order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            orderID: data.orderID,
        }),
    })
        .then((response) => response.json())
        .then((orderData) => {
            // Your code here after capture the order
        });
}

  // Example function to show a result to the user. You can customize this function.
  const resultMessage = (message) => {
    const container = document.querySelector("#result-message");
    container.innerHTML = message;
  };
  const ButtonWrapper = ({ showSpinner }) => {
    const [{ isPending }] = usePayPalScriptReducer();

    return (
        <>
            { (showSpinner && isPending) && <div className="spinner" /> }
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
    }

  return (
    <div>
      <h1>Complete Your Payment</h1>
      <p>You have selected: {plan}</p>
      <PayPalScriptProvider options={{ clientId: "test", components: "buttons", currency: "USD" }}>
        <ButtonWrapper showSpinner={false} />
      </PayPalScriptProvider>    </div>
  );
};

export default PaymentPage;
