const express = require('express');
const router = express.Router();
const cuponCtrl = require('../controllers/cupon.controller');
const { authMiddleware, permitirRoles } = require('../middleware/auth.middleware');

router.use(authMiddleware);
router.use(permitirRoles('administrador','encargado'));

// Rutas específicas (deben ir antes que las rutas con parámetros)
router.get('/activos', cuponCtrl.listarCuponesActivos);
router.get('/buscar', cuponCtrl.buscarCupones);

// Rutas básicas CRUD
router.get('/', cuponCtrl.listarCupones);
router.post('/', cuponCtrl.crearCupon);
router.get('/:id', cuponCtrl.obtenerCuponPorId);
router.put('/:id', cuponCtrl.actualizarCupon);
router.delete('/:id', cuponCtrl.eliminarCupon);

// Rutas adicionales con parámetros
router.put('/:id/activar', cuponCtrl.activarCupon);
router.put('/:id/desactivar', cuponCtrl.desactivarCupon);

module.exports = router; 