let multer = require('multer')();
let middleware = multer.single('file');
const { 
  EDEN, 
  HOLYBOOK, 
  REGISTER
} = require('../constantes/typesByCategory.js');

const {includes_some, includes_all} = require('../Utils/arrays.js');
const MAX_FILE_SIZE = 5000;

function checkImport(req, res, next){
  middleware(req,res, () => {
     let file = JSON.parse(req.file.buffer.toString('utf-8'));
     let file_ext = req.file.originalname.split(".").pop();
     let eden = file.eden;
     let holy_book = file.holy_book ;
     let register = file.register;
     let edenTypes = eden.map(elmt => elmt[1]);
     let holyBookTypes = holy_book.map(elmt => elmt[1])
     let registerTypes = register.map(elmt => elmt[1])
          

     //check cards type are allowed
     if(
          !includes_all(EDEN, edenTypes) ||
          !includes_all(HOLYBOOK, holyBookTypes) ||
          !includes_all(REGISTER, registerTypes)
        ){
       return res.status(400).json({
         code: 400,
         message: "bad request"
       })
     }
    
     //check file size
     if(req.file.size >= MAX_FILE_SIZE){
       return res.status(413).json({
        code: 413,
        subject: "file",
        message: "too big" 
       })
     }
     
     // check mimetype
     if(req.file.mimetype !== "application/json"){
       return res.status(400).json({
         code: 400,
         message:"bad request"
       })
     }

     //check file extension
     if(file_ext !== "json"){
       return res.status(400).json({
         code: 400,
         message: "bad request"
       })
     }
     
     req.file = file;
     return next()
  });
}

module.exports ={
    checkImport 
}