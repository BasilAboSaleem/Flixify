const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  tmdbId: { type: Number, required: true, unique: true }, // ID من TMDb
  title: String,
  overview: String,
  releaseDate: String,
  runtime: Number,
  rating: Number,
  posterUrl: String,
  backdropUrl: String,
  trailerUrl: String,
  genres: [String],
  language: String,
  category: { type: String, required: true },  
  country: String,
  isFeatured: { type: Boolean, default: false }, 
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
