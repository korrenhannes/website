const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Password is not required for social logins
  paymentPlan: { type: String, default: 'free' },
  googleId: { type: String, required: false }, // For Google OAuth
  facebookId: { type: String, required: false }, // For Facebook OAuth
  tokens: { type: String, default: '1' },
  resetPasswordToken: { type: String, required: false },
  resetPasswordExpires: { type: Date, required: false },
  dateOfSubscription: { type: Date, required: false },
  dayOfSubscription: { type: Number, required: false },
});

// Pre-save hook to hash password before saving it to the database
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare provided password with the hashed password in the database
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
