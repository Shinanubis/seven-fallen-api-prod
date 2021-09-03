const express = require('express');
const router = express.Router({mergeParams: true});
const ExportController = require('../Controllers/Export');
const multer = require('multer')();

// export
router.get('/export/:id', ExportController.getDeckCards);


module.exports = router;