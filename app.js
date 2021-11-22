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

//Models
const TypeModel = require('./Models/Type');
const RaritieModel = require('./Models/Raritie');
const KingdomModel = require('./Models/Kingdom');
const ExtensionModel = require('./Models/Extension');

const Type = new TypeModel();
const Raritie = new RaritieModel();
const Kingdom = new KingdomModel();
const Extension = new ExtensionModel();

//Init settings app database
async function fillSettings(){

  let responseDbTypes =  await Type.getTypesList();
  let responseDbRaritie = await Raritie.getRaritiesList();
  let responseDbKingdoms = await Kingdom.getKingdomsList();
  let responseDbExtensions = await Extension.getExtensionsList()

  if(
      responseDbTypes.length === 0 ||
      responseDbRaritie.length === 0 ||
      responseDbKingdoms.length === 0 ||
      responseDbExtensions.length === 0
    ){

    //empting all tables
    await Extension.emptyExtensions();
    await Type.emptyTypes();
    await Kingdom.emptyKingdoms();
    await Raritie.emptyRarities();
    
    //fetch lists
    let responseServiceTypeList = await WarehouseHttp.getTypesList();
    let responseServiceRaritieList = await WarehouseHttp.getRaritiesList();
    let responseServiceKingdomsList = await WarehouseHttp.getKingdomsList();
    let responseServiceExtensionsList = await WarehouseHttp.getExtensionsList();

    if(
        responseServiceTypeList.code === 200 && 
        responseServiceRaritieList.code === 200 &&
        responseServiceKingdomsList.code === 200 &&
        responseServiceExtensionsList.code === 200
      ){
        
        //upsert all the lists
        for(let elmt of responseServiceTypeList.message){
              await Type.upsertTypesList(elmt);
        }

        for(let elmt of responseServiceRaritieList.message){
              await Raritie.upsertRaritiesList(elmt);
        }

        for(let elmt of responseServiceKingdomsList.message){
              await Kingdom.upsertKingdomsList(elmt);
        }

        for(let elmt of responseServiceExtensionsList.message){
              await Extension.upsertExtensionsList(elmt);
        }  

    }
  }
}

//Services 
const WarehouseHttp = require('./Services/warehouse');

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

//Setting database the first time
fillSettings();

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