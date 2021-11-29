//Models
const CardsListModel = require('../Models/CardsList');

const {makeData} = require('../Utils/makeData');
const {EDEN, HOLYBOOK, REGISTER} = require('../constantes/typesByCategory');

//environment variables
const dotenv = require('dotenv');
dotenv.config();

//Utils
const { includes_all, includes_all_src } = require('../Utils/arrays'); 

//Models instance
const CardsList = new CardsListModel();

//services
const Warehouse = require("../Services/warehouse");

function checkDivinity(obj){
    return Object.keys(obj).filter(elmt => Number(obj[elmt].type) === 1).length > 1;
}

module.exports = {

    async findCardsByType(req, res){
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
            let resultOwner = await CardsList.check(options)

            if(!resultOwner){
                throw {
                    code: 403,
                    message: 'Forbidden'
                }
            }

            let warehouseResult = await Warehouse.getCardsByType(params.type);
            let arrayIdsFromWarehouse = Array.from(warehouseResult.message.keys());
            let arrayIdsFromUser = Object.keys(body.payload).map(elmt => Number(elmt));

            // check if user send the good types
            if(!includes_all_src(arrayIdsFromUser, arrayIdsFromWarehouse)){
                throw {
                    code: 400,
                    message: "This card doesn't belong to this type"
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

            //insert a card in CardsList
            let result = await CardsList.getCardsList({deck_id: params.deckId, type_id: params.type});
            let idsFromDb = result.message.map(elmt => elmt.card_id);
            let idsFromUser = Object.keys(body.payload).map(elmt => Number(elmt));
            let multipleInsert = [];

            //case if the user send an empty list
            if(Object.keys(body.payload).length === 0 && result.message.length > 0){
                  let result = await CardsList.delete({deck_id: params.deckId, type_id: params.type});
                  return res.status(result.code).json(result);
            }
            // case if user send the same cards list
            if(includes_all(idsFromUser,idsFromDb)){
                return res.status(200).json({
                    code: 200,
                    message: "Already up to date"
                })
            };

            //format datas before insert
            let formatedData = Object.keys(body.payload).map(elmt => {
                let object = warehouseResult.message.get(Number(elmt));
                return {
                    deck_id: Number(params.deckId),
                    card_id: Number(elmt),
                    type_id: Number(params.type),
                    image_path: process.env.CARDS_WAREHOUSE_STATIC + object.image_path,
                    max: object.max,
                    ec_cost: object.ec_cost,
                    qty: 1
                }
            });
               
                
            await CardsList.delete({deck_id: params.deckId, type_id: params.type});
            for(card of formatedData){
                let result = await CardsList.addCard(card);
                if(result === true){
                    multipleInsert.push(result);
                }
            }
                
                

            if(multipleInsert.every(elmt => elmt === true)){
                res.status(200).json({
                    code:200,
                    message: "Successfully updated"
                })
            }

        } catch (error) {
            console.log(error)
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