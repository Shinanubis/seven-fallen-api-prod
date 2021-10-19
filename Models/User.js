const pool = require('../Services/database/db');
const custom_errors = require('../Errors/CustomsErrors');
const pagination = require('../Utils/pagination');

// Utils 
const return_success = require('../Utils/returnSuccess');

//allowed
const allowed_order = ['id', 'username' ,'created_at'];
const allowed_gender = ['M', 'F', 'Other'];

//default values
const default_page = 0;
const default_page_size = 20; 

function User() {
    this.db = pool;
};

User.prototype.findAllVisible = async function(options){
    try {
        let request = 'SELECT id, avatar, username, created_at FROM users ORDER BY ';
        let query_params = [];
        
        if(options.order_by && allowed_order.includes(options.order_by)) {
            request += options.order_by;
        }else{
            request += 'id';
        }

        if(options.sens){
            request += ' DESC'
        }

        request += ' OFFSET $1 FETCH NEXT $2 ROW ONLY';
        query_params.push(options.page ? pagination(options.page, options.size ?? default_page_size) : default_page, options.size ?? default_page_size);

        let result = await this.db.query(request, query_params);
        let newResult = [
            result.rowCount,
            result.rows
        ];
        return return_success(newResult);
    } catch (e) {
        return custom_errors(e);
    }
}

User.prototype.findOne = async function(options){
    try {
        let request = 'SELECT id, username FROM users WHERE ';
        let query_params = [];
        let counter = 0;

        if(options.id){
            counter += 1;
            request += "id = $" + counter;
            query_params.push(options.id);
        }

        if(options.facebook_id){
            counter += 1;
            request += 'facebook_id = $' + counter;
            query_params.push(options.facebook_id);
        }

        if(options.google_id){
            counter += 1;
            request += 'google_id = $' + counter;
            query_params.push(options.google_id);
        }
        
        let result = await this.db.query(request,query_params);
        if(result.rows.length === 0) throw {code: '02000'};
        return return_success(result.rows[0]);
    } catch (e) {
        return custom_errors(e);
    }
}

User.prototype.findMany = async function(options){
    try {
        let request = 'SELECT id,avatar,username,gender FROM users WHERE is_visible = true ';
        let query_params = [];

        if(options.username){
            request += 'AND username LIKE $1 ';
            query_params.push(options.username ?? 'a' + '%');
        }

        if(options.order_by && allowed_order.includes(options.order_by)){
            request += 'ORDER BY ' + options.order_by + ' ';
        }else{
            request += 'ORDER BY id ';
        }

        if(options.sens){
            request += 'DESC'
        }

        request += ' OFFSET $1 FETCH NEXT $2 ROW ONLY';
        query_params.push(options.page ? pagination(options.page, options.size ?? default_page_size) : default_page, options.size ?? default_page_size);

        let result = await this.db.query(request, query_params);
        if(result.rows.length === 0) throw {code: '02000'};
        return return_success(result.rows);
    } catch (e) {
        return custom_errors(e);
    }
}

User.prototype.createOne = async function(options){
    try {
        let request_part_one = 'INSERT INTO users(';
        let request_part_two = 'VALUES'
        let request_part_three = 'RETURNING id'
        let query_params = [];

        if(options.username){
            request_part_one += 'username, ';
            request_part_two += '($1, ';
            query_params.push(options.username);
        }

        if(options.facebook_id){
            request_part_one += 'facebook_id) ';
            request_part_two += '$2) ';
            query_params.push(options.facebook_id);
        }

        if(options.google_id){
            request_part_one += 'google_id) ';
            request_part_two += '$2) ';
            query_params.push(options.google_id);
        }

        let request = request_part_one + request_part_two + request_part_three;
        let result = await this.db.query(request, query_params);
        return return_success(result.rows[0]);
    } catch (e) {
        e.field = options.username;
        return custom_errors(e);
    }
}

User.prototype.update = async function(options){
    try {

        let request_part_one = 'UPDATE users SET ';
        let request_params = [];
        let request_part_two = ' WHERE id = $1 RETURNING id , username, gender, firstname, lastname, email, is_visible, allow_collections';
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

        if(options.firstname !== datas[0].firstname){
            change += 1;
            counter += 1;
            request_params.push(' firstname = $' + counter);
            query_params.push(options.firstname);
        }

        if(options.lastname !== datas[0].lastname){
            change += 1;
            counter += 1;
            request_params.push(' lastname = $' + counter);
            query_params.push(options.lastname);
        }

        if(options.email !== datas[0].email){
            change += 1;
            counter += 1;
            request_params.push(' email = $' + counter);
            query_params.push(options.email);
        }


        if(options.gender !== datas[0].gender.trim()){
            change += 1;
            counter += 1;
            request_params.push(' gender = $' + counter);
            query_params.push(options.gender);
        }

        if(options.is_visible !== datas[0].is_visible.toString()){
            change += 1;
            counter += 1;
            request_params.push(' is_visible = $' + counter);
            query_params.push(options.is_visible);
        }

        if(options.allow_collections !== datas[0].allow_collections.toString()){
            change += 1;
            counter += 1;
            request_params.push(' allow_collections = $' + counter);
            query_params.push(options.allow_collections);
        }

        if(change === 0){
            return return_success(`Your profile ${options.username} is already up to date`);
        }

        let request = request_part_one + request_params.join(',') + request_part_two;
        let result = await this.db.query(request, query_params);
        console.log("Request : ",request);
        console.log("Params : ", query_params);
        return return_success(result.rows[0]);
    } catch (e) { 
        e.field = options.username;
        return custom_errors(e);
    }
}

User.prototype.delete = async function(options){
    try {
        let request = 'DELETE FROM users WHERE id = $1 RETURNING username';
        let query_params = [options.user_id];
        let result = await this.db.query(request, query_params);
        return return_success(`${result.rows[0].username} deleted succesfully`);
    } catch (e) {
        e.field = options.username;
        return custom_errors(e);
    }

}

User.prototype.exists = async function(options){
    let request = 'SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)';
    let query_params = [options.user_id];
    let result = await this.db.query(request, query_params);
    return result.rows[0].exists;
}

User.prototype.getUserDatas = async function(options){
    let request = 'SELECT id, username, avatar FROM users WHERE id = $1';
    let query_params = [options.user_id];
    let result = await this.db.query(request, query_params);
    return result.rows;
}

module.exports = User;