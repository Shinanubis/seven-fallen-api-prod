const dotenv = require('dotenv');
dotenv.config();

function makeData(datas){
      return Object.freeze({
            path: datas.path,
            method: datas.method,
            query: datas.query,
            params: datas.params,
            user_id: process.env.NODE_ENV === 'dev' ?  datas.body.user_id : datas.session.passport.user,
            body: {
                  payload: datas.body.payload && JSON.parse(datas.body.payload)
            } 
      })
}

module.exports = {
      makeData
}