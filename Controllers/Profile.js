//Modules
const regex_mod = require('../Utils/regex');
const check_form_inputs = require('../Utils/checkFormInputs');
const file_manager = require('../Services/file/file_manager')

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
            

            // check username
            if(req.body.username){
                options.username = req.body.username;
            }

            if(req.files.avatar){
                options.pathname = `/user-${options.user_id}-${Date.now()}.${req.files.avatar[0].mimetype.split('/').pop()}`;
                file_manager.copyFile(`./static/avatars/user-${options.user_id}-${Date.now()}.${req.files.avatar[0].mimetype.split('/').pop()}`, req.files.avatar[0].buffer);   
            }

            Profile.updateUserInfos(options)
                .then(response => res.status(response.code).json(response))
                .catch(err => res.status(err.code).json(err));
        }catch(e){
            console.log(e)  
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