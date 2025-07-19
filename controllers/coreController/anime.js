const {axios, Movie, Review, User, Settings, Watchlist, seedMovies, fs, path, multer, upload, cloudinary, e} = require('./utils');

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
