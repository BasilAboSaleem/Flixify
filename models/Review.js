const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  title: String,
  rating: { type: Number, min: 0, max: 10 },
  comment: String,
  source: { type: String, default: 'local' } // 'local' or 'tmdb'api
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
