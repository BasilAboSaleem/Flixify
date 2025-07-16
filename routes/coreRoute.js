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
router.get('/movies-netflix', coreController.movies_netflix_get);
router.get('/movies-top-rated', coreController.movies_top_rated_get);
//tv
router.get('/tv', coreController.tv_get);
router.get('/tv/netflix', coreController.tv_netflix_get);
router.get('/tv/top-rated', coreController.tv_top_rated_get);

///asian series

router.get('/asian/series', coreController.asian_series_get); 
router.get('/asian/top-rated', coreController.asian_top_rated_get);
router.get('/asian/netflix', coreController.asian_netflix_get);

router.get('/dashboard', authMiddlewares.requireAuth, (req, res) => {
  res.render('pages/dashboard', {
    title: 'Dashboard - Flixify',
    description: 'Manage your movies and TV shows on Flixify.',
    keywords: 'dashboard, movies, tv shows, management',
  });
});

module.exports = router;