const WarehouseHttp = require('../Services/warehouse');

//Models
const RaritieModel = require('../Models/Raritie');
const TypeModel = require('../Models/Type');
const KingdomModel = require('../Models/Kingdom');
const ExtensionModel = require('../Models/Extension');

const Kingdom = new KingdomModel();
const Raritie = new RaritieModel();
const Type = new TypeModel();
const Extension = new ExtensionModel();

async function updateDb(){
     try{
            
            //empting all tables
            await Extension.emptyExtensions();
            await Type.emptyTypes();
            await Kingdom.emptyKingdoms();
            await Raritie.emptyRarities();

            //fetch all lists 
            let responseTypesList = await WarehouseHttp.getTypesList();
            let responseRaritiesList = await WarehouseHttp.getRaritiesList();
            let responseKingdomsList = await WarehouseHttp.getKingdomsList();
            let responseExtensionsList = await WarehouseHttp.getExtensionsList();

            let date = new Date();
            
            if(
                  responseTypesList.code === 200 && 
                  responseRaritiesList.code === 200 && 
                  responseKingdomsList.code === 200 &&
                  responseExtensionsList.code === 200
            ){
                  for(let elmt of responseTypesList.message){
                        await Type.upsertTypesList(elmt);
                  }

                  for(let elmt of responseRaritiesList.message){
                        await Raritie.upsertRaritiesList(elmt);
                  }

                  for(let elmt of responseKingdomsList.message){
                        await Kingdom.upsertKingdomsList(elmt);
                  }

                  for(let elmt of responseExtensionsList.message){
                        await Extension.upsertExtensionsList(elmt);
                  }      
            }
            console.log(`[Update Cron Job] the ${date.toLocaleString()}`);
      }catch(error){
            console.log(error)
      }
}

module.exports = {
      updateDb
};