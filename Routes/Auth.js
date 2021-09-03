const express = require('express');
const router = express.Router({mergeParams: true});
const passport = require('passport');
const initializeFacebookStrategy = require('../Services/authentication/facebook');
const initializeGoogleStrategy = require('../Services/authentication/google');
const UserModel = require('../Models/User');
const User = new UserModel();
const {isAuthenticatedResponse} = require('../Middlewares/auth')

passport.serializeUser((user, done) =>{
    if(!user.id) {
      return done(null, false);
    };
    return done(null, user.id);
  })
  
passport.deserializeUser((id, done) =>{
  User.findOne({id})
      .then(user => {
        done(null, user)
      })
})

// Init Login Strategies
initializeFacebookStrategy(passport);
initializeGoogleStrategy(passport);

router.get('/auth/user' ,isAuthenticatedResponse);

router.get('/auth/facebook',passport.authenticate('facebook'));
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  failureRedirect: "/",
  successRedirect: "/"
}));

router.get('/auth/google', passport.authenticate('google',{ scope: ['profile'] }));
router.get('/auth/google/callback', passport.authenticate('google',{
  failureRedirect: "/",
  successRedirect:"/"
}));

router.get('/auth/logout', (req,res) => {
  req.logout();
  res.redirect('/login');
})

module.exports = router;