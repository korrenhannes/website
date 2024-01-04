const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Log = require('../models/logModel');
const sendEmail = require('../utils/sendEmail');
const sendConfirmationEmail = require('../utils/sendConfirmationEmail');
const router = express.Router();

// A more complex function to calculate earnings based on sales
function calculateEarnings(referredUsers) {
  let totalEarnings = 0;
  const commissionRate = 0.1; // For example, 10% commission on sales

  referredUsers.forEach(user => {
    // Assuming each user has a 'sales' field indicating the amount they've generated
    totalEarnings += user.sales * commissionRate;
  });

  return totalEarnings;
}

// Reset Password Route
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    
    if (!user) {
      return res.status(400).send('Password reset token is invalid or has expired.');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).send('Your password has been changed.');
  } catch (error) {
    console.error("Error in reset password route:", error);
    res.status(500).send('Error resetting password.');
  }
});

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

    const resetUrl = `https://www.cliplt.com/reset-password/${resetToken}`;
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
// Affiliate Registration Route
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).send('Email already in use');
    }

    // Directly create the user, password will be hashed in pre-save hook
    user = new User({
      email,
      password,
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
router.post('/logina', async (req, res) => {
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

// Get affiliate data
router.get('/data', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // Assuming 'req.user' contains the authenticated user's info
    const userId = req.user._id;

    // Fetch user data from the database
    const user = await User.findById(userId).populate('referredUsers');

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Construct the data to be sent
    const affiliateData = {
      totalReferrals: user.referredUsers.length,
      earnings: calculateEarnings(user.referredUsers), // Implement this function based on your logic
      referredUsers: user.referredUsers.map(u => ({
        email: u.email,
        referredDate: u.dateOfSubscription // or any other relevant date
      }))
    };

    res.json(affiliateData);
  } catch (error) {
    console.error("Error fetching affiliate data:", error);
    res.status(500).send('Error fetching affiliate data');
  }
});


router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    let { inviteCode } = req.body; // Destructure inviteCode separately

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email already in use');
    }

    // Generate a confirmation code
    const confirmationCode = crypto.randomBytes(20).toString('hex');

    // Create a new user with the confirmation code
    const newUser = new User({
      email,
      password, // Password is hashed in the User model pre-save hook
      paymentPlan: 'free',
      isConfirmed: false,
      confirmationCode,
      // other fields if necessary
    });

    await newUser.save();

    // Send a confirmation email
    await sendConfirmationEmail(email, confirmationCode);

    // Log the user signup
    await new Log({ action: 'User Signup', userEmail: email }).save();

    // If there's an inviteCode, process the referral
    if (inviteCode) {
      const referrer = await User.findOne({ affiliateCode: inviteCode });
      if (referrer) {
        referrer.referredUsers.push(newUser._id); // Add the new user's ID to the referrer's referredUsers array
        referrer.referredUserCount = referrer.referredUsers.length; // Update the count
        await referrer.save();
      }
    }

    // Sign and send the token
    const token = jwt.sign({ userId: newUser._id, email: newUser.email }, 'your_jwt_secret');
    res.status(201).send({ message: 'User created successfully. Please check your email to confirm your account.', token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).send('Error in user signup');
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

    // Log the login action
    await new Log({ action: 'User Login', userEmail: email }).save();

    // Include the isConfirmed status in the response
    res.send({ 
      token,
      isConfirmed: user.isConfirmed // Ensure this property exists on your User model
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).send(error.message);
  }
});


router.post('/send-confirmation', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email is provided and valid
    if (!email) {
      return res.status(400).send('Email is required.');
    }

    // Log for debugging
    console.log('Email received:', email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found.');
    }

    // Generate a new confirmation code
    const confirmationCode = crypto.randomBytes(20).toString('hex');
    user.confirmationCode = confirmationCode;
    await user.save();

    // Send the confirmation code via email
    await sendConfirmationEmail(email, confirmationCode);

    res.status(200).send('Confirmation code sent.');
  } catch (error) {
    console.error('Error in send-confirmation route:', error);
    res.status(500).send('Error sending confirmation code.');
  }
});





// Route to verify confirmation code
router.post('/verify-confirmation', async (req, res) => {
  const { email, confirmationCode } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found.');
    }

    if (user.confirmationCode === confirmationCode) {
      user.isConfirmed = true;
      await user.save();
      res.status(200).send('Email successfully confirmed.');
    } else {
      res.status(400).send('Invalid confirmation code.');
    }
  } catch (error) {
    console.error('Error in verify-confirmation route:', error);
    res.status(500).send('Error verifying confirmation code.');
  }
});

// Route to check if the user's email has been confirmed
router.get('/check-confirmation', async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.status(200).json({ isConfirmed: user.isConfirmed });
  } catch (error) {
    console.error('Error in /check-confirmation route:', error);
    res.status(500).send('Internal Server Error');
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

// Route to check upload_complete status
router.get('/check-upload-status', async (req, res) => {
  const userEmail = req.user.email;

  if (!userEmail) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const uploadComplete = user.upload_complete || false;
    res.json({ uploadComplete });
  } catch (error) {
    console.error('Error in /check-upload-status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

// Update Tokens
router.post('/update-tokens', async (req, res) => {
  try {
    console.log('auth updating tokens');
    const { email, tokens } = req.body;
    const user = await User.findOne({ email });
    console.log('auth email:', email, 'auth tokens:', tokens, 'auth user:', user);
    if (!user) {
      console.log('no user found!');
      return res.status(404).send('User not found');
    }
    console.log('user found, auth continue update');
    user.tokens = tokens.toString();
    if (!user.password){
      user.password = 'guest';
      console.log('guest password updated:', user.password);
    }
    await user.save();
    console.log('auth saved user');
    const newToken = jwt.sign({ userId: user._id, email: user.email, tokens: user.tokens, dateOfSubscription: user.dateOfSubscription }, 'your_jwt_secret');
    console.log('auth new token:', newToken);
    res.json({ message: 'Tokens updated successfully', token: newToken });
    console.log('updated tokens succesfully');
  } catch (error) {
    console.error("Update tokens error:", error);
    res.status(400).send(error.message);
  }
});

// Example route where a new user is added as a referral
router.post('/referral', async (req, res) => {
  try {
    const { referrerId } = req.body; // ID of the user who referred the new user
    // Logic to register the new user

    // Update referrer's referredUserCount and tokens
    const referrer = await User.findById(referrerId);
    if (referrer) {
      referrer.referredUserCount += 1;
      await referrer.incrementTokenOnReferral();
    }
    res.status(200).send('Referral processed successfully');
  } catch (error) {
    console.error("Referral processing error:", error);
    res.status(500).send('Error processing referral');
  }
});


module.exports = router;
