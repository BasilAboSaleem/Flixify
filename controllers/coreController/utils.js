const axios = require('axios');
const Movie = require('../../models/Movie');
const Review = require('../../models/Review');
const User = require('../../models/User');
const Settings = require('../../models/Settings');
const Watchlist = require('../../models/Watchlist');
const seedMovies = require('../../utils/seedMovies'); 
const fs = require('fs');
const path = require('path');
const multer  = require('multer')
const upload = multer({storage: multer.diskStorage({})});
const cloudinary = require("cloudinary").v2;

 // Configuration cloudinary اعدادات الكلاودنري
 cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
  });
const e = require('express');


module.exports = {axios, Movie, Review, User, Settings, Watchlist, seedMovies, fs, path, multer, upload, cloudinary, e
};