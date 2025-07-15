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

  // إضافات للمسلسلات
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',

  // أنواع أخرى محتملة
  10768: 'War & Politics',
  10769: 'Drama & Romance',
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

// جلب رابط التريلر لفيلم/مسلسل
async function getTrailerUrl(type, id) {
  try {
    const res = await axios.get(`${TMDB_API_URL}/${type}/${id}/videos`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US'
      }
    });
    const videos = res.data.results;
    // اختر أول فيديو تريلر رسمي أو فيديو يعادل التريلر
    const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos[0];
    if (trailer) {
      return `https://www.youtube.com/watch?v=${trailer.key}`;
    }
    return '';
  } catch (error) {
    console.error('Error fetching trailer:', error);
    return '';
  }
}

// دالة لجلب وحفظ الأفلام أو المسلسلات حسب التصنيف والنوع
async function seedMoviesByCategory(category, endpoint, type, extraParams = {}) {
  try {
    const response = await axios.get(`${TMDB_API_URL}${endpoint}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1,
        ...extraParams,
      }
    });

    const results = response.data.results;

    for (const m of results) {
      const existing = await Movie.findOne({ tmdbId: m.id });
      if (existing) {
        console.log(`Movie/TV "${m.title || m.name}" already exists, skipping.`);
        continue;
      }

      const genres = m.genre_ids ? m.genre_ids.map(id => genreMap[id]).filter(Boolean) : [];
      const title = m.title || m.name || 'Untitled';
      const releaseDate = m.release_date || m.first_air_date || null;

      // جلب التريلر
      const trailerUrl = await getTrailerUrl(type, m.id);

      const newMovie = new Movie({
        tmdbId: m.id,
        title,
        overview: m.overview || 'No description available.',
        releaseDate,
        rating: m.vote_average,
        posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
        backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : '',
        genres,
        trailerUrl,
        language: m.original_language,
        category,
        type,
        country: (m.production_countries && m.production_countries.length > 0)
          ? m.production_countries.map(c => c.name).join(', ')
          : 'Unknown',
        isFeatured: false,
      });

      await newMovie.save();
      console.log(`Saved ${type} in category "${category}": ${title}`);
    }
  } catch (error) {
    console.error(`Error seeding ${category}:`, error);
  }
}

// دالة خاصة لعمل نتفليكس في نفس القسم مع فلترة خاصة
async function seedNetflixSubcategory(baseCategory, endpoint, type, extraParams = {}) {
  // القسم الأصلي
  await seedMoviesByCategory(baseCategory, endpoint, type, extraParams);

  // قسم نتفليكس الفرعي
  const netflixCategory = `${baseCategory}_netflix`;
  await seedMoviesByCategory(netflixCategory, endpoint, type, {
    ...extraParams,
    with_watch_providers: 8, // Netflix provider ID
    watch_region: 'US',
  });
}

// الدالة الرئيسية لجلب كل الأقسام بكل تفاصيلها
async function seedMovies() {
  // أفلام ومسلسلات شعبية
  await seedNetflixSubcategory('popular', '/movie/popular', 'movie');
  await seedNetflixSubcategory('tv_series', '/tv/popular', 'tv');

  // أفلام ومسلسلات قادمة
  await seedNetflixSubcategory('coming_soon', '/movie/upcoming', 'movie');
  await seedNetflixSubcategory('coming_soon_tv', '/tv/on_the_air', 'tv');

  // أفلام ومسلسلات الأعلى تقييماً
  await seedNetflixSubcategory('top_rated', '/movie/top_rated', 'movie');
  await seedNetflixSubcategory('top_rated_tv', '/tv/top_rated', 'tv');

  // أنمي وكارتون
  await seedMoviesByCategory('animated', '/discover/movie', 'movie', { with_genres: 16 });
  await seedMoviesByCategory('anime', '/discover/movie', 'movie', { with_genres: 16, with_original_language: 'ja' });
  await seedMoviesByCategory('anime_tv', '/discover/tv', 'tv', { with_genres: 16, with_original_language: 'ja' });

  // أفلام آسيوية
  const asianLanguages = ['ja', 'ko', 'zh', 'hi'];
  for (const lang of asianLanguages) {
    await seedMoviesByCategory('asian', '/discover/movie', 'movie', { with_original_language: lang });
  }
  // مسلسلات آسيوية
  for (const lang of asianLanguages) {
    await seedMoviesByCategory('asian_tv', '/discover/tv', 'tv', { with_original_language: lang });
  }

  // نتفليكس آسيوية (أفلام ومسلسلات آسيوية على نتفليكس)
  for (const lang of asianLanguages) {
    await seedMoviesByCategory('asian_netflix', '/discover/movie', 'movie', { with_original_language: lang, with_watch_providers: 8, watch_region: 'US' });
    await seedMoviesByCategory('asian_tv_netflix', '/discover/tv', 'tv', { with_original_language: lang, with_watch_providers: 8, watch_region: 'US' });
  }

  // إعادة تعيين isFeatured لكل الأفلام والمسلسلات
  await Movie.updateMany({}, { isFeatured: false });

  // تعيين أول 10 أفلام/مسلسلات كـ featured
  const featured = await Movie.find().limit(10);
  for (const movie of featured) {
    movie.isFeatured = true;
    await movie.save();
  }

  console.log('Seeding all categories completed and featured movies set!');
  process.exit(0);
}
