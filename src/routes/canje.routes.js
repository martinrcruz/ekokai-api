const express = require('express');
const router = express.Router();
const canjeCtrl = require('../controllers/canje.controller');
const { verificarToken, permitirRoles } = require('../middleware/auth.middleware');

// Registrar un canje
router.post('/', verificarToken, permitirRoles('administrador', 'vecino', 'encargado'), canjeCtrl.registrarCanje);

// Obtener historial de canjes de un usuario
router.get('/usuario/:usuarioId', verificarToken, permitirRoles('administrador', 'vecino', 'encargado'), canjeCtrl.historialCanjesUsuario);

module.exports = router; 