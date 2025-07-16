const axios = require('axios');
const Movie = require('../models/Movie');
const Review = require('../models/Review');

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
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
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
      requestUrl
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};







