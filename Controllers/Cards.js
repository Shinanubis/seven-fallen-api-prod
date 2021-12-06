//Models
const CardsListModel = require('../Models/CardsList');
const DeckModel = require('../Models/Deck');

const {makeData} = require('../Utils/makeData');
const {EDEN, HOLYBOOK, REGISTER, TYPES} = require('../constantes/typesByCategory');

//environment variables
const dotenv = require('dotenv');
dotenv.config();

//Utils
const { includes_all, includes_all_src, differences } = require('../Utils/arrays'); 

//Models instance
const CardsList = new CardsListModel();
const Deck = new DeckModel();

//services
const Warehouse = require("../Services/warehouse");

function checkDivinity(obj){
    return Object.keys(obj).length > 1;
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
                options.type_id = Number(req.params.type);
            }
            
            let isOwner = await Deck.isOwner(options);
        
            if(isOwner){
                    
                    let response = await CardsList.getCardsByType(options);

                    let newObj = {};
                    response.message.map(elmt => newObj[elmt.card_id] = {
                        type_id: elmt.type_id, 
                        image_path: elmt.image_path, 
                        max: elmt.max, 
                        qty: elmt.qty, 
                        ec_cost: elmt.ec_cost
                    });
                    return res.status(200).json(newObj);
            }

            throw {
                code: 404,
                message: "Not Found"
            }

        }catch(e){
            console.log("[Error CardsController][findCardsByType] : ", e)
            return res.status(e.code).json(e);
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

            //check number of divinity
            if(Number(params.type) === 1){
                if(checkDivinity(body.payload)){
                    throw {
                        code: 400,
                        message: "Should have 1 divinity max"
                    }
                };
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

            if(includes_all_src(idsFromUser,idsFromDb) && idsFromUser.length < idsFromDb.length){
                let diff = differences(idsFromUser, idsFromDb);
                let result = await CardsList.deleteMany({deck_id: Number(options.params.deckId), card_id: diff});
                return res.status(200).json({
                    code: 200,
                    datas: result.message,
                    message: "Deleted successfully"
                })
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
                
            
            for(card of formatedData){
                if(card.type_id === 1){
                    await Deck.addDivinity({deck_id: card.deck_id, card_id: card.card_id});
                }
                let result = await CardsList.addCard(card);
                if(result === true){
                    multipleInsert.push(result);
                }
            }
                
            if(multipleInsert.every(elmt => elmt === true)){
                return res.status(200).json({
                    code:200,
                    message: "Successfully updated"
                });
            }

        } catch (error) {
            console.log("[Controller Cards][addCard]", error)
            return res.status(error.code).json(error);
        }
    },

    async updateCard(req,res){
        try {
            const options = {};
            options.user_id = process.env.NODE_ENV === 'dev' ?  req.body.user_id : req.session.passport.user;

            if(req.params.deckId){
                options.deck_id = req.params.deckId;
            }

            if(req.body.payload){
                let payload = JSON.parse(req.body.payload);
                options.card_id = payload.card_id;
                options.qty = payload.qty;
            }

            if(req.params.type){
                if(!TYPES.includes(Number(req.params.type))){
                    throw {
                        code: 404,
                        message: "Not Found"
                    }
                }

                let response = await Warehouse.getCardsByType(req.params.type);
                
                if(response.message.get(options.card_id)){
                    if(response.message.get(options.card_id).max < options.qty){
                        return res.status(400).json({
                            code:400,
                            message: "Bad Request"
                        })
                    }
                }else{
                    throw {
                        code: 404,
                        message: "Not Found"
                    }
                }

            }else{
                throw {
                        code: 400,
                        message: "Bad request"
                    }
            }
            
            let response = await CardsList.updateCard(options);

            return res.status(200).json({
                code: 200,
                data: response.message[0],
                message: "updated successfully"
            });

        } catch (error) {
            console.log("[Controller Cards][updateCard] : ", error)
            return res.status(error.code).json(error);
        }
    },

    async deleteCard(req, res){
        try{
            console.log(req.params)
            return;
        }catch(error){
            return;
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