const User = require('../models/User');

exports.signin_get = (req, res) => {
  res.render('pages/front/auth/signin', {
    title: 'Sign In - Flixify',
    description: 'Sign in to your Flixify account to manage your movies and TV shows.',
    keywords: 'signin, login, movies, tv shows, management',
  });
}

exports.signup_get = (req, res) => {
  res.render('pages/front/auth/signup', {
    title: 'Sign Up - Flixify',
    description: 'Create a new Flixify account to start managing your movies and TV shows.',
    keywords: 'signup, register, movies, tv shows, management',
  });
}

exports.forgotPassword_get = (req, res) => {
  res.render('pages/front/auth/forgot-password', {
    title: 'Forgot Password - Flixify',
    description: 'Reset your Flixify password if you have forgotten it.',
    keywords: 'forgot password, reset password, movies, tv shows',
  });
}