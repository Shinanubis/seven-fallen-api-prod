const DecksModel = require('../Models/Deck');

// Utils
const regex_mod = require('../Utils/regex');
const checkFormInputs = require('../Utils/checkFormInputs');
const checkId = require('../Utils/checkId');

// Models instances
const Deck = new DecksModel();

const dotenv = require('dotenv');
dotenv.config();

//Global varaibles for regex
const regex_order = /^[A-Za-z_]+$/;
const regex_id = /^[1-9]{1}[0-9]{0,10}$/;


module.exports = {

    create(req, res) {
        try{
            const options = {};
            options.user_id = process.env.NODE_ENV === 'dev' ?  req.body.user_id : req.session.passport.user;

            if(req.body.deck_name === undefined || req.body.kingdom === undefined){
                throw {
                    code: 403,
                    message: "forbidden"
                }
            }

            if(!req.body.deck_name) {
                throw {
                    code: 400,
                    message: "not compliant"
                }
            }

            if(req.body.deck_name && checkFormInputs(req.body.deck_name, regex_mod.regex_deck_name)){
                options.deck_name = req.body.deck_name;
            }

            if(req.body.kingdom){
                options.kingdom = req.body.kingdom;
            }
            
            Deck.createOne(options)
                .then(response => res.status(response.code).json(response))
                .catch(err => res.status(err.code).json(err));
        }catch(e){
            res.status(e.code).json(e);
        }
    },
    
    getAll(req,res){
        try{
            const options = {};

            if(req.query.order_by && checkFormInputs(req.query.order_by, regex_order)) options.order_by = req.query.order_by;
            if(req.query.sens === 'desc') options.sens = req.query.sens;
            if(req.query.page && checkFormInputs(req.query.page, regex_mod.regex_page)) options.page = req.query.page;
            if(req.query.size && checkFormInputs(req.query.size, regex_mod.regex_page_size)) options.size = req.query.size;
            if(req.query.search) options.search = req.query.search;
            if(req.query.divinity) options.divinity = req.query.divinity;
            if(req.query.kingdoms) {
                options.kingdoms = req.query.kingdoms.substring(1);
                options.kingdoms = req.query.kingdoms.substring(req.query.kingdoms.length - 1, 1); 
            };

            Deck.findAllVisibleDecks(options)
                .then(response => res.status(response.code).json(response))
                .catch(err => res.status(err).json(err))
        }catch(e){
            console.log(e)
            res.status(e.code).json(e.message);
        }
    },

    getAllByUserId(req, res) {
        try {
            const options = {};
            options.user_id = process.env.NODE_ENV === 'dev' ? req.body.user_id : req.session.passport.user;
            
            if(req.query.order_by && checkFormInputs(req.query.order_by, regex_order)) options.order_by = req.query.order_by;
            if(req.query.sens === 'desc') options.sens = req.query.sens;
            if(req.query.page && checkFormInputs(req.query.page, regex_mod.regex_page)) options.page = req.query.page;
            if(req.query.size && checkFormInputs(req.query.size, regex_mod.regex_page_size)) options.size = req.query.size;

            Deck.findAllUserDecks(options)
                .then(response => res.status(response.code).json(response))
                .catch(err => res.status(err.code).json(err));
             
        } catch (e) {
            res.status(e.code).json(e);
        }
    },

    getById(req, res) {
        try {
            const options = {};
            options.user_id = process.env.NODE_ENV === 'dev' ?  req.body.user_id : req.session.passport.user;
            if(req.params.id && checkId(req.params.id) && checkFormInputs(req.params.id, regex_id)) {
                options.deck_id = req.params.id;
            }
            Deck.findOneUserDeck(options)
                .then(response => res.status(response.code).json(response))
                .catch(err => res.status(err.code).json(err));

        } catch (e) {
            res.status(e.code).json(e);
        }
    },

    getByKingdom(req, res) {
        try {
            const options = {};
            options.user_id = process.env.NODE_ENV === 'dev' ?  req.body.user_id : req.session.passport.user;
            if(req.body.kingdoms) options.kingdoms = req.body.kingdoms.split(',');            
            if(req.query.order_by && checkFormInputs(req.body.order_by, regex_mod.regex_order)) options.order_by = req.query.order_by;
            if(req.query.sens === 'desc') options.sens = req.query.sens;
            if(req.query.page && checkFormInputs(req.query.page, regex_mod.regex_page)) options.page = req.query.page;
            if(req.query.size && checkFormInputs(req.query.size, regex_mod.regex_page_size)) options.size = req.query.size;
            if(req.query.mode && req.query.mode === 'unique') options.mode = 'unique';
            if(req.query.mode && req.query.mode === 'combination') options.mode = 'combination';
            Deck.findManyByKingdom(options)
                .then(response => res.status(response.code).json(response))
                .catch(err => res.status(err.code).json(err));
                
        } catch(e) {
            res.status(e.code).json(e);
        }
    },
    updateById(req, res) {
        try {

            const options = {};
            options.user_id = process.env.NODE_ENV === 'dev' ? req.body.user_id : req.session.passport.user;

            if(req.params.id && checkId(req.params.id, regex_id)){
                options.deck_id = req.params.id;
            }

            if(req.body.deck_name && checkFormInputs(req.body.deck_name, regex_mod.regex_deck_name)){
                options.deck_name = req.body.deck_name;
            }

            if(req.body.kingdom && checkFormInputs(req.body.kingdom, regex_mod.regex_kingdoms) || req.body.kingdom == ''){
                options.kingdoms = req.body.kingdom;
            }

            if(req.body.is_visible && checkFormInputs(req.body.is_visible, regex_mod.regex_is_visible)){
                options.is_visible = req.body.is_visible;
            }

            if(req.body.description && checkFormInputs(req.body.description, regex_mod.regex_description)){
                options.description = req.body.description;
            }
            Deck.updateOne(options)
                .then(response => res.status(response.code).json(response))
                .catch(err => res.status(err.code).json(err));
        } catch (e) {
            res.status(e.code).json(e);
        }
    },
    deleteById(req, res) {
        try {
            const options = {};
            options.user_id = process.env.NODE_ENV === 'dev' ? req.body.user_id : req.session.passport.user;
            
            if(req.params.id && checkId(req.params.id, regex_id)) options.deck_id = req.params.id;

            Deck.deleteOne(options)
                .then(response => res.status(response.code).json(response))
                .catch(err => res.status(err.code).json(err));
        } catch (e) {
            res.status(e.code).json(e);
        }
    }
    
}