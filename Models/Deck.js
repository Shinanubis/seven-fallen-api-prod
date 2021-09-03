//Utils
const pagination = require('../Utils/pagination');
const return_success = require('../Utils/returnSuccess');
const arrays_utils = require('../Utils/arrays');

const custom_errors = require('../Errors/CustomsErrors');
const pool = require('../Services/database/db');

// Global variable for allowed options order_by
const allowed_order = ['id' ,'deck_name' ,'kingdom' ,'total_ec' , 'num_cards'];
const allowed_kingdoms_ids = ['1', '2', '3', '4', '5', '6', '7'];

function Deck (){
    this.db = pool;
}

// Display all the shared decks
Deck.prototype.findAllVisibleDecks = async function(options) {
    try {
        let request = 'SELECT id, deck_name, is_visible, total_ec, kingdom, description, num_cards FROM decks WHERE is_visible = true ORDER BY ';
        let query_params = [];

        if(options.order_by && allowed_order.includes(options.order_by)){
            request += options.order_by;
        }else{
            request += 'id';
        }

        if(options.sens){
            request += ' DESC';
        };

        if(options.page && options.size){
            request += ' OFFSET $1 FETCH NEXT $2 ROW ONLY';
            query_params.push(pagination(options.page, options.size), options.size);
        }

        const { rows } = await this.db.query(request,query_params);
        return return_success(rows);
    } catch (e) {
        return custom_errors(e);
    }
}

// Display all user decks
Deck.prototype.findAllUserDecks = async function (options) {
    try {
        let request = 'SELECT id, deck_name, kingdom, num_cards FROM decks WHERE user_id = $1 '; 
        let query_params = [options.user_id];
        if(options.order_by && allowed_order.includes(options.order_by)){
            request += 'ORDER BY ' + options.order_by;
        }else{
            request += 'ORDER BY id';
        }

        if(options.sens){
            request += ' DESC';
        }

        if(options.page && options.size){
            request += ' OFFSET $2 FETCH NEXT $3 ROW ONLY';
            query_params.push(pagination(options.page, options.size), options.size);
        }else{
            request += ' OFFSET $2 FETCH NEXT $3 ROW ONLY';
            query_params.push(pagination(1, 10), 10);
        }
        const counter = await this.db.query("SELECT COUNT(*) as total FROM decks WHERE user_id = $1", [options.user_id]);
        const { rows } = await this.db.query(request, query_params);
        const newObj = [
            counter.rows[0].total - 0,
            ...rows
        ]
        return return_success(newObj);
    } catch (e) {
        return custom_errors(e);
    }
}

//Display a deck owned by the user 
Deck.prototype.findOneUserDeck = async function (options) {
    try {
        let request = 'SELECT id, deck_name, kingdom, num_cards, is_visible FROM decks WHERE user_id = $1 ';
        let queryParams = [options.user_id]
        if(options.deck_id) {
            request += 'AND id = $2'
            queryParams.push(options.deck_id);
        };
        const {rows} = await this.db.query(request, queryParams);
        if(rows.length === 0){
            throw {code: '02000'}
            
        }
        return return_success(rows[0]);
    } catch (e) {
        return custom_errors(e);
    }
}

//Display multiple decks owned by the user belonging to a specific kingdom
Deck.prototype.findManyByKingdom = async function (options) {
    try {
        let request = 'SELECT id, deck_name, is_visible, total_ec, description, num_cards FROM decks WHERE user_id = $1';
        let query_params = [options.user_id];
        let counter = 1;
        if(options.kingdoms && arrays_utils.includes_all(allowed_kingdoms_ids, options.kingdoms)) {
            if(options.mode === "unique" || options.mode === "combination"){
                counter += 1;
                request += ' AND kingdom = $' + counter;
                query_params.push('{' + options.kingdoms.join(',') + '}');
            }


            if(options.kingdoms && !options.mode){
                request += options.kingdoms.map(elmt => {
                    return ' AND ' + elmt + ' = ANY(kingdom)' 
                }).join(' ');
            }
        }

        if(options.order_by && allowed_order.includes(options.order_by)){
            request += ' ORDER BY ' + options.order_by;
        }else{
            request += ' ORDER BY id';
        }

        if(options.sens) request += ' DESC';
        if(options.page && options.size){
            counter +=1;
            request += ' OFFSET $' + counter;
            counter += 1;
            request += ' FETCH NEXT $' + counter +' ROW ONLY';
            query_params.push(pagination(options.page, options.size), options.size);
        }
        const { rows } = await this.db.query(request, query_params);
        return return_success(rows);
    } catch (e) {
        return custom_errors(e);
    }
}

//Create a deck
Deck.prototype.createOne = async function (options) {
    try {
        let request = 'INSERT INTO decks(user_id, deck_name, kingdom) VALUES($1, $2, $3) RETURNING deck_name;'
        let { rows } = await this.db.query(request, [options.user_id, options.deck_name, options.kingdom]);
        return return_success(rows);
    } catch (e) {
        e.field = options.deck_name;
        return custom_errors(e);
    }
}

//Update a user's deck infos
Deck.prototype.updateOne = async function (options) {
    try {
        let request_part_one = 'UPDATE decks SET ';
        let request_part_two = 'WHERE user_id = $1 AND id = $2';
        let request_part_three = 'RETURNING *';
        let counter = 2;

        let query_params = [options.user_id, options.deck_id];
        
        if(options.deck_name){
            counter += 1;
            request_part_one += 'deck_name = $' + counter + ', ';
            query_params.push(options.deck_name);
        }

        if(options.description){
            counter += 1;
            request_part_one += 'description  = $' + counter + ', ';
            query_params.push(options.description);
        }

        if(options.is_visible){
            counter += 1;
            request_part_one += 'is_visible = $' + counter + ', ';
            query_params.push(options.is_visible);
        }

        if(arrays_utils.includes_all(allowed_kingdoms_ids, options.kingdoms.split(','))){
            counter += 1; 
            request_part_one += 'kingdom = $' + counter + ' ';
            query_params.push(options.kingdoms);
        }

        let request = request_part_one + request_part_two + request_part_three;
        const { rows } = await this.db.query(request, query_params);
        if(rows.length === 0){
            throw {
                code: '02000'
            }
        }
        return return_success(rows);
    } catch (e) {
        e.field = options.deck_name;
        return custom_errors(e);
    }
}

//Delete a user's deck
Deck.prototype.deleteOne = async function (options) {
    try {
        let request = 'DELETE FROM decks WHERE user_id = $1 AND id = $2 RETURNING deck_name';
        let query_params = [options.user_id, options.deck_id];
        
        let result = await this.db.query(request, query_params);
        if(result.rowCount === 0) throw {code: '02000'};
        return return_success(result.rows[0].deck_name + ' deleted successfully');
    } catch (e) {
        return custom_errors(e);
    }
}

module.exports = Deck;