const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('./models/User'); // Adjust the path as necessary
const jwt = require('jsonwebtoken');

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          // Additional fields as needed
        });
      }
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      done(null, { user, token });
    } catch (error) {
      done(error);
    }
  }
));

// Configure Facebook OAuth Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ['id', 'emails', 'name'] // Adjust fields as needed
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ facebookId: profile.id });
      if (!user) {
        user = await User.create({
          facebookId: profile.id,
          email: profile.emails[0].value,
          // Additional fields as needed
        });
      }
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      done(null, { user, token });
    } catch (error) {
      done(error);
    }
  }
));

module.exports = passport;
