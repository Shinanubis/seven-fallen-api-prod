//Modules
const regex_mod = require('../Utils/regex');
const check_form_inputs = require('../Utils/checkFormInputs');

//Profile Instance
const ProfileModel = require('../Models/Profiles');
const Profile = new ProfileModel();

module.exports = {
    getProfile(req, res){
        try{
            const options = {};
            options.id = process.env.NODE_ENV === 'dev' ? req.body.user_id : req.session.passport.user;
            Profile.getUserInfos(options)
                .then(response => res.status(response.code).json(response))
                .catch(err => res.status(err.code).json(err));
        }catch(e){
            console.log("COntroller : " , e)
            res.status(e.code).json(e);
        }
    },

    updateProfile(req, res){
        try{
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
            }else{
                options.email = '';                
            }

            //check is visible
            if(req.body.is_visible === 'true' || req.body.is_visible === 'false'){
                options.is_visible = req.body.is_visible;
            }

            //check allow collections
            if(req.body.allow_collections === 'true' || req.body.allow_collections === 'false'){
                options.allow_collections = req.body.allow_collections;
            }
            Profile.updateUserInfos(options)
                .then(response => res.status(response.code).json(response))
                .catch(err => res.status(err.code).json(err));
        }catch(e){
            res.status(e.code).json(e);
        }
    },

    deleteProfile(req, res){
        try{
            const options = {};
            options.user_id = process.env.NODE_ENV === 'dev' ? req.body.user_id : req.session.passport.user;
            Profile.deleteUserInfos(options)
                .then(response => res.status(response.code).json(response))
                .catch(err => res.status(err.code).json(err));
        }catch(e){
            res.status(e.code).json(e);
        }
    },

    getAvatar(req, res ){
        try {
            const options = {};
            options.user_id = process.env.NODE_ENV === 'dev' ? req.body.user_id : req.session.passport.user;
            Profile.getAvatar(options)
                .then(response => res.status(response.code).json(response))
                .catch(err => res.status(err.code).json(err));
        } catch (e) {
            res.status(e.code).json(e);            
        }
    },

    addAvatar(req, res){
        try {
            const options = {};
            options.user_id = process.env.NODE_ENV === 'dev' ? req.body.user_id : req.session.passport.user;
            if(req.file){
                options.file = req.file;
            }

            Profile.addAvatar(options)
                .then(response => res.status(response.code).json(response))
                .catch(err => res.status(err.code).json(err));
        } catch (e) {
            res.status(e.code).json(e);
        }
    },

    updateAvatar(){
        try {
            const options = {};
            options.user_id = process.env.NODE_ENV === 'dev' ? req.body.user_id : req.session.passport.user;
            Profile.updateAvatar(options)
                .then(response => res.status(response.code).json(response))
                .catch(err => res.status(err.code).json(err));
        } catch (e) {
            res.status(e.code).json(e);            
        }
    },

    deleteAvatar(req,res){
        try {
            const options = {};
            options.user_id = process.env.NODE_ENV === 'dev' ? req.body.user_id : req.session.passport.user;
            Profile.deleteAvatar(options)
                .then(response => res.status(response.code).json(response))
                .catch(err => res.status(err.code).json(err));
        } catch (e) {
            res.status(e.code).json(e);
        }
    }
}