const express = require('express');
const router = express.Router();
const entregaCtrl = require('../controllers/entregaresiduo.controller');
const { authMiddleware, permitirRoles } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Registrar entrega (solo encargados)
router.post('/', permitirRoles('encargado'), entregaCtrl.registrarEntrega);

// Ver historial de un vecino
router.get('/usuario/:usuarioId', permitirRoles('vecino', 'encargado', 'administrador'), entregaCtrl.historialUsuario);

// Ver historial completo (solo administradores)
router.get('/historial', permitirRoles('administrador'), entregaCtrl.historialCompleto);

// Ver estadísticas (solo administradores)
router.get('/estadisticas', permitirRoles('administrador'), entregaCtrl.estadisticas);

module.exports = router;
