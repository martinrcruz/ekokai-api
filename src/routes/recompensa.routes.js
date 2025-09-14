const express = require('express');
const router = express.Router();
const recompensaCtrl = require('../controllers/recompensa.controller');
const { permitirRoles } = require('../middleware/auth.middleware');

// Obtener recompensas disponibles (público)
router.get('/disponibles', recompensaCtrl.obtenerRecompensasDisponibles);

// Validar código de recompensa (público)
router.get('/validar/:codigo', recompensaCtrl.validarCodigoRecompensa);

// Crear recompensa (solo administradores)
router.post('/', permitirRoles('administrador'), recompensaCtrl.crearRecompensa);

// Actualizar recompensa (solo administradores)
router.put('/:id', permitirRoles('administrador'), recompensaCtrl.actualizarRecompensa);

// Eliminar recompensa (solo administradores)
router.delete('/:id', permitirRoles('administrador'), recompensaCtrl.eliminarRecompensa);

module.exports = router;
