// paypalserver.js

const express = require("express");
require("dotenv").config();
const path = require("path");
const { PayPalHttpClient, SandboxEnvironment, OrdersCreateRequest, OrdersCaptureRequest } =require( "@paypal/checkout-server-sdk");
const cors = require('cors');
const paypal = require('@paypal/checkout-server-sdk');

const router = express.Router();

// Setup CORS and JSON middleware
router.use(cors());
router.use(express.json());

// PayPal SDK environment
function environment() {
  let clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
  let clientSecret = process.env.REACT_APP_PAYPAL_CLIENT_SECRET;
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

// PayPal HTTP client
let paypalClient = new paypal.core.PayPalHttpClient(environment());

// Endpoint for creating an order
router.post("/create-order", async (req, res) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [{
      amount: {
        currency_code: "ILS",
        value: req.body.amount // Dynamically receive the amount
      }
    }]
  });

  try {
    const response = await paypalClient.execute(request);
    console.log('response:',response.result.id);
    res.json({ orderID: response.result.id }); // Send back orderID
  } catch (error) {
    console.error(error,'backend problem');
    res.status(500).send(error.message);
  }
});

// Endpoint for capturing an order
router.post("/capture-order/:orderID", async (req, res) => {
  const  orderID  = req.params.orderID;
  console.log( 'orderId start:', orderID);
  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  //request.requestBody({});
  try {
    console.log('order id befor:', orderID);
    const capture = await paypalClient.execute(request);
    //console.log(`capture Response: ${JSON.stringify(response)}`);
    res.json(capture.result);
    //console.log(`Capture: ${JSON.stringify(response.result)}`);
  } catch (error) {
    console.log('order id error:', orderID);
    console.error('capture backend error:', error);
    res.status(500).send(error.message);
  }
});

// Serve the main page
router.get("/", (req, res) => {
  res.sendFile(path.resolve("./client/index.html")); // Ensure you have the correct path to your HTML file
});

// Export the router
module.exports = router;
