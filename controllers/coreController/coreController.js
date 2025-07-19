const {index_get, search_get} = require('./index');
const {watchlist_get, watchlist_add_post, watchlist_remove_delete} = require('./watchlist');
const {recently_added_get} = require('./recently-added');
const {all_movies_get, movies_cartoon_get, movies_asian_get, movies_netflix_get, movies_top_rated_get} = require('./movies');
const {tv_get, tv_netflix_get, tv_top_rated_get} = require('./tv');
const {asian_series_get, asian_top_rated_get, asian_netflix_get} = require('./asian-series');
const {anime_get, anime_movies_get, anime_series_get, anime_top_rated_get, anime_netflix_get} = require('./anime');
const {movie_details_get} = require('./details');
const {admin_dashboard_get, admin_settings_get, admin_settings_put, admin_add_movies_series_get, admin_add_movies_series_post} = require('./admin');


module.exports = {
  index_get,
  search_get,
  watchlist_get,
  watchlist_add_post,
  watchlist_remove_delete,
  recently_added_get,
  all_movies_get,
  movies_cartoon_get,
  movies_asian_get,
  movies_netflix_get,
  movies_top_rated_get,
  tv_get,
  tv_netflix_get,
  tv_top_rated_get,
  asian_series_get,
  asian_top_rated_get,
  asian_netflix_get,
  anime_get,
  anime_movies_get,
  anime_series_get,
  anime_top_rated_get,
  anime_netflix_get,
  movie_details_get,
  admin_dashboard_get,
  admin_settings_get,
  admin_settings_put,
  admin_add_movies_series_get,
  admin_add_movies_series_post
};

