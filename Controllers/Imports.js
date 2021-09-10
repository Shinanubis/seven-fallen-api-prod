const ImportModel = require('../Models/Import');

// Models instances
const Import = new ImportModel();

const dotenv = require('dotenv');
dotenv.config();

function qtyReducer(prevValue, currentValue){
    return prevValue + currentValue;
}

module.exports = {    
    updateDeckCards(req, res) {
        try {
            let options = {
                eden: {
                    cards: [],
                    qty: 0
                },
                holy_book: {
                    cards: [],
                    qty: 0
                },
                register: {
                    cards: [],
                    qty: 0
                },
            };
            options.user_id = process.env.NODE_ENV === 'dev' ? req.body.user_id : req.session.passport.user;
            options.deck_id = req.params.id;

            if(req.file){
                if(req.file.eden.length > 0){
                    options.eden.qty = req.file.eden
                            .map(elmt => {
                                options.eden.cards.push(elmt);
                                return elmt[2];
                            })
                            .reduce(qtyReducer);
                }else{
                    options.eden.cards = [];
                    options.eden.qty = 0;  
                }

                if(req.file.holy_book.length > 0){ 
                    options.holy_book.qty = req.file.holy_book
                                                .map(elmt => {
                                                    options.holy_book.cards.push(elmt);
                                                    return elmt[2];
                                                })
                                                .reduce(qtyReducer);
                }else{
                    options.holy_book.cards = [];
                    options.holy_book.qty = 0;
                }

                if(req.file.register.length > 0){
                    options.register.qty = req.file.register
                                                .map(elmt => {
                                                        options.register.cards.push(elmt);
                                                        return elmt[2];
                                                })
                                                .reduce(qtyReducer); 
                }else{
                    options.register.cards = [];
                    options.register.qty = 0;
                }
            }

            Import.importDeck(options)
                .then(response => res.status(response.code).json(response))
                .catch(err => res.status(err.code).json(err));
        } catch (e) {
            res.status(e.code).json(e);
        }
    }
}