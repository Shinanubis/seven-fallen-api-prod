require('dotenv').config();

const redis = require('redis');
const passport = require("passport");
const session = require("express-session");
const express = require('express');
const app = express();
const db = require('./Services/database/db');
const cors = require("cors");
const cron = require("node-cron");

//constantes
const { EVERY_MIDNIGHT } = require('./constantes/jobsTiming');

//Jobs
const { updateDb } = require('./jobs/databaseUpdate');

let redis_store = {};
let redis_client = {};

if(process.env.NODE_ENV === 'prod'){
  redis_store = require('connect-redis')(session);
  redis_client = redis.createClient();
}

// Routes
const routeUser = require('./Routes/User');
const routeAuth = require('./Routes/Auth');
const routeProfile = require('./Routes/Profile');
const routeDecks = require("./Routes/Decks");
const routeExport = require("./Routes/Export");
const routeImport = require("./Routes/Import");

//Port setting
const PORT = process.env.NODE_PORT || 3000;
app.set("trust proxy", true)
app.use(express.urlencoded({extended:true}))
app.use(express.json())

//Jobs scheduling
cron.schedule(EVERY_MIDNIGHT, updateDb, {scheduled: true, timezone: "Europe/Paris" })

if(process.env.NODE_ENV === 'prod'){
  app.use(
    session({
      name: "seven",
      secret: process.env.SESSION_SECRET,
      cookie:{
        secure: true,
        sameSite: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
      },
      store: new redis_store({client: redis_client, ttl: 86400}),
      resave: false,
      saveUninitialized: false,
      unset:'destroy'
   })
  );

  redis_client.on('error', (err) => {
    console.log('Redis error : ', err)
  });
  
}

app.use(passport.initialize());
app.use(passport.session());

//Routes middleware
app.use('/api',routeUser);
app.use('/api',routeAuth);
app.use('/api',routeProfile);
app.use('/api', routeDecks);
app.use('/api', routeExport);
app.use('/api', routeImport);
app.get('*', function(req, res){
  res.status(404).send('Wrong place ...');
})

app.listen(PORT, function () {
  console.log(`7 fallen available on port ${PORT}`)
});