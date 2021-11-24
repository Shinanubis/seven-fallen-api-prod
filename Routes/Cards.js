const express = require('express');
const router = express.Router({mergeParams: true});
const CardsController = require('../Controllers/Cards');
const multer = require("multer")();

router.get('/cards/:type', CardsController.findCardsByType);
router.patch('/cards/:type', multer.fields([]),CardsController.addCard);

module.exports = router;