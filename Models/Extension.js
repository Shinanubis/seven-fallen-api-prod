const return_success = require('../Utils/returnSuccess');
const custom_errors = require('../Errors/CustomsErrors');
const pool = require('../Services/database/db');

function Extension(){
      this.db = pool;
}

Extension.prototype.emptyExtensions = async function(){
      try{
            let request = 'TRUNCATE TABLE extensions';
            this.db.query(request);
      }catch(error){
            console.log(error)
      }
}

Extension.prototype.getExtensionsList = async function (lang){
      try{
            let request = 'SELECT * FROM extensions WHERE lang_id = $1';
            let query_params = [lang];
            let {rows} = await this.db.query(request,query_params);
            return rows;
      }catch(error){
            return error;
      }
}

Extension.prototype.upsertExtensionsList = async function(payload){
      try{
            let request = `INSERT INTO extensions(id, lang_id, extension_name, short_name) VALUES($1, $2, $3, $4)\n
                           ON CONFLICT (id)\n 
                           DO UPDATE SET id = $1, lang_id = $2, extension_name = $3, short_name = $4`;
            let query_params = [payload.id, payload.lang, payload.name, payload.short_name];
            let result = await this.db.query(request, query_params);
            return return_success(result)
      }catch(error){
            return custom_errors(error)
      }
}

module.exports = Extension;