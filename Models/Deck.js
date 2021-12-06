//Utils
const pagination = require('../Utils/pagination');
const return_success = require('../Utils/returnSuccess');
const arrays_utils = require('../Utils/arrays');

const custom_errors = require('../Errors/CustomsErrors');
const pool = require('../Services/database/db');

// Global variable for allowed options order_by
const allowed_order = ['id' ,'deck_name' , 'kingdom', 'num_cards'];
const allowed_kingdoms_ids = ['1', '2', '3', '4', '5', '6', '7'];

//default values
const default_page = 0;
const default_page_size = 20; 

function Deck (){
    this.db = pool;
}

Deck.prototype.isOwner = async function(options){
    try {
        let request = 'SELECT EXISTS(SELECT 1 FROM decks WHERE user_id = $1 AND id = $2)';
        let query_params = [options.user_id, options.deck_id];
        let response = await this.db.query(request, query_params);

        return response.rows[0].exists;
    } catch (error) {
        throw custom_errors(error.code);
    }
}

// Display all the shared decks
Deck.prototype.findAllVisibleDecks = async function(options) {
    try {
        let request = `SELECT id, user_id, deck_name, kingdom, num_cards, divinity FROM decks\n
                       LEFT JOIN (\n
                           SELECT deck_id, card_id AS divinity FROM (\n
                              SELECT deck_id, unnest(cards[:][1:1]) AS card_id, unnest(cards[:][2:2]) AS type_id FROM edens\n
                              )AS result WHERE type_id = '1'\n
                          ) AS divinities ON decks.id = divinities.deck_id WHERE is_visible = true`;

        let totalRequest = `SELECT COUNT(*) FROM decks\n
                            LEFT JOIN (\n
                                SELECT deck_id, card_id AS divinity FROM (\n
                                  SELECT deck_id, unnest(cards[:][1:1]) AS card_id, unnest(cards[:][2:2]) AS type_id FROM edens\n
                                  )AS result WHERE type_id = '1'\n
                                ) AS divinities ON decks.id = divinities.deck_id WHERE is_visible = true`;
        let total_params = [];
        let query_params = [];
        let counter = 0;
        let total = 0;

        if(options.divinity){
            counter += 1;
            request += ` AND divinity = $${counter}`;
            totalRequest += ` AND divinity = $${counter}`;
            query_params.push(options.divinity);
            total_params.push(options.divinity);
        }

        if(options.kingdoms){
            request += ` AND kingdom IN (${options.kingdoms})`;
            totalRequest += ` AND kingdom IN (${options.kingdoms})`;
        }

        if(options.search){
            counter += 1; 
            request += ` AND deck_name LIKE $${counter}`;
            totalRequest += ` AND deck_name LIKE $${counter}`;
            query_params.push(options.search + '%');
            total_params.push(options.search + '%');
        }
        
        if(options.order_by && allowed_order.includes(options.order_by)) {
            request += " ORDER BY " + options.order_by;
        }else{
            request += ' ORDER BY deck_name ';
        }

        if(options.sens){
            request += ' DESC'
        }

        if(options.page){
            counter += 1;
            request += ` OFFSET $${counter}`;
            query_params.push(pagination(options.page, options.size ?? default_page_size));
        }else{
            counter += 1;
            request += ` OFFSET $${counter}`;
            query_params.push(default_page);
        }

        if(options.size){
            counter += 1;
            request +=  ` FETCH NEXT $${counter} ROW ONLY`;
            query_params.push(options.size);
        }else{
            counter += 1;
            request +=  ` FETCH NEXT $${counter} ROW ONLY`;
            query_params.push(default_page_size)
        }

        let result = await this.db.query(request, query_params);
        let totalResult = await this.db.query(totalRequest, total_params);
        
        let newResult = [
            Number(totalResult.rows[0].count),
            result.rows
        ];

        return return_success(newResult);
    } catch (e) {
        return custom_errors(e);
    }
}

//Display all cards owned by a deck and by type
Deck.prototype.findAllDeckCards = async function(options){
    try{
        let request ='SELECT card_id, type_id, image_path, qty, max, ec_cost FROM cards_list WHERE deck_id = $1';
        let query_params = [];

        query_params.push(options.deck_id);

        const {rows}= await this.db.query(request, query_params);
        return return_success(rows);
    }catch(e){
        throw custom_errors(e);
    }
}

// Display all user decks
Deck.prototype.findAllUserDecks = async function (options) {
    try {
        let request = `SELECT id, deck_name, kingdom, num_cards, divinity, created_at FROM decks WHERE user_id = $1`;

        let query_params = [options.user_id];
        if(options.order_by && allowed_order.includes(options.order_by)){
            request += ' ORDER BY ' + options.order_by;
        }else{
            request += ' ORDER BY created_at';
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
        console.log("[Models Deck][findOneUserDeck]")
        throw custom_errors(e);
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
        let request = 'INSERT INTO decks(user_id, deck_name, kingdom) VALUES($1, $2, $3) RETURNING id,deck_name'
        let { rows } = await this.db.query(request, [options.user_id, options.deck_name, options.kingdom]);
        return return_success(rows);
    } catch (e) {
        e.field = options.deck_name;
        return custom_errors(e);
    }
}

Deck.prototype.addDivinity = async function(options){
    try {
        let request = 'UPDATE decks SET divinity = $2 WHERE id = $1 RETURNING *';
        let { rows } = await this.db.query(request, [options.deck_id, options.card_id]);

        return return_success(rows);
    } catch (error) {
        console.log(error)
        return custom_errors(error);
    }
}

//Update a user's deck infos
Deck.prototype.updateOne = async function (options) {
    try {
        let request_part_one = 'UPDATE decks SET ';
        let request_part_two = [];
        let request_part_three = ' WHERE user_id = $1 AND id = $2 RETURNING *';
        let counter = 2;

        let query_params = [options.user_id, options.deck_id];
        
        if(options.deck_name){
            counter += 1;
            request_part_two.push(`deck_name = $${counter}`);
            query_params.push(options.deck_name);
        }

        if(options.is_visible){
            counter += 1;
            request_part_two.push(`is_visible = $${counter}`);
            query_params.push(options.is_visible);
        }

        if(options.kingdoms){
            counter += 1; 
            request_part_two.push(`kingdom = $${counter}`);
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
        console.log("[Models Deck][updateOne] : ", e)
        e.field = options.deck_name;
        throw custom_errors(e);
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