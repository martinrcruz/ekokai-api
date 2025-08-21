const express = require('express');
const router = express.Router();
const cuponCtrl = require('../controllers/cupon.controller');
const { authMiddleware, permitirRoles } = require('../middleware/auth.middleware');

router.use(authMiddleware);
router.use(permitirRoles('administrador','encargado'));

// Rutas específicas (deben ir antes que las rutas con parámetros)
router.get('/activos', cuponCtrl.listarCuponesActivos);
router.get('/buscar', cuponCtrl.buscarCupones);
router.get('/estadisticas', cuponCtrl.obtenerEstadisticas);
router.get('/canjes', cuponCtrl.listarCanjes);

// Generación masiva de cupones
router.post('/generar-masivos', cuponCtrl.generarCuponesMasivos);

// Rutas básicas CRUD
router.get('/', cuponCtrl.listarCupones);
router.post('/', cuponCtrl.crearCupon);
router.get('/:id', cuponCtrl.obtenerCuponPorId);
router.put('/:id', cuponCtrl.actualizarCupon);
router.delete('/:id', cuponCtrl.eliminarCupon);

// Rutas adicionales con parámetros
router.put('/:id/activar', cuponCtrl.activarCupon);
router.put('/:id/desactivar', cuponCtrl.desactivarCupon);

// Asociación de usuarios y comercios
router.post('/:id/asociar-usuario', cuponCtrl.asociarUsuario);
router.delete('/:cuponId/asociar-usuario/:usuarioId', cuponCtrl.desasociarUsuario);
router.post('/:id/asociar-comercio', cuponCtrl.asociarComercio);
router.delete('/:cuponId/asociar-comercio/:comercioId', cuponCtrl.desasociarComercio);

// Gestión de canjes (DEBE ir ANTES que las rutas con :id)
router.put('/canjes/:id/aprobar', cuponCtrl.aprobarCanje);
router.put('/canjes/:id/rechazar', cuponCtrl.rechazarCanje);

// Canje de cupones
router.post('/:id/canjear', cuponCtrl.canjearCupon);

module.exports = router; 