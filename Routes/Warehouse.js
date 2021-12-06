const express = require('express');
const router = express.Router({mergeParams: true});
const WarehouseController = require('../Controllers/Warehouse');
const multer = require("multer")();

router.get('/cards/multiple', WarehouseController.findMultiple)
router.get('/cards/all', WarehouseController.findCardsBy);
router.get('/:type_list/all', WarehouseController.findList);


module.exports = router;