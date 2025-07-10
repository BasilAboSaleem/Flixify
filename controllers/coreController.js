const Movie = require('../models/Movie');

exports.index_get = async (req, res) => {
    try {
        res.render('pages/index', {
            title: 'Flixify',
            description: 'Discover and manage your favorite movies and TV shows.',
            keywords: 'movies, tv shows, streaming, management',
        });
     
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}