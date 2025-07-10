require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Movie = require('./models/Movie');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  seedMovies();
})
.catch(err => console.error('MongoDB connection error:', err));

async function seedMoviesByCategory(category, endpoint) {
  try {
    const response = await axios.get(`${TMDB_API_URL}${endpoint}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1,
      }
    });

    const movies = response.data.results;

    for (const m of movies) {
      const existing = await Movie.findOne({ tmdbId: m.id });
      if (existing) {
        console.log(`Movie "${m.title}" already exists, skipping.`);
        continue;
      }

      const newMovie = new Movie({
        tmdbId: m.id,
        title: m.title,
        overview: m.overview,
        releaseDate: m.release_date,
        rating: m.vote_average,
        posterUrl: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
        backdropUrl: `https://image.tmdb.org/t/p/w780${m.backdrop_path}`,
        genres: [],
        trailerUrl: '',
        language: m.original_language,
        category: category,
      });

      await newMovie.save();
      console.log(`Saved movie: ${m.title} [Category: ${category}]`);
    }
  } catch (error) {
    console.error(`Error seeding ${category} movies:`, error);
  }
}

async function seedMovies() {
  await seedMoviesByCategory('popular', '/movie/popular');
  await seedMoviesByCategory('coming_soon', '/movie/upcoming');
  await seedMoviesByCategory('top_rated', '/movie/top_rated');

  // Reset isFeatured to false for all movies
  await Movie.updateMany({}, { isFeatured: false });

  // Set first 10 movies as featured
  const featured = await Movie.find().limit(10);
  for (const movie of featured) {
    movie.isFeatured = true;
    await movie.save();
  }

  console.log('Seeding all categories completed and featured movies set!');
  process.exit(0);
}
