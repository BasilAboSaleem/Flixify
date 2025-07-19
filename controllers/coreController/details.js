const {axios, Movie, Review, User, Settings, Watchlist, seedMovies, fs, path, multer, upload, cloudinary, e} = require('./utils');

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
    return res.status(500).render('pages/front/error/404');
  }
};
