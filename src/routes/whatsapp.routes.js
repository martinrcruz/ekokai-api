const express = require('express');
const router = express.Router();
const { dialogflowWebhook } = require('../controllers/whatsapp.controller');

console.log('[WHATSAPP-ROUTES] 🚀 Registrando ruta POST /whatsapp');
router.post('/whatsapp', dialogflowWebhook);
console.log('[WHATSAPP-ROUTES] ✅ Ruta POST /whatsapp registrada correctamente'); // ✅ SOLO "/whatsapp"

module.exports = router;
