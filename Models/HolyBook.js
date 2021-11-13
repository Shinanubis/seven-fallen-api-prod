const pool = require('../Services/database/db');
const custom_errors = require('../Errors/CustomsErrors');
const return_success = require('../Utils/returnSuccess');

function HolyBook(){
        this.db = pool;
}

HolyBook.prototype.getHolyBook = async function(options){
    try {
        let request = 'SELECT * FROM holy_books WHERE deck_id = $1 ';
        let queryParams = [options.deck_id]
        const {rows} = await this.db.query(request, queryParams);
        if(rows.length === 0){
            throw {code: '02000'}
            
        }
        return return_success(rows[0]);
    } catch (e) {
        return custom_errors(e);
    }
}

module.exports = HolyBook;