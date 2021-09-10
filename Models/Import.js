//Utils
const return_success = require('../Utils/returnSuccess');
const custom_errors = require('../Errors/CustomsErrors');
const pool = require('../Services/database/db');


function parseArray(arr){
    let newArr = '';
    arr.unshift('{');
    arr.push('}');

    console.log("[new arr] : ", newArr) 
}

function Import (){
    this.db = pool;
}

Import.prototype.importDeck = async function(options){
    try{
        
        // parseArray(options.eden.cards)
        const edenRequest = `UPDATE edens SET cards = $1 , qty = $2 WHERE deck_id = $3 RETURNING *`;
        const holyBookRequest = 'UPDATE holy_books SET cards = $1, qty = $2 WHERE deck_id = $3 RETURNING *';
        const registerRequest = 'UPDATE registers SET cards = $1, qty = $2 WHERE deck_id = $3 RETURNING *';
        const checkOwner = "SELECT * FROM decks WHERE id = $1 AND user_id = $2";

        //check the owner of the deck
        let ownerResult = await this.db.query(checkOwner,[options.deck_id, options.user_id]);

        if(ownerResult.rows.length === 0){
            throw { code: '02000' }
        }


        // update subdecks
        const updateEden = await this.db.query(edenRequest, [options.eden.cards ,options.eden.qty,options.deck_id]);
        const updateHolyBook = await this.db.query(holyBookRequest, [options.holy_book.cards ,options.holy_book.qty,options.deck_id]);
        const updateRegister = await this.db.query(registerRequest, [options.register.cards ,options.register.qty,options.deck_id]);
        
        const {rows} = await this.db.query("SELECT * FROM decks WHERE user_id = $1 AND id = $2", [options.user_id, options.deck_id]);
        
        return return_success(rows);
    }catch(e){
        return custom_errors(e)
    }   
}

module.exports = Import;