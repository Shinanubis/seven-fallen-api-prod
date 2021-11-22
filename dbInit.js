//Constantes
const { LANG_ARRAY } = require('./constantes/languages');

//Services 
const WarehouseHttp = require('./Services/warehouse');

//Models
const LanguageModel = require('./Models/Language')
const TypeModel = require('./Models/Type');
const RaritieModel = require('./Models/Raritie');
const KingdomModel = require('./Models/Kingdom');
const ExtensionModel = require('./Models/Extension');

const Type = new TypeModel();
const Raritie = new RaritieModel();
const Kingdom = new KingdomModel();
const Extension = new ExtensionModel();
const Language = new LanguageModel();

//Init settings app database
module.exports.test = async function(){
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
        for(let elmt of LANG_ARRAY){
              await Language.create(elmt);
        }

        for(let elmt of responseServiceTypeList.message){
              await Type.upsertTypesList(elmt);
        }

      //   for(let elmt of responseServiceRaritieList.message){
      //         await Raritie.upsertRaritiesList(elmt);
      //   }

      //   for(let elmt of responseServiceKingdomsList.message){
      //         await Kingdom.upsertKingdomsList(elmt);
      //   }

      //   for(let elmt of responseServiceExtensionsList.message){
      //         await Extension.upsertExtensionsList(elmt);
      //   }  

    }
  }
}