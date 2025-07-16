const express = require('express');
const router = express.Router();
const coreController = require('../controllers/coreController');
const { check, validationResult } = require("express-validator");
const authMiddlewares = require('../middlewares/authMiddlewares');

router.get('/', coreController.index_get);
router.get('/movies/:id', coreController.movie_details_get);
router.get("/recently-added", coreController.recently_added_get);
router.get('/all-movies', coreController.all_movies_get);
router.get('/movies-cartoon', coreController.movies_cartoon_get);
router.get('/movies-asian', coreController.movies_asian_get);

router.get('/dashboard', authMiddlewares.requireAuth, (req, res) => {
  res.render('pages/dashboard', {
    title: 'Dashboard - Flixify',
    description: 'Manage your movies and TV shows on Flixify.',
    keywords: 'dashboard, movies, tv shows, management',
  });
});

module.exports = router;