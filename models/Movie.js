const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  tmdbId: { type: Number, unique: true },
  title: String,
  overview: String,
  releaseDate: Date,
  rating: Number,
  runtime: Number,
  posterUrl: String,
  backdropUrl: String,
  genres: [String],
  trailerUrl: String,
  language: String,
  category: String, // popular, coming_soon, asian, netflix, anime ...
  type: {
    type: String,
    enum: ['movie', 'tv'],
    required: true,
  },
  country: String,
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
