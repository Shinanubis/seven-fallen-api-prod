const express = require('express');
const router = express.Router({mergeParams: true});
const ExportController = require('../Controllers/Export');
const multer = require('multer')();
const { checkImport } = require('../Middlewares/checkImport');
const Import = require('../Controllers/Imports')

router.post('/import/:id',checkImport, Import.updateDeckCards)

module.exports = router;