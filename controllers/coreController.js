const Movie = require('../models/Movie');

exports.index_get = async (req, res) => {
    try{
        const movies = await Movie.find().limit(20).sort({ createdAt: -1 });
        res.render('pages/index', {
            title: 'Flixify - Your Movie and TV Show Hub',
            description: 'Discover the latest movies and TV shows with Flixify. Stream your favorites now!',
            keywords: 'movies, tv shows, streaming, flixify',
            movies
        });
    }
    catch(err){
        console.error(err);
        res.status(500).send('Server Error');
    }
}