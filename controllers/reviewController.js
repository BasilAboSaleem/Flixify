const axios = require('axios');
const Movie = require('../models/Movie');
const Review = require('../models/Review');
const e = require('express');


exports.add_comment_post = async (req, res) => {
  const { comment, movieId } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    return res.redirect('/signin'); // احتياطًا لو وصل من غير تسجيل دخول
  }

  if (!comment || !comment.trim()) {
    return res.status(400).send('Comment cannot be empty');
  }

  try {
    // التحقق من وجود الفيلم الذي أُرسل مع التعليق
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).send('Movie not found');
    }

    // إنشاء التعليق
    const newReview = new Review({
      user: userId,
      movie: movie._id, // ربط التعليق بالفيلم الحقيقي من الـ DB
      comment: comment.trim(),
      rating: null // لأنه فقط تعليق
    });

    await newReview.save();

    // بعد الحفظ، إعادة توجيه المستخدم إلى صفحة الفيلم نفسه
    res.redirect(`/movies/${movie.tmdbId}`); // تمرير tmdbId لإعادة المستخدم لصفحة الفيلم

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).send('Internal server error');
  }
};