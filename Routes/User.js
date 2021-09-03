const express = require('express'); 
const router = express.Router({mergeParams: true});
const multer = require('multer')();
const UsersController = require('../Controllers/Users');

router.get('/users',UsersController.getAll);
router.get('/users/:id', UsersController.getById);
router.get('/users/search',UsersController.search);
router.post('/users/subscribe', multer.fields([]) ,UsersController.subscribe);
router.patch('/user/update',multer.fields([]) ,UsersController.updateById);
router.delete('/user/delete', UsersController.deleteById);

module.exports = router;