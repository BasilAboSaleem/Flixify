const express = require('express');
const router = express.Router();
const coreCntroller = require('../controllers/coreController');

router.get('/', coreController.index_get);

router.get('/dashboard', (req, res) => {
  res.render('pages/dashboard', {
    title: 'Dashboard - Flixify',
    description: 'Manage your movies and TV shows on Flixify.',
    keywords: 'dashboard, movies, tv shows, management',
  });
});

module.exports = router;