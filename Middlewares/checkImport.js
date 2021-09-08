let multer = require('multer')();
let middleware = multer.single('file');

function checkImport(req, res, next){
  middleware(req,res, () => {
     let file = JSON.parse(req.file.buffer.toString('utf-8'));

     let eden = file.eden;
     let holy_book = file.holy_book ;
     let register = file.register;
     let edenKingdoms = eden.map(elmt => elmt[1]);
     let holyBookKingdoms = holy_book.map(elmt => elmt[1])
     let registerKingdoms = register.map(elmt => elmt[1])
     console.log("eden kingdoms: ", edenKingdoms);
     console.log("holy book kingdoms: ", holyBookKingdoms);
     console.log("register : ", registerKingdoms)
  });
}

module.exports ={
    checkImport 
}