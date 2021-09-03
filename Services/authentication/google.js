require("dotenv").config();
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// User instance model
const UserModel = require('../..//Models/User.js');
const User = new UserModel();

module.exports = function (passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID_GOOGLE,
        clientSecret: process.env.CLIENT_SECRET_GOOGLE,
        callbackURL:process.env.GOOGLE_CALLBACK,
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOne({google_id: profile.id})
          .then(currentUser => {
            if (currentUser.code === 200){
              done(null, currentUser.message)
            }else{
              User.createOne({username: profile.displayName,google_id: profile.id})
              .then(result => {
                if(result.code !== 200) throw result;
                done(null,result.message)
              })
              .catch(e => {
                done(null, false)
              })
            }
          })
    })); 
}