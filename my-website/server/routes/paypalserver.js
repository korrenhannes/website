// paypalserver.js

const express = require("express");
require("dotenv").config();
const path = require("path");
const { PayPalHttpClient, SandboxEnvironment, OrdersCreateRequest, OrdersCaptureRequest } =require( "@paypal/checkout-server-sdk");
const cors = require('cors');
const paypal = require('@paypal/checkout-server-sdk');
const passport = require('passport');
const fetch = require('node-fetch');

const router = express.Router();

// Setup CORS and JSON middleware
router.use(cors());
router.use(express.json());
function btoa(str) {
  return Buffer.from(str, 'binary').toString('base64');
}

// PayPal SDK environment
function environment() {
  let clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
  let clientSecret = process.env.REACT_APP_PAYPAL_CLIENT_SECRET;
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}
const paypalBaseUrl = process.env.PAYPAL_ENV === 'live' 
    ? 'https://api.paypal.com' 
    : 'https://api-m.sandbox.paypal.com';
async function getPayPalAccessToken() {
  const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.REACT_APP_PAYPAL_CLIENT_SECRET;

  const url = `${paypalBaseUrl}/v1/oauth2/token`; // Use the correct endpoint
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
  };
  const body = 'grant_type=client_credentials';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    });

    const data = await response.json();
    return data.access_token; // This is your access token
  } catch (error) {
    console.error('Error fetching PayPal access token:', error);
    throw error;
  }
}
// PayPal HTTP client
let paypalClient = new paypal.core.PayPalHttpClient(environment());
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ['https://www.cliplt.com', 'http://localhost:3001'];
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true,
};
// Add a new route for creating a subscription
router.post("/create-subscription", async (req, res) => {
  const request = new paypal.subscriptions.SubscriptionsCreateRequest();
  request.requestBody({
    // Define your subscription details here
    plan_id: req.body.planId, // Plan ID from the client
    // Other subscription details...
  });

  try {
    const response = await paypalClient.execute(request);
    res.json({ subscriptionID: response.result.id });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).send(error.message);
  }
});
router.post("/paypal-webhook", async (req, res) => {
  const webhookEvent = req.body;

  // Validate the webhook signature here
  // PayPal SDK provides functions for signature validation

  switch (webhookEvent.event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED':
          console.log('susbscription created');
          break;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
          console.log('susbscription canceled');
          break;
      // Handle other event types as needed
      case 'BILLING.SUBSCRIPTION.UPDATED':
        console.log('susbscription updated');
  }

  res.status(200).send('Webhook Received');
});

router.post("/cancel-subscription",passport.authenticate('jwt', { session: false }),
cors(corsOptions), async (req, res) => {
  const userSubscription = req.body.subscriptionID;
  if (!userSubscription) {
    res.status(404).send("Subscription not found.");
    return;
  }
  const accessToken = await getPayPalAccessToken();
  const url = `${paypalBaseUrl}/v1/billing/subscriptions/${userSubscription}/cancel`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}` // Replace with your actual access token
  };
  const body = JSON.stringify({ "reason": "Not satisfied with the service" });

  try {
    const response = await fetch(url, { method: 'POST', headers: headers, body: body });
    if (response.ok) {
      res.json({ success: true });
    } else {
      throw new Error('Failed to cancel subscription');
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).send(error.message);
  }
});




// Serve the main page
router.get("/", (req, res) => {
  res.sendFile(path.resolve("./client/index.html")); // Ensure you have the correct path to your HTML file
});

// Export the router
module.exports = router;
