const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const Log = require('../models/logModel'); // Import the Log model
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Node.js module for generating a secure token
const sendEmail = require('../utils/sendEmail'); // Import a utility function to send emails


const router = express.Router();

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Optionally, do not reveal that the email is not registered for security reasons
      return res.status(200).send('If the email is registered, we have sent a password reset link.');
    }

    // Generate a reset token and its expiration time
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

    await user.save();

    // Construct the reset link (adjust the URL to your frontend's reset password page)
    const resetUrl = `http://localhost:3001/reset-password/${resetToken}`;

    // Send an email with this link (implement the `sendEmail` function based on your email service)
    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      text: `You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the following link, or paste this into your browser to complete the process: ${resetUrl}`
    });

    res.status(200).send('If the email is registered, we have sent a password reset link.');
  } catch (error) {
    console.error("Error in forgot password route:", error);
    res.status(500).send('Error sending password reset email.');
  }
});


// Google Auth Route
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, create and send token
    const token = jwt.sign({ userId: req.user._id }, 'your_jwt_secret');
    res.redirect('/?token=' + token); // or any other way you want to send the token
  });

// Facebook Auth Route
router.get('/facebook',
  passport.authenticate('facebook'));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, create and send token
    const token = jwt.sign({ userId: req.user._id }, 'your_jwt_secret');
    res.redirect('/?token=' + token); // or any other way you want to send the token
  });

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    //  for guest signup :add checking to this if, if email  contain @ and password != guest (that means this is not a guest):
    // this way i will send an existing user error only if this is not a guest
    if (existingUser) {
      return res.status(400).send('Email already in use');
    }

    const user = new User({ email, password, paymentPlan: 'free' });
    await user.save();
    // Example for signup
    const token = jwt.sign({ userId: user._id, email: user.email }, 'your_jwt_secret');
    // Log the signup action
    await new Log({ action: 'User Signup', userEmail: email }).save();
    console.log('token:', token);
    res.status(201).send({ message: 'User created successfully', token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(400).send(error.message);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign({ userId: user._id, email: email, tokens: user.tokens}, 'your_jwt_secret');

    // Log the login action
    await new Log({ action: 'User Login', userEmail: email }).save();

    res.send({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).send(error.message);
  }
});

// New route to update the user's payment plan
router.post('/update-plan', async (req, res) => {
  try {
    const { email, paymentPlan } = req.body;
    const user = await User.findOne({ email });
    let tokens = '1';
    let currentDate = new Date();
    console.log('payment plan:', paymentPlan, 'email:', email);
    if (paymentPlan === 'regular' ) {
      tokens = '10';
    } else if (paymentPlan === 'premium'){
      tokens='100';
    }
    if (!user) {
      console.log('user not found');
      return res.status(404).send('User not found');
    }
    console.log('tokens:', tokens, 'date:', currentDate);
    user.paymentPlan = paymentPlan;
    user.tokens = tokens;
    user.dateOfSubscription= currentDate;
    await user.save();
    const newToken = jwt.sign({
      userId: user._id, 
      email: user.email, 
      tokens: tokens, 
      dateOfSubscription: currentDate
    }, 'your_jwt_secret');

    await new Log({ action: 'Update Payment Plan', userEmail: email, paymentPlan: paymentPlan, tokens: tokens,dateOfSubscription: currentDate  }).save();
    console.log('user:', user);
    res.json({ 
      message: 'Payment plan updated successfully', 
      token: newToken 
    });
  } catch (error) {
    console.error("Update plan error:", error);
    res.status(400).send(error.message);
  }
});

// New route to get the user's payment plan
router.get('/user/payment-plan', async (req, res) => {
  try {
    const { email } = req.query; // Assuming the email is passed as a query parameter
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
// Add this route to your existing routes in the backend

router.post('/update-tokens', async (req, res) => {
  try {
    const { email, tokens } = req.body;
    const user = await User.findOne({ email });
    console.log('user:', user, 'used 1 token');
    if (!user) {
      console.log('no user');
      return res.status(404).send('User not found');
    }

    user.tokens = tokens.toString(); // Convert to string as your schema expects a string
    await user.save();
    console.log(user.tokens);

    const newToken = jwt.sign({
      userId: user._id,
      email: user.email,
      tokens: user.tokens,
      dateOfSubscription: user.dateOfSubscription
    }, 'your_jwt_secret');

    res.json({ 
      message: 'Tokens updated successfully', 
      token: newToken 
    });
  } catch (error) {
    console.error("Update tokens error:", error);
    res.status(400).send(error.message);
  }
});


module.exports = router;
