const express = require('express');
const router = express.Router({mergeParams: true});
const multer = require('multer')();
const EdenController = require('../Controllers/Eden');


//Eden
router.get('/decks/:id/eden', EdenController.getEden);
router.get('/decks/:id/eden/cards', EdenController.getCards);
router.get('/decks/:id/eden/reset', EdenController.resetEden);
router.post('/decks/:id/eden/create', EdenController.createEden);
router.post('/decks/:id/eden/add-one', EdenController.addOne);
router.patch('/decks/:id/eden/update',upload.fields([]) ,EdenController.updateCards);
router.patch('/decks/:id/eden/edit',EdenController.editQuantity);
router.delete('/decks/:id/eden/delete', EdenController.deleteEden);
router.delete('/decks/:id/eden/delete-one', EdenController.deleteOne);