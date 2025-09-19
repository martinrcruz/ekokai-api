const express = require('express');
const router = express.Router();
const canjeCtrl = require('../controllers/canje.controller');
const { authMiddleware, permitirRoles } = require('../middleware/auth.middleware');

// Registrar un canje de reciclaje
router.post('/', authMiddleware, permitirRoles('administrador', 'vecino', 'encargado'), canjeCtrl.registrarCanje);

// Obtener historial de canjes de reciclaje de un usuario
router.get('/usuario/:usuarioId', authMiddleware, permitirRoles('administrador', 'vecino', 'encargado'), canjeCtrl.historialCanjesUsuario);

// Registrar un canje de recompensa
router.post('/recompensa', authMiddleware, permitirRoles('administrador', 'vecino', 'encargado'), canjeCtrl.registrarCanjeRecompensa);

// Obtener historial de canjes de recompensas de un usuario
router.get('/recompensa/usuario/:usuarioId', authMiddleware, permitirRoles('administrador', 'vecino', 'encargado'), canjeCtrl.historialCanjesRecompensaUsuario);

module.exports = router; 