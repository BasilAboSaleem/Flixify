const {axios, Movie, Review, User, Settings, Watchlist, seedMovies, fs, path, multer, upload, cloudinary, e} = require('./utils');

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
