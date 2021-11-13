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
        let request = `SELECT array_agg(ARRAY[card_id, image_path, card_qty, card_max]) AS cards, card_type FROM decks
                       LEFT JOIN (SELECT deck_id, unnest(cards[:][1:1]) AS card_id, unnest(cards[:][2:2]) AS card_type, unnest(cards[:][3:3]) AS image_path, unnest(cards[:][4:4]) AS card_qty, unnest(cards[:][5:5]) AS card_max FROM edens) AS eden
                       ON decks.id = eden.deck_id WHERE id = $1 GROUP BY decks.id, eden.card_type, eden.card_qty  UNION ALL
                       
                       SELECT array_agg(ARRAY[card_id, image_path, card_qty, card_max]) AS cards, card_type FROM decks 
                       LEFT JOIN (SELECT deck_id, unnest(cards[:][1:1]) AS card_id, unnest(cards[:][2:2]) AS card_type, unnest(cards[:][3:3]) AS image_path, unnest(cards[:][4:4]) AS card_qty, unnest(cards[:][5:5]) AS card_max FROM registers) AS register
                       ON decks.id = register.deck_id WHERE id = $1 GROUP BY decks.id, register.card_type, register.card_qty UNION ALL

                       SELECT array_agg(ARRAY[card_id, image_path, card_qty, card_max]) AS cards, card_type FROM decks
                       LEFT JOIN (SELECT deck_id, unnest(cards[:][1:1]) AS card_id, unnest(cards[:][2:2]) AS card_type, unnest(cards[:][3:3]) AS image_path, unnest(cards[:][4:4]) AS card_qty, unnest(cards[:][5:5]) AS card_max FROM holy_books) AS holy_book
                       ON decks.id = holy_book.deck_id WHERE id = $1 GROUP BY decks.id, holy_book.card_type, holy_book.card_qty`
        let requestTwo =`SELECT card_type, array_agg(ARRAY[card_id, card_type, image_path, qty, max]) AS cards FROM (
                            SELECT deck_id, unnest(cards[:][1:1]) AS card_id, unnest(cards[:][2:2]) AS card_type, unnest(cards[:][3:3]) AS image_path, unnest(cards[:][4:4]) AS qty, unnest(cards[:][5:5]) AS max FROM edens WHERE deck_id = $1
                        ) AS edens 
                        GROUP BY edens.card_type UNION ALL 
                         SELECT card_type, array_agg(ARRAY[card_id, card_type, image_path, qty, max]) AS cards FROM (
                            SELECT deck_id, unnest(cards[:][1:1]) AS card_id, unnest(cards[:][2:2]) AS card_type, unnest(cards[:][3:3]) AS image_path, unnest(cards[:][4:4]) AS qty, unnest(cards[:][5:5]) AS max FROM registers WHERE deck_id = $1
                         ) AS registers 
                         GROUP BY registers.card_type UNION ALL 
                        SELECT card_type, array_agg(ARRAY[card_id, card_type, image_path, qty, max]) AS cards FROM (
                            SELECT deck_id, unnest(cards[:][1:1]) AS card_id, unnest(cards[:][2:2]) AS card_type, unnest(cards[:][3:3]) AS image_path, unnest(cards[:][4:4]) AS qty, unnest(cards[:][5:5]) AS max FROM holy_books WHERE deck_id = $1
                        ) AS holy_books 
                        GROUP BY holy_books.card_type` 
        let query_params = [];
        query_params.push(options.deck_id);
        let result = await this.db.query(requestTwo, query_params);
        
        let newResult = result.rows.filter(elmt => elmt.card_type !== null);
        let newResultPerType = newResult.reduce((map, obj) =>{
            map[obj.card_type] = obj.cards.reduce((map1, elmt) => {
                map1[elmt[0]] = {image_path: elmt[2], qty: elmt[3], max: elmt[4]}
                return map1;
            },{});
            return map;
        } ,{});

        return return_success(newResultPerType);
    }catch(e){
        return custom_errors(e);
    }
}
// Display all user decks
Deck.prototype.findAllUserDecks = async function (options) {
    try {
        let request = `SELECT id, deck_name, kingdom, num_cards, divinity FROM decks\n
                       LEFT JOIN (SELECT deck_id, card_id AS divinity FROM (\n
                       SELECT deck_id, unnest(cards[:][1:1]) AS card_id, unnest(cards[:][2:2]) AS card_type FROM edens\n
                       ) AS result WHERE card_type = $2) AS divinities\n
                       ON decks.id = divinities.deck_id\n
                       WHERE user_id = $1`;
        let query_params = [options.user_id, 1];
        if(options.order_by && allowed_order.includes(options.order_by)){
            request += ' ORDER BY ' + options.order_by;
        }else{
            request += ' ORDER BY id';
        }

        if(options.sens){
            request += ' DESC';
        }

        if(options.page && options.size){
            request += ' OFFSET $3 FETCH NEXT $4 ROW ONLY';
            query_params.push(pagination(options.page, options.size), options.size);
        }else{
            request += ' OFFSET $3 FETCH NEXT $4 ROW ONLY';
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
        let request = 'INSERT INTO decks(user_id, deck_name, kingdom) VALUES($1, $2, $3) RETURNING id,deck_name'
        
        let { rows } = await this.db.query(request, [options.user_id, options.deck_name, options.kingdom]);

        //check if eden exist if not INSERT
        let edenExist = await this.db.query('SELECT 1 WHERE EXISTS(SELECT * FROM edens WHERE deck_id = $1)', [rows[0].id]);
        if(edenExist.rows.length === 0){
            let createEden = await this.db.query('INSERT INTO edens(deck_id,cards,qty) VALUES($1,$2,$3)', [rows[0].id, [], 0]);
        }

        //check if holybook exist if not INSERT
        let holyBookExist = await this.db.query('SELECT 1 WHERE EXISTS(SELECT * FROM holy_books WHERE deck_id = $1)', [rows[0].id]);
        if(holyBookExist.rows.length === 0){
            let createHoolyBook = await this.db.query('INSERT INTO holy_books(deck_id,cards,qty) VALUES($1,$2,$3)', [rows[0].id, [], 0]);
        }

        //check if register exist if not INSERT
        let registerkExist = await this.db.query('SELECT 1 WHERE EXISTS(SELECT * FROM registers WHERE deck_id = $1)', [rows[0].id])
        if(registerkExist.rows.length === 0){
            let createHoolyBook = await this.db.query('INSERT INTO registers(deck_id,cards,qty) VALUES($1,$2,$3)', [rows[0].id, [], 0]);
        }

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