require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Movie = require('./models/Movie');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';

// خريطة تحويل أرقام الـ genres إلى أسماء نصية
const genreMap = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  seedMovies();
})
.catch(err => console.error('MongoDB connection error:', err));

// تعديل الدالة لتدعم extraParams ولتعبئة genres بشكل صحيح
async function seedMoviesByCategory(category, endpoint, extraParams = {}) {
  try {
    const response = await axios.get(`${TMDB_API_URL}${endpoint}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1,
        ...extraParams // دمج الفلاتر الإضافية 
      }
    });

    const movies = response.data.results;

    for (const m of movies) {
      const existing = await Movie.findOne({ tmdbId: m.id });
      if (existing) {
        console.log(`Movie "${m.title}" already exists, skipping.`);
        continue;
      }

      // تحويل genre_ids إلى أسماء نصوص
      const genres = m.genre_ids ? m.genre_ids.map(id => genreMap[id]).filter(Boolean) : [];

      const newMovie = new Movie({
        tmdbId: m.id,
        title: m.title || 'Untitled',
        overview: m.overview || 'No description available.',
        releaseDate: m.release_date,
        rating: m.vote_average,
        posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
        backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : '',
        genres: genres,  // 
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
  await seedMoviesByCategory('tv_series', '/tv/popular');
  await seedMoviesByCategory('animated', '/discover/movie', { with_genres: 16 });

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
