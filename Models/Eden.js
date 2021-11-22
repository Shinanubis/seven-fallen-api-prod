const return_success = require('../Utils/returnSuccess');
const custom_errors = require('../Errors/CustomsErrors');
const pool = require('../Services/database/db');


function Eden(){
    this.db = pool;
}

Eden.prototype.getEden = async function(options){
    try {
        let request = 'SELECT card_id, qty FROM edens WHERE deck_id = $1';
        let query_params = [options.deck_id];
        let {rows} = await this.db.query(request, query_params);
        return return_success(rows);
    } catch (error) {
        return custom_errors(error);    
    }
}

Eden.prototype.getEdenTotal = async function(options){
    try {
        let request = 'SELECT SUM(qty) AS total FROM edens WHERE deck_id = $1';
        let query_params = [options.deck_id];
        let {rows} = await this.db.query(request, query_params);
        return return_success(rows[0].total);
    } catch (error) {
        return custom_errors(error);    
    }
} 

module.exports = Eden;
