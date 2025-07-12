const express = require('express');
const router = express.Router();
const coreController = require('../controllers/coreController');
const { check, validationResult } = require("express-validator");
const authMiddlewares = require('../middlewares/authMiddlewares');

router.get('/', coreController.index_get);

router.get('/dashboard', authMiddlewares.requireAuth, (req, res) => {
  res.render('pages/dashboard', {
    title: 'Dashboard - Flixify',
    description: 'Manage your movies and TV shows on Flixify.',
    keywords: 'dashboard, movies, tv shows, management',
  });
});

module.exports = router;