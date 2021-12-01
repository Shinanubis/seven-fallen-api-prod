const return_success = require('../Utils/returnSuccess');
const custom_errors = require('../Errors/CustomsErrors');
const pool = require('../Services/database/db');


function CardsList(){
    this.db = pool;
}

CardsList.prototype.exists = async function(options){
    try {
        let request = 'SELECT EXISTS FROM (SELECT * FROM cards_list WHERE deck_id = $1)';
        let query_params = [options.deck_id];
        let {rows} = await this.db.query(request, query_params);
        return return_success(rows);
    } catch (error) {
        return custom_errors(error);    
    }
}

CardsList.prototype.check = async function(options){
    let request = "SELECT * FROM decks WHERE id = $1 AND user_id = $2";
    let result = await this.db.query(request,[options.params.deckId, options.user_id]);
    return result.rowCount > 0;

}

CardsList.prototype.getCardsSubSetTotal = async function(options){
    try {
        let request = 'SELECT COALESCE(SUM(qty),0) AS total FROM cards_list WHERE deck_id = $1 AND type_id = ANY($2)';
        let query_params = [options.deck_id, options.set];
        let {rows} = await this.db.query(request, query_params);
        return return_success(rows[0].total);
    } catch (error) {
        console.log(error)
        return custom_errors(error);    
    }
}

CardsList.prototype.getCardsListTotal = async function(options){
    try {
        let request = 'SELECT SUM(qty) AS total FROM cards_list WHERE deck_id = $1';
        let query_params = [options.deck_id];
        let {rows} = await this.db.query(request, query_params);
        return return_success(rows[0].total);
    } catch (error) {
        console.log(error)
        return custom_errors(error);    
    }
}

CardsList.prototype.getCardsByType = async function(options){
    try {

        let request = "SELECT card_id, type_id ,image_path, max, qty, ec_cost FROM cards_list WHERE deck_id = $1 AND type_id = $2";
        let query_params = [options.user_id, options.type_id];
        let {rows} = await this.db.query(request, query_params);
        return return_success(rows)
    } catch (error) {
        throw custom_errors(error);
    }
}

CardsList.prototype.getCardsList = async function(options){
    try {
        let request = 'SELECT card_id, type_id ,image_path ,max, qty FROM cards_list WHERE deck_id = $1 ';
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

CardsList.prototype.addCard = async function (options){
    try {
        let request = 'INSERT INTO cards_list(deck_id, card_id, type_id, image_path, max, qty, ec_cost) VALUES($1, $2, $3, $4, $5, $6, $7)';
        let query_params = [options.deck_id, options.card_id, options.type_id,options.image_path ,options.max, options.qty, options.ec_cost];
        let result = await this.db.query(request, query_params);
        return result.rowCount === 1 || result.rowCount === 0;
    } catch (error) {
        console.log("[Models CardsList][addCard] : ", error)
        throw custom_errors(error);
    }
}

CardsList.prototype.updateCard = async function (options){
    try {
        let request = "UPDATE cards_list SET qty = $1 WHERE deck_id = $2 AND card_id = $3 RETURNING *";
        let query_params = [options.qty, options.deck_id, options.card_id];
        let result = await this.db.query(request, query_params);
        if(result.rowCount === 0){
            throw {
                code: 500
            }
        }
        return return_success(result.rows);
    } catch (error) {
        console.log("[Models CardsList][updateCard] : ", error)
        throw custom_errors(error);
    }
}

CardsList.prototype.deleteCard = async function(options){
    try {
        let request = 'DELETE FROM cards_list WHERE deck_id=$1 AND card_id = $2 RETURNING *';
        let query_params = [options.deck_id, options.card_id];
        let result = await this.db.query(request, query_params);
        return return_success(result.rows);
    } catch (error) {
        throw custom_errors(error.code);
    }
}

CardsList.prototype.delete = async function(options){
    try {
        let request = 'DELETE FROM cards_list WHERE deck_id = $1 ';
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


module.exports = CardsList;
