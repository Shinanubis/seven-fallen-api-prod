//Register
router.get('/decks/:id/register', RegisterController.getRegister);
router.get('/decks/:id/register/cards', RegisterController.getCards);
router.get('/decks/:id/register/reset', RegisterController.resetRegister);
router.post('/decks/:id/register/create', RegisterController.createRegister);
router.post('/decks/:id/register/add-one', RegisterController.addOne);
router.patch('/decks/:id/register/update',upload.fields([]) ,RegisterController.updateCards);
router.patch('/decks/:id/register/edit',RegisterController.editQuantity);
router.delete('/decks/:id/register/delete', RegisterController.deleteRegister);
router.delete('/decks/:id/register/delete-one', RegisterController.deleteOne);