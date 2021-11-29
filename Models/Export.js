//Utils
const return_success = require('../Utils/returnSuccess');
const custom_errors = require('../Errors/CustomsErrors');
const pool = require('../Services/database/db');

//constantes
const {EDEN, REGISTER, HOLYBOOK} = require('../constantes/typesByCategory');

function Export (){
    this.db = pool;
}

Export.prototype.findDeckCards = async function(options){
    try{
        let requestOne = `SELECT card_id, qty FROM cards_list WHERE deck_id = $1 AND type_id IN (${EDEN.join()})`;
        let requestTwo = `SELECT card_id, qty FROM cards_list WHERE deck_id = $1 AND type_id IN (${REGISTER.join()})`;
        let requestThree = `SELECT card_id, qty FROM cards_list WHERE deck_id = $1 AND type_id IN (${HOLYBOOK.join()})`;
        let request = '';
        let deck = {};
        
        let isVisible = await this.db.query("SELECT deck_name FROM decks WHERE id = $1 AND user_id = $2", [options.deck_id, options.user_id])
        if(isVisible.rows.length === 0){
            throw {
                code: '02000'
            };
        }

        request = [requestOne,requestTwo,requestThree].join(' UNION ALL ');
        let query_params = [options.deck_id];

        const resultEdens = await this.db.query(requestOne, query_params);
        const resultRegisters = await this.db.query(requestTwo, query_params);
        const resultHolyBook = await this.db.query(requestThree, query_params);
        
        deck.eden = resultEdens.rows;
        deck.holy_book = resultHolyBook.rows;
        deck.register = resultRegisters.rows;

        return return_success(deck);
    }catch(e){
        console.log(e)
        return custom_errors(e)
    }   
}

module.exports = Export;
