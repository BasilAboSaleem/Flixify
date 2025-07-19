const {   signin_get, signin_post } = require('./signin');
const { signup_get, signup_post } = require('./signup');
const { verify_get, verify_post , resend_verify_post} = require('./verify');
const {logout_get} = require('./logout');
const { forgot_password_get, forgotPassword_post, reset_password_get, reset_password_post } = require('./password');



module.exports = {
    signin_get,
    signin_post,
    signup_get,
    signup_post,
    verify_get,
    verify_post,
    resend_verify_post,
    logout_get,
    forgot_password_get,
    forgotPassword_post,    
    reset_password_get,
    reset_password_post
};