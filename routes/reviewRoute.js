const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { check, validationResult } = require("express-validator");
const authMiddlewares = require('../middlewares/authMiddlewares');


router.post('/add-comment', 
    authMiddlewares.requireAuth, reviewController.add_comment_post
);
router.post('/add-review', 
    authMiddlewares.requireAuth, reviewController.add_review_post
);

module.exports = router;