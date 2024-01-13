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
    required: false // Not all logs might have a payment plan associated with them
  },
  subscriptionID: {
    type: String,
    required: false // Not all logs might have a payment plan associated with them
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
  // Fields specific to affiliates
  isAffiliateAction: {
    type: Boolean,
    default: false
  },
  affiliateCode: {
    type: String,
    required: function() { return this.isAffiliateAction; } // Required if it's an affiliate action
  },
  referredUserEmail: {
    type: String,
    required: false // For tracking referrals, if applicable
  },
  // You can add more fields here as needed for affiliate tracking
});

// Create the model from the schema
const Log = mongoose.model('Log', logSchema);

// Export the model
module.exports = Log;
