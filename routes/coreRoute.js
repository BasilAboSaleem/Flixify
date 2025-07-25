const express = require('express');
const router = express.Router();
const coreController = require('../controllers/coreController/coreController');
const { check, validationResult } = require("express-validator");
const authMiddlewares = require('../middlewares/authMiddlewares');
const multer  = require('multer')
const upload = multer({storage: multer.diskStorage({})});

router.get('/', coreController.index_get);
router.get('/search', coreController.search_get);
router.get('/watchlist', authMiddlewares.requireAuth, coreController.watchlist_get);
router.post('/watchlist/add/:movieId', authMiddlewares.requireAuth, coreController.watchlist_add_post);
router.delete('/watchlist/remove/:movieId', authMiddlewares.requireAuth, coreController.watchlist_remove_delete);
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

//anime
router.get('/anime', coreController.anime_get);
router.get('/anime/series', coreController.anime_series_get);
router.get('/anime/movies', coreController.anime_movies_get);
router.get('/anime/top-rated', coreController.anime_top_rated_get);
router.get('/anime/netflix', coreController.anime_netflix_get);

router.get('/admin/dashboard', authMiddlewares.requireAuth, coreController.admin_dashboard_get);
router.get('/admin/settings', authMiddlewares.requireAuth, coreController.admin_settings_get);
router.put('/admin/settings', authMiddlewares.requireAuth,  upload.single('logoImage'), coreController.admin_settings_put);
router.get('/admin/add-movies-series', authMiddlewares.requireAuth, coreController.admin_add_movies_series_get);
router.post('/admin/add-movies-series', authMiddlewares.requireAuth, coreController.admin_add_movies_series_post);


module.exports = router;