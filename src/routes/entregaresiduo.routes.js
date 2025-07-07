const express = require('express');
const router = express.Router();
const entregaCtrl = require('../controllers/entregaresiduo.controller');
const { authMiddleware, permitirRoles } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Registrar entrega (solo encargados)
router.post('/', permitirRoles('encargado'), entregaCtrl.registrarEntrega);

// Ver historial de un vecino
router.get('/usuario/:usuarioId', permitirRoles('vecino', 'encargado', 'administrador'), entregaCtrl.historialUsuario);

module.exports = router;
