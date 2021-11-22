const pool = require('../Services/database/db');
const custom_errors = require('../Errors/CustomsErrors');
const return_success = require('../Utils/returnSuccess');

function Register(){
        this.db = pool;
}

Register.prototype.getRegisterCards = async function(options){
    try {
        
        let request = 'SELECT card_id FROM registers WHERE deck_id = $1 ';
        let queryParams = [options.deck_id]
        const {rows} = await this.db.query(request, queryParams);
        return return_success(rows);
    } catch (e) {
        return custom_errors(e);
    }
}

Register.prototype.getRegisterTotal = async function(options){
    try {
        let request = 'SELECT SUM(qty) As total FROM registers WHERE deck_id = $1';
        let query_params = [options.deck_id];
        let {rows} = await this.db.query(request, query_params);
        return return_success(rows[0].total);
    } catch (error) {
        return custom_errors(error);    
    }
}

module.exports = Register;