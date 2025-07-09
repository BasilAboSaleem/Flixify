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

async function seedMovies() {
  try {
    // مثال: جلب الأفلام الرائجة (Popular)
    const response = await axios.get(`${TMDB_API_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1,
      }
    });

    const movies = response.data.results;

    for (const m of movies) {
      // تحقق من وجود الفيلم قبل الإضافة
      const existing = await Movie.findOne({ tmdbId: m.id });
      if (existing) {
        console.log(`Movie "${m.title}" already exists, skipping.`);
        continue;
      }

      // إنشاء كائن فيلم جديد
      const newMovie = new Movie({
        tmdbId: m.id,
        title: m.title,
        overview: m.overview,
        releaseDate: m.release_date,
        rating: m.vote_average,
        posterUrl: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
        backdropUrl: `https://image.tmdb.org/t/p/w780${m.backdrop_path}`,
        genres: [],  // هنضيفها لاحقًا لو حبينا
        trailerUrl: '', // لاحقًا نجيبها من API التريلر
        language: m.original_language,
      });

      await newMovie.save();
      console.log(`Saved movie: ${m.title}`);
    }

    console.log('Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding movies:', error);
    process.exit(1);
  }
}
