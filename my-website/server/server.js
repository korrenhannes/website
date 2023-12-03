import express from "express";
import "dotenv/config";
import path from "path";
import { PayPalHttpClient, SandboxEnvironment, orders } from "@paypal/checkout-server-sdk";
import cors from 'cors';

const PORT = 3000;
const app = express();

// Updated CORS options to match your frontend application URL
const corsOptions = {
  origin: 'http://localhost:3000', // Frontend application URL
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.static("client"));
app.use(express.json());

// PayPal Client setup
function environment() {
  let clientId = AVkoSETxNqk-fNzT5wZPZd-fRKOSwpoUwJzlC26D8XZJ0LcfFGP3U5LyFSzMOj9NaZg4gGvgOGWDgV0L;
  let clientSecret = EIsApyu-xeMbr738BnnvmjWsLQLELbhNZEkOH4LRn2uOQXswnypXoeVEFQc5VGkwtdy-Sz7GIcthG9kW;
  return new SandboxEnvironment(clientId, clientSecret);
}

function client() {
  return new PayPalHttpClient(environment());
}

const paypalClient = client();

// Create Order using PayPal SDK
const createOrder = async (cart) => {
  const request = new orders.OrdersCreateRequest();
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: "100.00", // Replace with your logic to calculate total amount
        },
      },
    ],
  });

  try {
    const order = await paypalClient.execute(request);
    return order.result;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Capture Order using PayPal SDK
const captureOrder = async (orderID) => {
  const request = new orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await paypalClient.execute(request);
    return capture.result;
  } catch (error) {
    console.error("Error capturing order:", error);
    throw error;
  }
};

// Endpoint for creating an order
app.post("/api/orders", async (req, res) => {
  try {
    const { cart } = req.body;
    const order = await createOrder(cart);
    res.json(order);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Endpoint for capturing an order
app.post("/api/orders/:orderID/capture", async (req, res) => {
  try {
    const { orderID } = req.params;
    const capture = await captureOrder(orderID);
    res.json(capture);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.resolve("./client/checkout.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Node server listening at http://localhost:${PORT}/`);
});
