const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { check, validationResult } = require("express-validator");




router.get('/signin', authController.signin_get);
router.post('/signin', authController.signin_post);
router.get('/signup', authController.signup_get);
router.post('/signup', 
    [
    check("email", "Please provide a valid email").isEmail(),
    check(
      "password",
      "Password must be at least 8 characters with 1 upper case letter and 1 number"
    ).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/),
  ],
    authController.signup_post
);
router.get('/verify', authController.verify_get);
router.post('/verify', authController.verify_post);
router.get('/resend_verify', authController.resend_verify_post);

module.exports = router;