const pool = require('../Services/database/db');
const custom_errors = require('../Errors/CustomsErrors');
const return_success = require('../Utils/returnSuccess');
const {EDEN, HOLYBOOK, REGISTER} = require('../constantes/typesByCategory');
const {includes_all} = require('../Utils/arrays');

function serializeByOppositeType(arr, filterBy){
    let newObj  = {};
    arr.filter((elmt) => elmt[1] !== filterBy + '')
       .map(elmt => newObj[elmt[0]]= {type: elmt[1], image_path: elmt[2], qty: elmt[3], max: elmt[4]})
    return {...newObj}
}

function serialize(arr, filterBy){
    let newObj  = {};
    arr.filter((elmt) => elmt[1] === filterBy + '')
        .map(elmt => newObj[elmt[0]]= {type: elmt[1], image_path: elmt[2],qty: elmt[3], max: elmt[4]})

    return {...newObj}
}

function deserialize(obj){
    let newObj = {...obj};
    let keyToInteger = Object.keys(newObj).map(elmt => {
        let type = newObj[elmt].type;
        let image_path = newObj[elmt].image_path;
        let max = newObj[elmt].max;
        let qty = newObj[elmt].qty;
        return [Number(elmt), type, image_path, qty, max]
    })
    return [...keyToInteger];
}

function Card(){
    this.tables_name = [];
    this.db = pool;
}

Card.prototype.check = async function(options){
    let request = "SELECT * FROM decks WHERE id = $1 AND user_id = $2";
    let result = await this.db.query(request,[options.params.deckId, options.user_id]);
    return result.rowCount > 0;

}

Card.prototype.createCard = async function(options){
        try{




        
        return return_success("Created successfully");
    }catch(e){
        return custom_errors(e)
    }
}

Card.prototype.getCardsByType = async function(options){
    try{
        let edenCards = [];
        let holybookCards = [];
        let registerCards = [];
        let result = [];
        let serializedObj = {};
        const checkOwner = "SELECT * FROM decks WHERE id = $1 AND user_id = $2";

        //check the owner of the deck
        let ownerResult = await this.db.query(checkOwner,[options.deck_id, options.user_id]);

        if(ownerResult.rows.length === 0){
            throw { code: '02000' }
        }

        
        if(EDEN.includes(options.type)){
            edenCards = await this.db.query('SELECT cards FROM edens WHERE deck_id = $1', [options.deck_id]);
            result = edenCards.rows[0].cards;
            serializedObj = serialize([...result], options.type);   
        }
        
        if(HOLYBOOK.includes(options.type)){
            holybookCards = await this.db.query('SELECT cards FROM holy_books WHERE deck_id = $1', [options.deck_id]);
            result = holybookCards.rows[0].cards;
            serializedObj = serialize([...result], options.type);
        }
        
        if(REGISTER.includes(options.type)){
            registerCards = await this.db.query('SELECT cards FROM registers WHERE deck_id = $1', [options.deck_id]);
            result = registerCards.rows[0].cards;
            serializedObj = serialize( [...result], options.type);
        }
        return return_success(serializedObj);
    }catch(e){
        return custom_errors(e)
    }
}

Card.prototype.exists = async function (table_name, payload){
    let request = 'SELECT exists(SELECT 1 FROM )'
}

Card.prototype.deleteBy = async function(allowedFields ,payload){
    try {
        let request = 'DELETE FROM ';
        request += this.table_name;
        console.log(request)
        return return_success('Hello')          
    } catch (error) {
        console.log(error)
        return custom_errors(error)
    }
}

Card.prototype.upsert = async function(payload){
    try{
        let request = `INSERT INTO cards(
                       id, lang_id, type_id, type_name, extension_id, extension_name, kingdom_id, kingdom_name, raritie_id, raritie_name,\n
                       capacities, classes, card_name, image_path, nb_max_per_deck, ec_cost\n 
                       ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)\n
                       ON CONFLICT (id)\n 
                       DO UPDATE SET id = $1, lang_id = $2, type_id = $3, type_name = $4, extension_id = $5, extension_name = $6, kingdom_id = $7,\n
                       kingdom_name = $8, raritie_id = $9, raritie_name = $10, capacities = $11, classes = $12, card_name = $13, image_path = $14, \n
                       nb_max_per_deck = $15, ec_cost = $16`;
        let query_params = [payload.id, payload.lang_id, payload.type, payload.short_name];
        let result = await this.db.query(request, query_params);
        return return_success(result)
    }catch(error){
        return custom_errors(error)
    }
}

module.exports = Card; 

