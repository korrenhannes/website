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
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create the model from the schema
const Log = mongoose.model('Log', logSchema);

// Export the model
module.exports = Log;
