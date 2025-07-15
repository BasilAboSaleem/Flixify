const axios = require('axios');
const Movie = require('../models/Movie');
const Review = require('../models/Review');

exports.index_get = async (req, res) => {
  try {
const allMovies = await Movie.find(); 

const featuredMovies = allMovies.filter(movie => movie.isFeatured);
const newReleases = [...allMovies].sort((a, b) => b.createdAt - a.createdAt).slice(0, 12);
const movies = allMovies.filter(movie => movie.category === 'popular').slice(0, 12);
const tvSeries = allMovies.filter(movie => movie.category === 'tv_series').slice(0, 12);
const animatedMovies = allMovies.filter(movie => movie.category === 'animated').slice(0, 12);
const animeMovies = allMovies.filter(movie => movie.category === 'anime').slice(0, 12);
const expectedPremiere = allMovies.filter(movie => movie.category === 'coming_soon').slice(0, 6);


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
      expectedPremiere
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
exports.all_movies_get = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // الصفحة الحالية، الافتراضي 1
  const limit = 30;
  const skip = (page - 1) * limit;
  try {
    const totalCount = await Movie.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

const items = await Movie.find({ category: { $ne: 'tv_series' } })
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

exports.catalog_get = async (req, res) => {
  try {
    const allMovies = await Movie.find().sort({ createdAt: -1 }).limit(40); 
    const expectedPremiere = allMovies.filter(movie => movie.category === 'coming_soon').slice(0, 6);


    res.render('pages/front/catalog', {
      title: 'Catalog - Flixify',
      description: 'Browse our extensive catalog of movies and TV shows.',
      keywords: 'catalog, movies, tv shows, streaming',
      movies: allMovies,
      expectedPremiere
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};





