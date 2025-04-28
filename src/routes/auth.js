const express = require('express');
const rateLimit = require('express-rate-limit');
const { signup } = require('../controllers/authController');

const router = express.Router();

const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: 'Too many signup attempts, please try again later.' },
  });

  router.post('/signup', signupLimiter, signup);

  module.exports = router;