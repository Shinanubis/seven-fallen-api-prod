const pool = require('../Services/database/db');
const return_success = require('../Utils/returnSuccess');
const file_manager = require('../Services/file/file_manager');
require('dotenv').config(); 

function Profile() {
    this.db = pool;
};

Profile.prototype.getUserInfos = async function(options){
    try{
        let request = 'SELECT id, username, avatar FROM users WHERE id = $1';
        let query_params = [options.id];
        let {rows} = await this.db.query(request, query_params);
        if(rows.length === 0) throw {code: "02000"};
        return return_success(rows[0]);
    }catch(e){
        return custom_errors(e);
    }
}

Profile.prototype.updateUserInfos = async function(options){
    try {

        let request_part_one = 'UPDATE users SET';
        let request_params = [];
        let request_part_two = ' WHERE id = $1 RETURNING id, username, avatar';
        let counter = 1;
        let change = 0;
        let query_params = [options.user_id];

        // check user existence
        let exists = await this.exists(options);
        if(!exists) throw {code: '02000'};

        //grab the user datas
        let datas = await this.getUserDatas(options);
        if(datas.length === 0) throw {code: '02000'};

        if(options.username !== datas[0].username){
            change += 1;
            counter += 1;
            request_params.push(' username = $' + counter);
            query_params.push(options.username);
        }
       
        if(!options.pathname){
            change += 1;
            counter += 1;
            request_params.push(' avatar = $' + counter);
            query_params.push(datas[0].avatar);
        }else{
            change += 1;
            counter += 1;
            request_params.push(' avatar = $' + counter);
            query_params.push(options.pathname);
        }

        let request = request_part_one + request_params.join(',') + request_part_two;
        let result = '';

        if(change === 0){
            result = await this.getUserDatas(options);
            return return_success(result[0]);
        }else{
            result = await this.db.query(request, query_params);
            return return_success(result.rows[0]);
        }
    } catch (e) {
        e.field = options.username;
        return custom_errors(e);
    }
}

Profile.prototype.deleteUserInfos = async function(options){
    try {
        const request = 'DELETE FROM users WHERE id = $1 RETURNING username';
        const query_params = [options.user_id];
        let {rows} = await this.db.query(request, query_params);
        if(rows.length === 0){
            throw { code : '02000' };
        }
        return return_success(rows[0].username + ' deleted succesfully');
    } catch (e) {
        return custom_errors(e);
    }
}

Profile.prototype.getAvatar = async function(options){
    try{
        let request = 'SELECT avatar FROM users WHERE id = $1';
        let query_params = [options.user_id];
        let {rows} = await this.db.query(request, query_params);
        return return_success(rows[0]);
    }catch(e){
        return custom_errors(e);
    }
}

Profile.prototype.addAvatar = async function (options){
    try{
        let file_name = await file_manager(options.file, './img', options.user_id);
        let request = 'UPDATE users SET avatar = $2 WHERE id = $1 RETURNING avatar';
        let query_params = [options.user_id, 'https://test-seven.site/images/' + file_name];
        let {rows} = await this.db.query(request, query_params);
        return return_success(rows[0]);
    }catch(e){
        return custom_errors(e);
    }
}

Profile.prototype.updateAvatar = async function (options){
    try{
        let request = 'UPDATE users SET avatar = $2 WHERE id = $1';
        let query_params = [options.user_id, options.avatar];
        let {rows} = await this.db.query(request, query_params);
        return return_success(rows[0]);
    }catch(e){
        return custom_errors(e);
    }
}

Profile.prototype.deleteAvatar = async function (options){
    try{
        let request = 'UPDATE users SET avatar = $2 WHERE id = $1';
        let query_params = [options.user_id, 'user-default.svg'];
        let {rows} = await this.db.query(request, query_params);
        return return_success(rows[0]);
    }catch(e){
        return custom_errors(e);
    }
}

Profile.prototype.exists = async function(options){
    let request = 'SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)';
    let query_params = [options.user_id];
    let result = await this.db.query(request, query_params);
    return result.rows[0].exists;
}

Profile.prototype.getUserDatas = async function(options){
    let request = 'SELECT id, username, avatar FROM users WHERE id = $1';
    let query_params = [options.user_id];
    let result = await this.db.query(request, query_params);
    return result.rows;
}

module.exports = Profile;