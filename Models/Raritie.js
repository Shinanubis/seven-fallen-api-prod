const return_success = require('../Utils/returnSuccess');
const custom_errors = require('../Errors/CustomsErrors');
const pool = require('../Services/database/db');

function Raritie(){
      this.db = pool;
}

Raritie.prototype.create = async function(payload){
      try{
            let request = 'INSERT INTO rarities(raritie_id, lang_id, raritie_name) VALUES($1, $2, $3)';
            let query_params = [payload.id, payload.lang_id, payload.name];
            let result = await this.db.query(request, query_params);
            return result.rowCount === 1;
      }catch(error){
            console.log(error)
            return false;
      }
}

Raritie.prototype.emptyRarities = async function(){
      try{
            let request = 'TRUNCATE TABLE rarities';
            this.db.query(request);
      }catch(error){
            console.log(error)
      }
}

Raritie.prototype.getRaritiesList = async function (lang){
      try{
            let request = 'SELECT * FROM rarities WHERE lang_id = $1';
            let query_params = [lang];
            let {rows} = await this.db.query(request,query_params);
            return rows;
      }catch(error){
            return error;
      }
}

Raritie.prototype.upsertRaritiesList = async function(payload){
      try{
            let request = `INSERT INTO rarities(id, lang_id, raritie_name) VALUES($1, $2, $3)\n
                           ON CONFLICT (id)\n 
                           DO UPDATE SET id = $1, lang_id = $2, raritie_name = $3`;
            let query_params = [payload.id, payload.lang, payload.name];
            let result = await this.db.query(request, query_params);
            return return_success(result)
      }catch(error){
            return custom_errors(error)
      }
}

module.exports = Raritie;