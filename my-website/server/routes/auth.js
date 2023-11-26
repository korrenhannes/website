const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const Log = require('../models/logModel'); // Import the Log model
const jwt = require('jsonwebtoken');

const router = express.Router();

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

    if (existingUser) {
      return res.status(400).send('Email already in use');
    }

    const user = new User({ email, password, paymentPlan: 'free' });
    await user.save();

    // Log the signup action
    await new Log({ action: 'User Signup', userEmail: email }).save();

    res.status(201).send('User created successfully');
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

    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');

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

    if (!user) {
      return res.status(404).send('User not found');
    }

    user.paymentPlan = paymentPlan;
    await user.save();

    res.send('Payment plan updated successfully');
  } catch (error) {
    console.error("Update plan error:", error);
    res.status(400).send(error.message);
  }
});

module.exports = router;
