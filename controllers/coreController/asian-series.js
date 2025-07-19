const {axios, Movie, Review, User, Settings, Watchlist, seedMovies, fs, path, multer, upload, cloudinary, e} = require('./utils');

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