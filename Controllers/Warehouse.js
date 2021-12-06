const {getCardsBy, getList, getMultiple} = require('../Services/warehouse');
const {TYPES, TYPE_LIST, TYPE_LIST_NAME_REQUIRE} = require('../constantes/typesByCategory');

async function findMultiple(req, res){
      try {
            let ids = req.query.ids;

            if(req.query.ids){
                  ids = ids.slice(1);
                  ids = ids.slice(0,-1);
            }else{
                  throw {
                        code: 400,
                        message: "Bad request"
                  }
            }

            let response = await getMultiple(ids);
            if(response.status === 200 && response.statusText === 'OK'){
                  return res.status(200).json(response.data);
            }
            
            throw {
                  code: response.status,
                  message: response.data
            }
      } catch (error) {
            if(error.response){
                  console.log("[Warehouse Controller][findList] : ", error.response);
                  return res.status(error.response.status).json({
                        code: error.response.status,
                        message: error.response.data
                  })
            }
            return res.status(error.code).json({
               code: error.code,
               message: error.message
            });    
      }
}

async function findList(req,res){

      try {
            const options = {};
            options.user_id = !req.session.passport ?  req.body.user_id : req.session.passport.user;
            let response = '';

            if(TYPE_LIST.includes(req.params.type_list)){
                  response = await getList(req.params.type_list);
            }

            if(TYPE_LIST_NAME_REQUIRE.includes(req.params.type_list) && req.query.name){
                  response = await getList(req.params.type_list, req.query.name);
            }

            if(response.code === 200){
                  return res.status(200).json({
                        code: response.code,
                        message: response.message
                  })
            }

            throw {
                  code: 400,
                  message: 'Bad Request'
            }

      } catch (error) {
            
            if(error.response){
                  console.log("[Warehouse Controller][findList] : ", error.response);
                  return res.status(error.response.status).json({
                        code: error.response.status,
                        message: error.response.data
                  })
            }
            console.log("[Warehouse Controller][findList] : ",error)
            return res.status(error.code).json({
               code: error.code,
               message: error.message
            });       
      }
} 

async function findCardsBy(req, res){
      try {
            const options = {};
            options.user_id = process.env.NODE_ENV === 'dev' ?  req.body.user_id : req.session.passport.user;

            if(!req.query.page || !req.query.card_count){
                  throw {
                        code: 400,
                        message: 'Bad request page and, or card_count parameter are missing'
                  }
            }

            if(req.query.page){
                  options.page = req.query.page;
            }

            if(req.query.card_count){
                  options.card_count = req.query.card_count;
            }


            if(req.query.capacities){
                  options.capacities = req.query.capacities;
                  options.capacities = options.capacities.slice(0,-1);
                  options.capacities = options.capacities.slice(1); 
            }

            if(req.query.rarities){
                  options.rarities= req.query.rarities;
                  options.rarities = options.rarities.slice(0,-1);
                  options.rarities = options.rarities.slice(1); 
            }

            if(req.query.classes){
                  options.classes = req.query.classes;
                  options.classes = options.classes.slice(0,-1);
                  options.classes = options.classes.slice(1); 
            }

            if(req.query.extensions){
                  options.extensions = req.query.extensions;
                  options.extensions = options.extensions.slice(0,-1);
                  options.extensions = options.extensions.slice(1); 
            }

            if(req.query.kingdoms){
                  options.kingdoms = req.query.kingdoms;
                  options.kingdoms = options.kingdoms.slice(0,-1);
                  options.kingdoms = options.kingdoms.slice(1);
            }

            if(req.query.types){
                  options.types = req.query.types;
                  options.types = options.types.slice(0,-1);
                  options.types = options.types.slice(1);
            }
            
            if(req.query.name){
                  options.name = req.query.name;
            }

            let response = await getCardsBy(options);

            return res.status(200).json({
                  ...response.message
            });
      } catch (error) {
            
            if(error.response){
                  console.log("[Warehouse Controller][findCardsBy] : ", error.response);
                  return res.status(error.response.status).json({
                        code: error.response.status,
                        message: error.response.data
                  })
            }
            console.log("[Warehouse Controller][findCardsBy] : ", error);
            return res.status(error.code).json({
               code: error.code,
               message: error.message
            }); 
      }
};

module.exports = {
      findList,
      findCardsBy,
      findMultiple
}