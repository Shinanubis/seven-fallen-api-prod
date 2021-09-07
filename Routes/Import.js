const express = require('express');
const router = express.Router({mergeParams: true});
const ExportController = require('../Controllers/Export');
const multer = require('multer')();
const {checkImport} = require('../Middlewares/checkImport');

router.post('/import/:id',checkImport)

module.exports = router;