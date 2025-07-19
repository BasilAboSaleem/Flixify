const {axios, Movie, Review, User, Settings, Watchlist, seedMovies, fs, path, multer, upload, cloudinary, e} = require('./utils');

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