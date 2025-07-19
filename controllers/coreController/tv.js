const {axios, Movie, Review, User, Settings, Watchlist, seedMovies, fs, path, multer, upload, cloudinary, e} = require('./utils');

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
