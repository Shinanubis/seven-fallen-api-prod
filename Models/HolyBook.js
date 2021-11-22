const pool = require('../Services/database/db');
const custom_errors = require('../Errors/CustomsErrors');
const return_success = require('../Utils/returnSuccess');

function HolyBook(){
        this.db = pool;
}

HolyBook.prototype.getHolyBookCards = async function(options){
    try {
        
        let request = 'SELECT card_id FROM holy_books WHERE deck_id = $1 ';
        let queryParams = [options.deck_id]
        const {rows} = await this.db.query(request, queryParams);
        return return_success(rows);
    } catch (error) {
        return custom_errors(error);
    }
}

HolyBook.prototype.getHolyBookTotal = async function(options){
    try {
        let request = 'SELECT SUM(qty) AS total FROM holy_books WHERE deck_id = $1';
        let query_params = [options.deck_id];
        let {rows} = await this.db.query(request, query_params);
        return return_success(rows[0].total);
    } catch (error) {
        return custom_errors(error);    
    }
}

module.exports = HolyBook;