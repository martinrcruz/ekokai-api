const express = require('express');
const router = express.Router();
const { dialogflowWebhook } = require('../controllers/whatsapp.controller');

router.post('/whatsapp', dialogflowWebhook); // ✅ SOLO "/whatsapp"

module.exports = router;
