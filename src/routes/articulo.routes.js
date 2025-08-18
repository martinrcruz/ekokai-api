const express = require('express');
const router = express.Router();
const articuloCtrl = require('../controllers/articulo.controller');
const { authMiddleware, permitirRoles } = require('../middleware/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);
router.use(permitirRoles('administrador','encargado'));

// Rutas CRUD
router.get('/', articuloCtrl.listarArticulos);
router.post('/', articuloCtrl.crearArticulo);
router.get('/:id', articuloCtrl.obtenerArticulo);
router.put('/:id', articuloCtrl.actualizarArticulo);
router.delete('/:id', articuloCtrl.eliminarArticulo);

module.exports = router; 