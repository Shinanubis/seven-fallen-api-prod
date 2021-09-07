let multer = require('multer')();
let middleware = multer.single('file');

function checkImport(req, res, next){
  middleware(req,res, () => {
      console.log(req.file.buffer.toString('utf-8'))
  });
}

module.exports = {
    checkImport
};