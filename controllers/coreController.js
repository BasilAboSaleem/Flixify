const Movie = require('../models/Movie');

exports.index_get = async (req, res) => {
  try {
    const featuredMovies = await Movie.find({ isFeatured: true }).limit(10).exec();

    res.render('pages/index', {
      title: 'Flixify',
      description: 'Discover and manage your favorite movies and TV shows.',
      keywords: 'movies, tv shows, streaming, management',
      featuredMovies,
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
