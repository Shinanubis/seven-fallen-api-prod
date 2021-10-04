const CardsModel = require('../Models/Card');
const dotenv = require('dotenv');
dotenv.config();

const Card = new CardsModel();

function checkDivinity(obj){
    return Object.keys(obj).filter(elmt => obj[elmt].type === 1).length === 1 || Object.keys(obj).filter(elmt => obj[elmt].type === 1).length === 0;
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
                if(!checkDivinity(options.payload)){
                    throw {
                        code: 400,
                        message: "Should have 1 divinity max"
                    }
                };
            }

            Card.updateCardsByType(options)
                .then(response => res.status(response.code).json(response.message))
                .catch(err => res.status(err.code).json(err.message))
        }catch(e){
            res.status(e.code).json(e);
        }
    }
}