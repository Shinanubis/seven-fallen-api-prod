//Utils
const return_success = require('../Utils/returnSuccess');
const custom_errors = require('../Errors/CustomsErrors');
const pool = require('../Services/database/db');

function Export (){
    this.db = pool;
}

Export.prototype.findDeckCards = async function(options){
    try{
        let requestOne = "SELECT cards FROM edens AS e WHERE deck_id = $1";
        let requestTwo = "SELECT cards FROM holy_books AS h WHERE deck_id = $1";
        let requestThree = "SELECT cards FROM registers AS r WHERE deck_id = $1;";
        let request = '';

        let isVisible = await this.db.query("SELECT deck_name FROM decks WHERE id = $1 AND user_id = $2", [options.deck_id, options.user_id])
        if(isVisible.rows.length === 0){
            throw {
                code: '02000'
            };
        }

        request = [requestOne,requestTwo,requestThree].join(' UNION ALL ');
        let query_params = [options.deck_id];
        const {rows} = await this.db.query(request, query_params);
        
        if(rows.length > 0){
                let deck = {};
                deck.eden = rows[0].cards;
                deck.holy_book = rows[1].cards;
                deck.register = rows[2].cards;
            return return_success(deck);
        }

        return return_success(rows);
    }catch(e){
        return custom_errors(e)
    }   
}

module.exports = Export;
