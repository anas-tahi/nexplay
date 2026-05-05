const express = require('express');
const router = express.Router();
const { register, login, createGuest } = require('../controllers/authController');

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Create guest session
router.post('/guest', createGuest);

module.exports = router;
