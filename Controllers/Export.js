const ExportModel = require('../Models/Export');

// Models instances
const Export = new ExportModel();

const dotenv = require('dotenv');
dotenv.config();

module.exports = {    
    getDeckCards(req, res) {
        try {
            const options = {};
            options.user_id = process.env.NODE_ENV === 'dev' ? req.body.user_id : req.session.passport.user;
            options.deck_id = req.params.id;
            Export.findDeckCards(options)
                .then(response => res.status(response.code).json(response))
                .catch(err => res.status(err.code).json(err));
             
        } catch (e) {
            console.log("[export controller]", e)
            res.status(e.code).json(e);
        }
    }
}