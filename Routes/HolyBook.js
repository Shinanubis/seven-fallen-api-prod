//Holybook
router.get('/decks/:id/holybook', HolyBookController.getHolyBook);
router.get('/decks/:id/holybook/cards', HolyBookController.getCards);
router.get('/decks/:id/holybook/reset', HolyBookController.resetHolyBook);
router.post('/decks/:id/holybook/create', HolyBookController.createHolyBook);
router.post('/decks/:id/holybook/add-one', HolyBookController.addOne);
router.patch('/decks/:id/holybook/update',upload.fields([]) ,HolyBookController.updateCards);
router.patch('/decks/:id/holybook/edit',HolyBookController.editQuantity);
router.delete('/decks/:id/holybook/delete', HolyBookController.deleteHolyBook);
router.delete('/decks/:id/holybook/delete-one', HolyBookController.deleteOne);