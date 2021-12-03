const express = require('express');
const router = express.Router({mergeParams: true});
const routeCards = require('./Cards');
const DecksController = require('../Controllers/Decks');
const multer = require('multer')();

// Deck
router.get('/decks', DecksController.getAllByUserId);
router.get('/decks/shared', DecksController.getAll);
router.get('/decks/:id', DecksController.getById);
router.get('/decks/:id/cards', DecksController.getDeckCards);
router.post('/decks/add',multer.fields([]), DecksController.create);
router.post('/decks/kingdoms',multer.fields([]),DecksController.getByKingdom);
router.patch('/decks/:id', multer.fields([]),DecksController.updateById);
router.delete('/decks/delete/:id', DecksController.deleteById);
router.use('/decks/:deckId', routeCards)


module.exports = router;