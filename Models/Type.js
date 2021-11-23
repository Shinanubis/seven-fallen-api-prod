const return_success = require('../Utils/returnSuccess');
const custom_errors = require('../Errors/CustomsErrors');
const pool = require('../Services/database/db');

function Type(){
      this.db = pool;
}

Type.prototype.create = async function(payload){
      try{
            let request = 'INSERT INTO types(type_id, lang_id, type_name) VALUES($1, $2, $3)';
            let query_params = [payload.id, payload.lang_id, payload.name];
            let result = await this.db.query(request, query_params);
            return result.rowCount === 1;
      }catch(error){
            console.log(error)
            return false;
      }
}

Type.prototype.emptyTypes = async function(){
      try{
            let request = 'TRUNCATE TABLE types';
            this.db.query(request);
      }catch(error){
            console.log(error)
      }
}

Type.prototype.getTypesList = async function (lang){
      try{
            let request = 'SELECT * FROM types WHERE lang_id = $1';
            let query_params = [lang];
            let {rows} = await this.db.query(request,query_params);
            return rows;
      }catch(error){
            return error;
      }
}

Type.prototype.upsertTypesList = async function(payload){
      try{
            let request = `INSERT INTO types(id, lang_id, type_name) VALUES($1, $2, $3)\n
                           ON CONFLICT (id)\n 
                           DO UPDATE SET id = $1, lang_id = $2, type_name = $3`;
            let query_params = [payload.id, payload.lang_id, payload.name];
            let result = await this.db.query(request, query_params);
            return return_success(result)
      }catch(error){
            console.log(error)
            return custom_errors(error)
      }
}

module.exports = Type;