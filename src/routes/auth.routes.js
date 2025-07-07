const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');

// POST /auth/login
router.post('/login', authCtrl.login);

module.exports = router;
