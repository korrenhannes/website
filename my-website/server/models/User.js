const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: [function() { return !this.googleId && !this.facebookId; }, 'Password is required'] }, // Password not required if social IDs are present
  paymentPlan: { type: String, default: 'free' },
  googleId: { type: String, required: false }, // For Google OAuth
  facebookId: { type: String, required: false }, // For Facebook OAuth
  tokens: { type: String, default: '1' },
  resetPasswordToken: { type: String, required: false },
  resetPasswordExpires: { type: Date, required: false },
  dateOfSubscription: { type: Date, required: false },
  dayOfSubscription: { type: Number, required: false },
  isAffiliate: { type: Boolean, default: false },
  affiliateCode: { type: String, unique: true, sparse: true },
  isConfirmed: { type: Boolean, default: false }, // Add this line to include the isConfirmed field
  confirmationCode: { type: String, required: false }, // New field for confirmation code
  referredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  upload_complete: { type: Boolean, default: true },

  // Additional affiliate-specific fields can be added here
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.googleId || this.facebookId) {
    return next(); // Skip if password isn't changed or it's a social login
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare provided password with hashed password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false; // No password (social login case)
  }
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Error comparing password:', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);
