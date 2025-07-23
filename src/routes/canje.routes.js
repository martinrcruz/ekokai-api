const express = require('express');
const router = express.Router();
const canjeCtrl = require('../controllers/canje.controller');
const { permitirRoles } = require('../middleware/auth.middleware');

// Registrar un canje
router.post('/', permitirRoles('administrador', 'vecino', 'encargado'), canjeCtrl.registrarCanje);

// Obtener historial de canjes de un usuario
router.get('/usuario/:usuarioId', permitirRoles('administrador', 'vecino', 'encargado'), canjeCtrl.historialCanjesUsuario);

module.exports = router; 