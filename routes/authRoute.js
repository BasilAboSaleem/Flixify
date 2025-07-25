const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController/authController');
const { check, validationResult } = require("express-validator");
const authMiddlewares = require('../middlewares/authMiddlewares');





router.get('/signin', authController.signin_get);
router.post('/signin', authMiddlewares.loginLimiter, authController.signin_post);
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
router.post('/resend_verify', authController.resend_verify_post);
router.get('/logout',  authController.logout_get);
router.get('/forgot_password', authController.forgot_password_get);
router.post('/forgot_password', authController.forgotPassword_post);
router.get('/reset-password/:token', authController.reset_password_get);
router.post('/reset-password/:token', 
    [
      check("password", "Password must be at least 8 characters with 1 upper case letter and 1 number").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/),
      check("confirmPassword", "Confirm Password must match Password").custom((value, { req }) => value === req.body.password)
    ],
    authController.reset_password_post
);

module.exports = router;