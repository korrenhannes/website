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
  referredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

// Pre-save hook to hash password before saving it to the database
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.googleId || this.facebookId) {
    return next(); // Skip hashing if password isn't changed or if it's a social login
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare provided password with the hashed password in the database
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false; // Return false if there's no password (social login case)
  }
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
