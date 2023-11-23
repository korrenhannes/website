const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).send('Email already in use');
    }

    const user = new User({ email, password });
    await user.save();
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

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) {
        console.error("JWT Error:", err);
        return res.status(500).send('Error in token generation');
      }
      res.send({ token });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).send(error.message);
  }
});

module.exports = router;
