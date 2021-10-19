const UserModel = require('../Models/User');
const fileService = require('../Services/file/file_manager');

//Utils
const regex_mod = require('../Utils/regex');
const check_form_inputs = require('../Utils/checkFormInputs');

// User model instance
const User = new UserModel();

module.exports = {
    getAll(req, res) {
        try{
            const options = {};
            if(req.query.order_by && check_form_inputs(req.query.order_by, regex_mod.regex_order)) options.order_by = req.query.order_by;
            if(req.query.sens === 'desc') options.sens = req.query.sens;
            if(req.query.page && check_form_inputs(req.query.page, regex_mod.regex_page)) options.page = req.query.page;
            if(req.query.size && check_form_inputs(req.query.size, regex_mod.regex_page_size)) options.size = req.query.size;
            User.findAllVisible(options)
                .then(response => res.status(response.code).json(response))
                .catch(err => res.status(err.code).json(err.message));
        }catch(e){
            res.status(e.code).json(e.message);
        }
    },
    
    getById(req, res) {
        try {
            const options = {};
            if(req.params.id && check_form_inputs(req.params.id,regex_mod.regex_id)) options.user_id = req.params.id;
            User.findOne(options)
                .then(response => res.status(response.code).json(response))
                .catch(e => res.status(e.code).json(e));
        } catch (e) {
            res.status(e.code).json(e);
        }
    },

    subscribe(req,res){
        try {
            const options = {};
            options.username = '';
            if(req.body.username && check_form_inputs(req.body.username, regex_mod.regex_username)) options.username = req.body.username;
            if(req.body.facebook_id) options.facebook_id = req.body.facebook_id;
            if(req.body.google_id) options.google_id = req.body.google_id;
            User.createOne(options)
                .then(response => res.status(response.code).json(response.message))
                .catch(e => res.status(e.code).json(e.message));
        } catch (e) {
            res.status(e.code).json(e.message);            
        }
    },

    search(req,res){
        try {
            const options = {};

            if(req.query.username && check_form_inputs(req.query.username, regex_mod.regex_start_with)){
                options.username = req.query.username;
            }

            if(req.query.order_by && check_form_inputs(req.query.order_by, regex_mod.regex_order)){
                options.order_by = req.query.order_by;
            }

            if(req.query.sens === 'desc'){
                options.sens = req.query.sens;
            }
            
            User.findMany(options)
                .then(response => res.status(response.code).json(response.message))
                .catch(e => res.status(e.code).json(e.message));

        } catch (e) {
            res.status(e.code).json(e.message);
        }
    },

    updateById(req, res) {
        try {
            const options = {};

            options.user_id = process.env.NODE_ENV === 'dev' ? req.body.user_id : req.session.passport.user;
            
            // check gender
            if(req.body.gender && check_form_inputs(req.body.gender , regex_mod.regex_gender)){
                options.gender = req.body.gender;
            }else{
                options.gender = 'other';
            }

            // check username
            if(req.body.username && check_form_inputs(req.body.username, regex_mod.regex_username)){
                options.username = req.body.username;
            }else{
                options.username = '';
            }

            //check firstname
            if(req.body.firstname && check_form_inputs(req.body.firstname, regex_mod.regex_name)){
                options.firstname = req.body.firstname;
            }else{
                options.firstname = '';
            }
            //check lastname
            if(req.body.lastname && check_form_inputs(req.body.lastname, regex_mod.regex_name)){
                options.lastname = req.body.lastname;
            }else{
                options.lastname = '';
            }

            //check email
            if(req.body.email && check_form_inputs(req.body.email, regex_mod.regex_email)){
                options.email = req.body.email
            }

            //check is visible
            if(req.body.is_visible === 'true' || req.body.is_visible === 'false'){
                options.is_visible = req.body.is_visible;
            }

            //check allow collections
            if(req.body.allow_collections === 'true' || req.body.allow_collections === 'false'){
                options.allow_collections = req.body.allow_collections;
            }
            
            User.update(options)
                .then(response => res.status(response.code).json(response))
                .catch(e => res.status(e.code).json(e));
        } catch (e) {
            res.status(e.code).json(e);
        }
    },

    deleteById(req, res) {
        const options = {};
        options.user_id = process.env.NODE_ENV === 'dev' ? req.body.user_id : req.session.passport.user;
        User.delete(options)
            .then(response => res.status(response.code).json(response.message))
            .catch(e => res.status(e.code).json(e.message));
    }
}