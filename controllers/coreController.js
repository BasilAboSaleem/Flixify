const axios = require('axios');
const Movie = require('../models/Movie');
const Review = require('../models/Review');
const User = require('../models/User');
const Settings = require('../models/Settings');
const Watchlist = require('../models/Watchlist');
const seedMovies = require('../utils/seedMovies'); 
const fs = require('fs');
const path = require('path');
const multer  = require('multer')
const upload = multer({storage: multer.diskStorage({})});
const cloudinary = require("cloudinary").v2;

 // Configuration cloudinary اعدادات الكلاودنري
 cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
  });
const e = require('express');

exports.index_get = async (req, res) => {
  try {
    // جلب الأفلام المميزة
    const featuredMovies = await Movie.find({ isFeatured: true }).limit(10).exec();

    // أحدث الأفلام (مرتبة حسب تاريخ الإنشاء)
    const newReleases = await Movie.find()
      .sort({ createdAt: -1 })
      .limit(12)
      .exec();

    // أفلام شعبية (popular)
    const movies = await Movie.find({ category: 'popular' }).limit(12).exec();

    // مسلسلات تلفزيونية
    const tvSeries = await Movie.find({ category: 'tv_series' }).limit(12).exec();

    // أفلام كرتون
    const animatedMovies = await Movie.find({ category: 'animated' }).limit(12).exec();

    // أنمي
    const animeMovies = await Movie.find({ category: 'anime' }).limit(12).exec();

    // أفلام أو مسلسلات قادمة (coming_soon)
    const expectedPremiere = await Movie.find({ category: 'coming_soon' }).limit(6).exec();

    //جلب الستنجز
    const settings = await Settings.findOne().exec();

    res.render('pages/index', {
      title: 'Flixify',
      description: 'Discover and manage your favorite movies and TV shows.',
      keywords: 'movies, tv shows, streaming, management',
      featuredMovies,
      newReleases,
      movies,
      tvSeries,
      animatedMovies,
      animeMovies,
      expectedPremiere,
      settings
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.search_get = async (req, res) => {
  const ITEMS_PER_PAGE = 30;
  const query = req.query.q?.trim() || '';
  const page = parseInt(req.query.page) || 1;

  if (!query) {
    return res.render('pages/search', {
      title: 'Search',
      items: [],
      currentPage: 1,
      totalPages: 1,
      query,
    });
  }

  const regex = new RegExp(query, 'i');

  try {
    const filter = {
      $or: [
        { title: regex },
        { overview: regex },
        { category: regex },
        { genres: regex },
        { type: regex },
        { country: regex },
      ],
    };

    const totalItems = await Movie.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const items = await Movie.find(filter)
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    res.render('pages/front/search', {
      title: `Search results for "${query}"`,
      items,
      currentPage: page,
      totalPages,
      query,
    });

  } catch (err) {
    console.error('Search error:', err);
    res.status(500).render('pages/dashboard/errors/500', {
      error: 'An error occurred while searching.'
    });
  }
};

exports.watchlist_get = async (req, res) => {
  try {
    const userId = req.user._id; // لازم يكون المستخدم مسجل دخول

    // صفحة الباجينشن الحالية وعدد العناصر لكل صفحة
    const currentPage = parseInt(req.query.page) || 1;
    const perPage = 30;

    // نعد كم عنصر موجود للمستخدم
    const totalCount = await Watchlist.countDocuments({ user: userId });

    // نحسب العدد الكلي للصفحات
    const totalPages = Math.ceil(totalCount / perPage);

    // نجيب الـ Watchlist مع ربط بيانات الأفلام، ونقسمها حسب الصفحة
    const watchlistItems = await Watchlist.find({ user: userId })
      .populate('movie')
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    // نصنع مصفوفة أفلام فقط لتمريرها للـ EJS
    const items = watchlistItems.map(item => item.movie);

  res.render('pages/front/watchlist', {
  title: 'My Watchlist',
  items,
  currentPage,
  totalPages,
});
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.watchlist_add_post = async (req, res) => {
  try {
    const userId = req.user._id;
    const movieId = req.params.movieId;

    const movie = await Movie.findOne({ tmdbId: movieId });
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const existingWatchlistItem = await Watchlist.findOne({ user: userId, movie: movie._id });
    if (existingWatchlistItem) {
      return res.status(400).json({ message: 'Movie already in watchlist' });
    }

    const newWatchlistItem = new Watchlist({
      user: userId,
      movie: movie._id
    });

    await newWatchlistItem.save();

    res.status(200).json({ message: 'Movie added to watchlist successfully' });

  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.watchlist_remove_delete = async (req, res) => {
  try {
   const userId = req.user._id;
    const movieId = req.params.movieId;

    const movie = await Movie.findOne({ tmdbId: movieId });
    if (!movie) {
      req.flash('error', 'Movie not found');
  return res.redirect('/watchlist');
}

    const watchlistItem = await Watchlist.findOneAndDelete({ movie: movie._id, user: userId });
    if (!watchlistItem) {
      req.flash('error', 'Watchlist item not found');
      return res.redirect('/watchlist');
    }

    req.flash('success', 'Watchlist item removed successfully');
    res.redirect('/watchlist');
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.recently_added_get = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // الصفحة الحالية، الافتراضي 1
  const limit = 30;
  const skip = (page - 1) * limit;

  try {
    const totalCount = await Movie.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    const items = await Movie.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.render('pages/front/catalog', {
      title: 'Recently Added',
      items,
      currentPage: page,
      totalPages,
      section: 'recently_added'

    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}
//movies
exports.all_movies_get = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // الصفحة الحالية، الافتراضي 1
  const limit = 30;
  const skip = (page - 1) * limit;
  try {
    const totalCount = await Movie.countDocuments({ type: 'movie' });
    const totalPages = Math.ceil(totalCount / limit);

    const items = await Movie.find({ type: 'movie' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.render('pages/front/catalog', {
      title: 'All Movies',
      items,
      currentPage: page,
      totalPages,
      description: 'Browse all movies available on Flixify.',
      keywords: 'all movies, catalog, streaming, movies',
       section: 'all_movies'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
exports.movies_cartoon_get = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // الصفحة الحالية، الافتراضي 1
  const limit = 30;
  const skip = (page - 1) * limit;

  try {
    const totalCount = await Movie.countDocuments({ category: 'animated' , type: 'movie'});
    const totalPages = Math.ceil(totalCount / limit);

    const items = await Movie.find({ category: 'animated' , type: 'movie'})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.render('pages/front/catalog', {
      title: 'cartoon Movies',
      items,
      currentPage: page,
      totalPages,
      description: 'Browse all cartoon movies available on Flixify.',
      keywords: 'cartoon movies, catalog, streaming, cartoon',
       section: 'cartoon_movies'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}
exports.movies_asian_get = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // الصفحة الحالية، الافتراضي 1
  const limit = 30;
  const skip = (page - 1) * limit;

  try {
    const totalCount = await Movie.countDocuments({ category: 'asian' , type: 'movie' });
    const totalPages = Math.ceil(totalCount / limit);

    const items = await Movie.find({ category: 'asian' , type: 'movie' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.render('pages/front/catalog', {
      title: 'Asian Movies',
      items,
      currentPage: page,
      totalPages,
      description: 'Browse all Asian movies available on Flixify.',
      keywords: 'asian movies, catalog, streaming, asian',
      section: 'asian_movies'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
exports.movies_netflix_get = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // الصفحة الحالية، الافتراضي 1    
  const limit = 30;
  const skip = (page - 1) * limit;
  try {
    const totalCount = await Movie.countDocuments({ category: /netflix/i, type: 'movie' });
    const totalPages = Math.ceil(totalCount / limit);
    const items = await Movie.find({ category: /netflix/i, type: 'movie' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    res.render('pages/front/catalog', {
      title: 'Netflix Movies',
      items,
      currentPage: page,
      totalPages,
      description: 'Browse all Netflix movies available on Flixify.',
      keywords: 'netflix movies, catalog, streaming, netflix',
      section: 'netflix_movies'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
exports.movies_top_rated_get = async (req, res) => {
  const page = parseInt(req.query.page) || 1; 
  const limit = 30;
  const skip = (page - 1) * limit;

  try {
    const totalCount = await Movie.countDocuments({ category: 'top_rated', type: 'movie' });
    const totalPages = Math.ceil(totalCount / limit);

    const items = await Movie.find({ category: 'top_rated', type: 'movie' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.render('pages/front/catalog', {
      title: 'Top Rated Movies',
      items,
      currentPage: page,
      totalPages,
      description: 'Browse all top-rated movies available on Flixify.',
      keywords: 'top rated movies, catalog, streaming, top rated',
      section: 'top_rated_movies'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

//tv
exports.tv_get = async (req, res) => {
  const page = parseInt(req.query.page) || 1; 
  const limit = 30;
  const skip = (page - 1) * limit;

  try {
    const totalCount = await Movie.countDocuments({ type: 'tv' });
    const totalPages = Math.ceil(totalCount / limit);

    const items = await Movie.find({  type: 'tv' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.render('pages/front/catalog', {
      title: 'TV Shows',
      items,
      currentPage: page,
      totalPages,
      description: 'Browse all TV shows available on Flixify.',
      keywords: 'tv shows, catalog, streaming, tv',
      section: 'tv_shows'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
exports.tv_netflix_get = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const skip = (page - 1) * limit;

  try {
    const totalCount = await Movie.countDocuments({ category: /netflix/i, type: 'tv' });
    const totalPages = Math.ceil(totalCount / limit);

    const items = await Movie.find({ category: /netflix/i, type: 'tv' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.render('pages/front/catalog', {
      title: 'Netflix TV Shows',
      items,
      currentPage: page,
      totalPages,
      description: 'Browse all Netflix TV shows available on Flixify.',
      keywords: 'netflix, tv shows, catalog, streaming',
      section: 'netflix_tv_shows'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
exports.tv_top_rated_get = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const skip = (page - 1) * limit;
  try {
    const totalCount = await Movie.countDocuments({ category: 'top_rated_tv', type: 'tv' });
    const totalPages = Math.ceil(totalCount / limit);
    const items = await Movie.find({ category: 'top_rated_tv', type: 'tv' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    res.render('pages/front/catalog', {
      title: 'Top Rated TV Shows',
      items,
      currentPage: page,
      totalPages,
      description: 'Browse all top-rated TV shows available on Flixify.',
      keywords: 'top rated tv shows, catalog, streaming, top rated',
      section: 'top_rated_tv_shows'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

//asian series
exports.asian_series_get = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const skip = (page - 1) * limit;

  try {
    const totalCount = await Movie.countDocuments({ category: 'asian_series', type: 'tv' });
    const totalPages = Math.ceil(totalCount / limit);

    const items = await Movie.find({ category: 'asian_tv', type: 'tv' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.render('pages/front/catalog', {
      title: 'Asian Series',
      items,
      currentPage: page,
      totalPages,
      description: 'Browse all Asian series available on Flixify.',
      keywords: 'asian series, catalog, streaming, asian',
      section: 'asian_series'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
exports.asian_top_rated_get = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const skip = (page - 1) * limit;
  try {
    const totalCount = await Movie.countDocuments({ category: 'asian_tv', type: 'tv' ,rating: { $gte: 7.5 }});
    const totalPages = Math.ceil(totalCount / limit);
    const items = await Movie.find({ category: 'asian_tv', type: 'tv' ,rating: { $gte: 7.5 }}) 
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    res.render('pages/front/catalog', {
      title: 'Top Rated Asian Series',
      items,
      currentPage: page,
      totalPages,
      description: 'Browse all top-rated Asian series available on Flixify.',
      keywords: 'top rated asian series, catalog, streaming, asian',
      section: 'top_rated_asian_series'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
exports.asian_netflix_get = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const skip = (page - 1) * limit;
  try {
    const totalCount = await Movie.countDocuments({ category: 'asian_tv_netflix', type: 'tv' });
    const totalPages = Math.ceil(totalCount / limit);

    const items = await Movie.find({ category: 'asian_tv_netflix', type: 'tv' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.render('pages/front/catalog', {
      title: 'Asian Netflix Series',
      items,
      currentPage: page,
      totalPages,
      description: 'Browse all Asian Netflix series available on Flixify.',
      keywords: 'asian netflix series, catalog, streaming, netflix',
      section: 'netflix_series'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// anime
exports.anime_get = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const skip = (page - 1) * limit;

  try {
    const totalCount = await Movie.countDocuments({ category: { $in: ['anime', 'anime_tv', 'animated'] } });
    const totalPages = Math.ceil(totalCount / limit);

    const items = await Movie.find({ category: { $in: ['anime', 'anime_tv', 'animated'] } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.render('pages/front/catalog', {
      title: 'Anime Series',
      items,
      currentPage: page,
      totalPages,
      description: 'Browse all anime series available on Flixify.',
      keywords: 'anime series, catalog, streaming, anime',
      section: 'anime_series'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
exports.anime_series_get = async (req, res) => {
   const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const skip = (page - 1) * limit;

  try {
    const totalCount = await Movie.countDocuments({ category: 'anime_tv', type: 'tv' });
    const totalPages = Math.ceil(totalCount / limit);

    const items = await Movie.find({ category: 'anime_tv', type: 'tv' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.render('pages/front/catalog', {
      title: 'Anime Series',
      items,
      currentPage: page,
      totalPages,
      description: 'Browse all anime series available on Flixify.',
      keywords: 'anime series, catalog, streaming, anime',
      section: 'anime_series'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.anime_movies_get = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const skip = (page - 1) * limit;

  try {
    const totalCount = await Movie.countDocuments({ category: 'anime', type: 'movie' });
    const totalPages = Math.ceil(totalCount / limit);

    const items = await Movie.find({ category: 'anime', type: 'movie' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.render('pages/front/catalog', {
      title: 'Anime Movies',
      items,
      currentPage: page,
      totalPages,
      description: 'Browse all anime movies available on Flixify.',
      keywords: 'anime movies, catalog, streaming, anime',
      section: 'anime_movies'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.anime_top_rated_get = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const skip = (page - 1) * limit;

  try {
    const totalCount = await Movie.countDocuments({category: { $in: ['anime', 'anime_tv'] },rating: { $gte: 7.5 } });
    const totalPages = Math.ceil(totalCount / limit);

    const items = await Movie.find({ category: { $in: ['anime', 'anime_tv'] }, rating: { $gte: 7.5 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.render('pages/front/catalog', {
      title: 'Top Rated Anime',
      items,
      currentPage: page,
      totalPages,
      description: 'Browse all top-rated anime available on Flixify.',
      keywords: 'top rated anime, catalog, streaming, anime',
      section: 'anime_top_rated'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.anime_netflix_get = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const skip = (page - 1) * limit;

  try {
    const totalCount = await Movie.countDocuments({ category: {  $in: ['anime_netflix', 'anime_tv_netflix'] }});
    const totalPages = Math.ceil(totalCount / limit);

    const items = await Movie.find({ category: { $in: ['anime_netflix', 'anime_tv_netflix'] }})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.render('pages/front/catalog', {
      title: 'Anime on Netflix',
      items,
      currentPage: page,
      totalPages,
      description: 'Browse all anime available on Netflix.',
      keywords: 'anime, netflix, catalog, streaming',
      section: 'anime_netflix'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.movie_details_get = async (req, res) => {
  try {
    const movieId = req.params.id;
    const movie = await Movie.findOne({ tmdbId: movieId });

    if (!movie) {
      return res.status(404).render('pages/front/error/404', {
        title: 'Movie Not Found',
        description: 'The movie you are looking for does not exist.',
        keywords: '404, not found, movie'
      });
    }

    // جلب التعليقات والمراجعات والصور من TMDb
    const apiKey = process.env.TMDB_API_KEY;
    const tmdbId = movie.tmdbId;

    const [reviewsRes, imagesRes ,videosRes] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}/reviews`, {
        params: { api_key: apiKey, language: 'en-US', page: 1 }
      }),
      axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}/images`, {
        params: { api_key: apiKey }
      }),
      axios.get(`https://api.themoviedb.org/3/movie/${tmdbId}/videos`, {
        params: { api_key: apiKey, language: 'en-US' }
      })
    ]);

    // استخراج المراجعات والصور من الردود
    const apiReviews = reviewsRes.data.results || [];
    const apiImages = imagesRes.data.backdrops || [];
    // استخراج رابط التريلر من الفيديوهات
    const videos = videosRes.data.results || [];
    const trailerVideo = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const trailerUrl = trailerVideo ? `https://www.youtube.com/watch?v=${trailerVideo.key}` : null;

    // البحث باستخدام ObjectId الفيلم في الداتا بيز
    const localReviews = await Review.find({ movie: movie._id }).populate('user');

    // جلب المواسم إذا كان العمل مسلسل
    let tvSeasons = [];
    if (movie.category === 'tv_series') {
      const tvRes = await axios.get(`https://api.themoviedb.org/3/tv/${tmdbId}`, {
        params: { api_key: apiKey, language: 'en-US' }
      });
      tvSeasons = tvRes.data.seasons || [];
    }

    // إنشاء رابط URL الحالي للمشاركة
    const requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;


        // جلب أفلام مشابهة 
    const relatedMovies = await Movie.find({
      category: movie.category,
      _id: { $ne: movie._id } // استثناء الفيلم الحالي
    }).limit(6);

    res.render('pages/front/details', {
      title: movie.title,
      tmdbId: movie.tmdbId,
      overview: movie.overview,
      releaseDate: new Date(movie.releaseDate),
      runtime: movie.runtime,
      rating: movie.rating,
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl,
      genres: movie.genres.join(', '),
      language: movie.language,
      category: movie.category,
      country: movie.country,
      isFeatured: movie.isFeatured,
      keywords: `${movie.title}, ${movie.category}, details`,
      movie,
      apiReviews,
      localReviews,
      apiImages,
      trailerUrl: trailerUrl,
      tvSeasons,
      relatedMovies,
      requestUrl,
      movieId
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.admin_dashboard_get = async (req, res) => {
  try {
    // جلب بيانات أساسية
    const [totalMovies, totalUsers] = await Promise.all([
      Movie.countDocuments(),
      User.countDocuments()
    ]);

    // جلب عدد التعليقات اللي فيها comment سواء كانت من مستخدمين محليين أو مستوردة (في مودل Review)
    // شرط user موجود يعني تعليق محلي، شرط user غير موجود يعني تعليق من API (مستورد)
    const totalComments = await Review.countDocuments({ comment: { $exists: true, $ne: null, $ne: '' } });
    const localComments = await Review.countDocuments({ comment: { $exists: true, $ne: null, $ne: '' }, user: { $ne: null } });

    // جلب عدد التقييمات اللي فيها rating سواء محلية أو مستوردة (نفس الفكرة)
    const localReviews = await Review.countDocuments({ rating: { $ne: null }, user: { $ne: null } });

    res.render('pages/dashboard', {
      title: 'Dashboard - Flixify',
      description: 'Manage your movies and TV shows on Flixify.',
      keywords: 'dashboard, movies, tv shows, management',
      totalMovies,
      totalUsers,
      totalComments,
      localComments,
      localReviews
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.admin_settings_get = async (req, res) => {
  try {
    // جلب الإعدادات من قاعدة البيانات
    const settings = await Settings.findOne();

    res.render('pages/dashboard/settings', {
      title: 'Admin Settings',
      settings,
      success: req.flash('success'),
      error: req.flash('error')
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.admin_settings_put = async (req, res) => {
  try {
    const { siteName, contact = {}, social = {}, copyrightText } = req.body;

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    let logoUrl = req.body.logoUrl || settings.logoUrl || '';

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'flixify/logo',
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      });

      logoUrl = result.secure_url;

      fs.unlinkSync(req.file.path);
    }

    settings.siteName = siteName || settings.siteName;
    settings.logoUrl = logoUrl;

    settings.contact = {
      phone: contact.phone || settings.contact?.phone || '',
      email: contact.email || settings.contact?.email || '',
    };

    settings.social = {
      facebook: social.facebook || settings.social?.facebook || '',
      instagram: social.instagram || settings.social?.instagram || '',
      twitter: social.twitter || settings.social?.twitter || '',
      vk: social.vk || settings.social?.vk || '',
    };

    settings.copyrightText = copyrightText || settings.copyrightText || '';

    await settings.save();

    req.flash('success', 'Settings updated successfully');
    res.redirect('/admin/settings');
  } catch (error) {
    console.error('Error updating settings:', error);
    req.flash('error', 'Failed to update settings');
    res.redirect('/admin/settings');
  }
};

exports.admin_add_movies_series_get = (req, res) => {
  res.render('pages/dashboard/addItems', {
    title: 'Add Movie/Series',
  });
}

exports.admin_add_movies_series_post = async (req, res) => {
  try {
    await seedMovies();  // تشغيل الدالة التي تجلب وتضيف الأفلام والمسلسلات

    req.flash('success', 'Movies and series added successfully!');
    res.redirect('/admin/add-movies-series');
  } catch (error) {
    console.error('Error seeding movies and series:', error);
    req.flash('error', 'Failed to add movies and series. Please try again later.');

    res.redirect('/admin/add-movies-series');
  }
};