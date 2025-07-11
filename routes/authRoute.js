const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


router.get('/signin', authController.signin_get);
router.get('/signup', authController.signup_get);
router.get('/forgotPassword', authController.forgotPassword_get);

module.exports = router;