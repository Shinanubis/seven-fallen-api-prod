const CardsModel = require('../Models/Card');
const {makeData} = require('../Utils/makeData');
const {EDEN, HOLYBOOK, REGISTER} = require('../constantes/typesByCategory');
const dotenv = require('dotenv');
dotenv.config();

const Card = new CardsModel();

function checkDivinity(obj){
    return Object.keys(obj).filter(elmt => Number(obj[elmt].type) === 1).length > 1;
}

module.exports = {

    findCardsByType(req, res){
        try{
            const options = {};
            options.user_id = process.env.NODE_ENV === 'dev' ?  req.body.user_id : req.session.passport.user;

            if(req.params.deckId){
                options.deck_id = Number(req.params.deckId);
            }

            if(req.params.type){
                options.type = Number(req.params.type);
            }

            Card.getCardsByType(options)
                .then(response => res.status(response.code).json(response.message))
                .catch(err => res.status(err.code).json(err))
        }catch(e){
            res.status(e.code).json(e);
        }
    },

    async addCard(req, res){
        try {
            const options = makeData(req);
            const {params, body, user_id} = options;
 
            if(params.deckId){
                options.deckId = Number(makeData(req).params.deckId);
            }
  
            if(params.type){
                options.type = Number(makeData(req).params.type);
            }

            if(body.payload){
                options.payload = makeData(req).body.payload;
            }

            //check if owner of the deck
            let resultOwner = await Card.check(options)
            if(!resultOwner){
                throw {
                    code: 403,
                    message: 'Forbidden'
                }
            }

            //check number of divinity
            if(Number(params.type) === 1){
                if(checkDivinity(body.payload)){
                    throw {
                        code: 400,
                        message: "Should have 1 divinity max"
                    }
                };
            }


            if(EDEN.includes(Number(params.type))){
                //insert a card in eden
            }

            if(HOLYBOOK.includes(Number(params.type))){
                //insert a card in holy_books
            }

            if(REGISTER.includes(Number(params.type))){
                //insert a card in registers
            }

            // if(Object.keys(options.payload).length === 0){
            //     let response = await Card.deleteBy(['deck_id','type_id'], options.payload);
            //     res.status(response.code).json(response);
            // }

            // await Card.addCard(options)
        } catch (error) {
            return res.status(error.code).json(error);
        }
    },

    updateCardsByType(req, res){
        try{
            const options = {};
            options.user_id = process.env.NODE_ENV === 'dev' ?  req.body.user_id : req.session.passport.user;

            if(req.params.deckId){
                options.deck_id = Number(req.params.deckId);
            }

            if(req.params.type){
                options.type = Number(req.params.type);
            }

            if(req.body.payload){
                options.payload = JSON.parse(req.body.payload);
            }

            if(Number(req.params.type) === 1){
                if(checkDivinity(options.payload)){
                    throw {
                        code: 400,
                        message: "Should have 1 divinity max"
                    }
                };
            }

            Card.updateCardsByType(options)
                .then(response => res.status(response.code).json(response))
                .catch(err => res.status(err.code).json(err));

        }catch(e){
            res.status(e.code).json(e);
        }
    }
}