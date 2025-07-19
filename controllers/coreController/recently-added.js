const {axios, Movie, Review, User, Settings, Watchlist, seedMovies, fs, path, multer, upload, cloudinary, e} = require('./utils');

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