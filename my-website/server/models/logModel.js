const mongoose = require('mongoose');

// Define the log schema
const logSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  paymentPlan: {
    type: String,
    required: false // This field is not required as not all logs might have a payment plan associated with them
  },
  dateOfSubscription: {
    type: Date,
    default: Date.now
    },
  timestamp: {
    type: Date,
    default: Date.now
  },
  dayOfSubscription: { 
    type: Number,
     required: false 
    },
});

// Create the model from the schema
const Log = mongoose.model('Log', logSchema);

// Export the model
module.exports = Log;
