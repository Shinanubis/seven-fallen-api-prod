const return_success = require('../Utils/returnSuccess');
const custom_errors = require('../Errors/CustomsErrors');
const pool = require('../Services/database/db');

function Language(){
      this.db = pool;
};

Language.prototype.create = async function(payload){
      try{
            let request = 'INSERT INTO languages(id, lang_name) VALUES($1, $2)';
            let query_params = [payload.id, payload.name];
            let result = await this.db.query(request, query_params);
            return result.rowCount === 1;
      }catch(error){
            return false;
      }
}

module.exports = Language;