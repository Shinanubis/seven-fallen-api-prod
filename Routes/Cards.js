const express = require('express');
const router = express.Router({mergeParams: true});
const CardsController = require('../Controllers/Cards');
const multer = require("multer")();

router.get('/cards/:type', CardsController.findCardsByType);
router.post('/cards/:type', multer.fields([]),CardsController.addCard);
router.patch('/cards/:type', multer.fields([]),CardsController.updateCard);
router.delete('/cards/:type', multer.fields([]), CardsController.deleteCard);

module.exports = router;