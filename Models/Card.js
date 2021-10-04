const pool = require('../Services/database/db');
const custom_errors = require('../Errors/CustomsErrors');
const return_success = require('../Utils/returnSuccess');
const {EDEN, HOLYBOOK, REGISTER} = require('../constantes/typesByCategory');


function serializeByOppositeType(arr, filterBy){
    let newObj  = {};
    arr.filter((elmt) => elmt[1] !== filterBy )
       .map(elmt => newObj[elmt[0]]= {type: elmt[1], qty: elmt[2]})
    return {...newObj}
}

function serialize(arr, filterBy){
    let newObj  = {};
    arr.filter((elmt) => elmt[1] === filterBy )
       .map(elmt => newObj[elmt[0]]= {type: elmt[1], qty: elmt[2]})
    return {...newObj}
}

function deserialize(obj){
    let newObj = {...obj};
    let keyToInteger = Object.keys(newObj).map(elmt => {
        let type = newObj[elmt].type;
        let qty = newObj[elmt].qty;
        return [Number(elmt), type, qty]
    })
    return [...keyToInteger];
}

function Card(){
    this.db = pool;
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

Card.prototype.updateCardsByType = async function(options){
        try{
        let edenCards = [];
        let holybookCards = [];
        let registerCards = [];
        let result = [];

        const checkOwner = "SELECT * FROM decks WHERE id = $1 AND user_id = $2";

        //check the owner of the deck
        let ownerResult = await this.db.query(checkOwner,[options.deck_id, options.user_id]);
        if(ownerResult.rows.length === 0){
            throw { code: '02000' }
        }

        if(EDEN.includes(options.type)){
            let edenCardsBefore = await this.db.query('SELECT cards FROM edens WHERE deck_id = $1', [options.deck_id]);
            let oppositeTypeObj = serializeByOppositeType(edenCardsBefore.rows[0].cards, options.type);
            let newObj = Object.assign(oppositeTypeObj, options.payload);
            edenCards = await this.db.query('UPDATE edens SET cards = $1 WHERE deck_id = $2',[deserialize(newObj), options.deck_id]);
        }
        
        if(HOLYBOOK.includes(options.type)){
            let holybookCardsBefore = await this.db.query('SELECT cards FROM holy_books WHERE deck_id = $1', [options.deck_id]);
            let oppositeTypeObj = serializeByOppositeType(holybookCardsBefore.rows[0].cards, options.type);
            let newObj = Object.assign(oppositeTypeObj, options.payload);
            holybookCards = await this.db.query('UPDATE holy_books SET cards = $1 WHERE deck_id = $2',[deserialize(newObj), options.deck_id]);
        }

        if(REGISTER.includes(options.type)){
            let registerCardsBefore = await this.db.query('SELECT cards FROM registers WHERE deck_id = $1', [options.deck_id]);
            let oppositeTypeObj = serializeByOppositeType(registerCardsBefore.rows[0].cards, options.type);
            let newObj = Object.assign(oppositeTypeObj, options.payload);
            registerCards = await this.db.query('UPDATE registers SET cards = $1 WHERE deck_id = $2',[deserialize(newObj), options.deck_id]);
        }
        
        return return_success("Updated successfully");
    }catch(e){
        return custom_errors(e)
    }
}

module.exports = Card; 
