const return_success = require('../Utils/returnSuccess');
const custom_errors = require('../Errors/CustomsErrors');
const pool = require('../Services/database/db');


function Eden(){
    this.db = pool;
}

Eden.prototype.exists = async function(options){
    try {
        let request = 'SELECT EXISTS FROM (SELECT * FROM edens WHERE deck_id = $1)';
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

Eden.prototype.getEden = async function(options){
    try {
        let request = 'SELECT card_id, type_id ,image_path ,max, qty FROM edens WHERE deck_id = $1 ';
        let query_params = [options.deck_id];

        if(options.type_id){
            request += "AND type_id = $2";
            query_params.push(options.type_id); 
        }

        let {rows} = await this.db.query(request, query_params);
        return return_success(rows);
    } catch (error) {
        return custom_errors(error);    
    }
}

Eden.prototype.addCard = async function (options){
    try {
        let request = 'INSERT INTO edens(deck_id, card_id, type_id, image_path, max, qty, ec_cost) VALUES($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING';
        let query_params = [options.deck_id, options.card_id, options.type_id,options.image_path ,options.max, options.qty, options.ec_cost];
        let result = await this.db.query(request, query_params);
        return result.rowCount === 1 || result.rowCount === 0;
    } catch (error) {
        console.log(error)
        throw custom_errors(error);
    }
}

Eden.prototype.delete = async function(options){
    try {
        let request = 'DELETE FROM edens WHERE deck_id = $1 ';
        let query_params = [options.deck_id];

        if(options.type_id){
            request += 'AND type_id = $2';
            query_params.push(options.type_id);
        }
    
        let result = await this.db.query(request, query_params);
        return return_success("Deleted successfully");
    } catch (error) {
        return custom_errors(error);
    }
}


module.exports = Eden;
