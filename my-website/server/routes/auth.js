const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Log = require('../models/logModel');
const sendEmail = require('../utils/sendEmail');
const router = express.Router();

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).send('If the email is registered, we have sent a password reset link.');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    const resetUrl = `http://localhost:3001/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      text: `Password reset link: ${resetUrl}`
    });

    res.status(200).send('If the email is registered, we have sent a password reset link.');
  } catch (error) {
    console.error("Error in forgot password route:", error);
    res.status(500).send('Error sending password reset email.');
  }
});

// Google Auth Route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  const token = jwt.sign({ userId: req.user._id }, 'your_jwt_secret');
  res.redirect('/?token=' + token);
});

// Facebook Auth Route
router.get('/facebook', passport.authenticate('facebook'));
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
  const token = jwt.sign({ userId: req.user._id }, 'your_jwt_secret');
  res.redirect('/?token=' + token);
});

// Affiliate Registration Route
router.post('/affiliate/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).send('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user = new User({
      email,
      password: hashedPassword,
      isAffiliate: true,
      affiliateCode: crypto.randomBytes(20).toString('hex')
    });

    await user.save();
    res.status(201).send({ message: 'Affiliate registered successfully' });
  } catch (error) {
    console.error('Affiliate registration error:', error);
    res.status(500).send('Error registering affiliate');
  }
});

// Affiliate Login Route
router.post('/affiliate/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, isAffiliate: true });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign({ userId: user._id, email: user.email, isAffiliate: true }, 'your_jwt_secret');
    res.send({ token });
  } catch (error) {
    console.error('Affiliate login error:', error);
    res.status(500).send('Error logging in affiliate');
  }
});

// User Signup Route
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email already in use');
    }

    const user = new User({ email, password, paymentPlan: 'free' });
    await user.save();
    const token = jwt.sign({ userId: user._id, email: user.email }, 'your_jwt_secret');
    await new Log({ action: 'User Signup', userEmail: email }).save();
    res.status(201).send({ message: 'User created successfully', token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(400).send(error.message);
  }
});

// User Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign({ userId: user._id, email: email, tokens: user.tokens}, 'your_jwt_secret');
    await new Log({ action: 'User Login', userEmail: email }).save();
    res.send({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).send(error.message);
  }
});

// Update User's Payment Plan
router.post('/update-plan', async (req, res) => {
  try {
    const { email, paymentPlan } = req.body;
    const user = await User.findOne({ email });
    let tokens = paymentPlan === 'regular' ? '10' : paymentPlan === 'premium' ? '100' : '1';
    if (!user) {
      return res.status(404).send('User not found');
    }

    user.paymentPlan = paymentPlan;
    user.tokens = tokens;
    user.dateOfSubscription = new Date();
    await user.save();

    const newToken = jwt.sign({ userId: user._id, email: user.email, tokens: tokens, dateOfSubscription: user.dateOfSubscription }, 'your_jwt_secret');
    await new Log({ action: 'Update Payment Plan', userEmail: email, paymentPlan: paymentPlan, tokens: tokens, dateOfSubscription: user.dateOfSubscription }).save();
    res.json({ message: 'Payment plan updated successfully', token: newToken });
  } catch (error) {
    console.error("Update plan error:", error);
    res.status(400).send(error.message);
  }
});

// Get User's Payment Plan
router.get('/user/payment-plan', async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json({ paymentPlan: user.paymentPlan });
  } catch (error) {
    console.error("Error fetching user payment plan:", error);
    res.status(400).send(error.message);
  }
});

// Update Tokens
router.post('/update-tokens', async (req, res) => {
  try {
    const { email, tokens } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    user.tokens = tokens.toString();
    await user.save();
    const newToken = jwt.sign({ userId: user._id, email: user.email, tokens: user.tokens, dateOfSubscription: user.dateOfSubscription }, 'your_jwt_secret');
    res.json({ message: 'Tokens updated successfully', token: newToken });
  } catch (error) {
    console.error("Update tokens error:", error);
    res.status(400).send(error.message);
  }
});

module.exports = router;
