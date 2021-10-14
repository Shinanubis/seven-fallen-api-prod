const express = require('express');
const router = express.Router({mergeParams: true});
const ProfileController = require('../Controllers/Profile');

const multer = require('multer')();

// profile
router.get('/profile', ProfileController.getProfile);
router.patch('/profile',multer.fields([{name:'avatar'}]) ,ProfileController.updateProfile);
router.delete('/profile', ProfileController.deleteProfile);

// avatar 
router.get('/profile/avatar', ProfileController.getAvatar);
router.post('/profile/avatar', multer.single('avatar'), ProfileController.addAvatar);
router.patch('/profile/avatar', ProfileController.updateAvatar);
router.delete('/profile/avatar', ProfileController.deleteAvatar);

module.exports = router;