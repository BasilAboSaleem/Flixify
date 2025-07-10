const Movie = require('../models/Movie');

exports.index_get = async (req, res) => {
  try {
    const featuredMovies = await Movie.find({ isFeatured: true }).limit(10);
    const newReleases = await Movie.find().sort({ createdAt: -1 }).limit(12);

    const movies = await Movie.find({ category: 'popular' }).limit(12);
    const tvSeries = await Movie.find({ category: 'tv_series' }).limit(12);
    const animatedMovies = await Movie.find({ category: 'animated' }).limit(12);

    res.render('pages/index', {
      title: 'Flixify',
      description: 'Discover and manage your favorite movies and TV shows.',
      keywords: 'movies, tv shows, streaming, management',
      featuredMovies,
      newReleases,
      movies,
      tvSeries,
      animatedMovies
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
