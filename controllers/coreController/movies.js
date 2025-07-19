const {axios, Movie, Review, User, Settings, Watchlist, seedMovies, fs, path, multer, upload, cloudinary, e} = require('./utils');

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