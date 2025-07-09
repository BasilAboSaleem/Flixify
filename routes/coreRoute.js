const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/index', {
    title: 'Flixify - Your Movie and TV Show Hub',
    description: 'Discover the latest movies and TV shows with Flixify. Stream your favorites now!',
    keywords: 'movies, tv shows, streaming, flixify',
  });
});

router.get('/dashboard', (req, res) => {
  res.render('pages/dashboard', {
    title: 'Dashboard - Flixify',
    description: 'Manage your movies and TV shows on Flixify.',
    keywords: 'dashboard, movies, tv shows, management',
  });
});

module.exports = router;