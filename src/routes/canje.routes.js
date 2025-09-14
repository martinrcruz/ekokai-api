const express = require('express');
const router = express.Router();
const canjeCtrl = require('../controllers/canje.controller');
const { permitirRoles } = require('../middleware/auth.middleware');

// Registrar un canje de reciclaje
router.post('/', permitirRoles('administrador', 'vecino', 'encargado'), canjeCtrl.registrarCanje);

// Obtener historial de canjes de reciclaje de un usuario
router.get('/usuario/:usuarioId', permitirRoles('administrador', 'vecino', 'encargado'), canjeCtrl.historialCanjesUsuario);

// Registrar un canje de recompensa
router.post('/recompensa', permitirRoles('administrador', 'vecino', 'encargado'), canjeCtrl.registrarCanjeRecompensa);

// Obtener historial de canjes de recompensas de un usuario
router.get('/recompensa/usuario/:usuarioId', permitirRoles('administrador', 'vecino', 'encargado'), canjeCtrl.historialCanjesRecompensaUsuario);

module.exports = router; 