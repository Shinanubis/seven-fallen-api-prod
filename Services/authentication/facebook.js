require("dotenv").config();
const FacebookStrategy = require('passport-facebook').Strategy;

// User instance model
const UserModel = require('../../Models/User.js');
const User = new UserModel();

module.exports = function (passport) {
  passport.use(new FacebookStrategy({
    graphAPIVersion: 'v10.0',
    clientID: process.env.CLIENT_ID_FB,
    clientSecret: process.env.CLIENT_SECRET_FB,
    callbackURL: process.env.FACEBOOK_CALLBACK,
    profileFields: ['id','displayName'],
  },
    function (accessToken, refreshToken, profile, done) {
      User.findOne({ facebook_id: profile.id })
        .then(currentUser => {
          if (currentUser.code === 200) {
            done(null, currentUser.message);
          } else {
            User.createOne({ username: profile.displayName, facebook_id: profile.id })
              .then(result => {
                if(result.code !== 200) throw result.message;
                return done(null, result.message);
              })
              .catch(e => {
                done(null, false);
              })
          }
        })
    })
  );
}