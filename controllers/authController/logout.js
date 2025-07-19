const {check ,validationResult , bcrypt, crypto, nodemailer, User, jwt} = require('./utils');

exports.logout_get = (req, res) => {
  res.clearCookie('connect.sid');
  res.clearCookie('jwt');
  res.redirect('/signin');
};
