const express = require('express');
const router = express.Router();
const premioController = require('../controllers/premio.controller');
const { authMiddleware, permitirRoles } = require('../middleware/auth.middleware');

// Rutas públicas para el catálogo (no requieren autenticación)
router.get('/catalogo', premioController.obtenerPremiosActivos);
router.get('/catalogo/destacados', premioController.obtenerPremiosDestacados);
router.get('/catalogo/categoria/:categoria', premioController.obtenerPremiosPorCategoria);
router.get('/catalogo/buscar', premioController.buscarPremios);
router.get('/catalogo/:id', premioController.obtenerPremioPorId);

// Rutas protegidas para administradores
router.get('/', authMiddleware, permitirRoles('admin', 'administrador'), premioController.obtenerTodosLosPremios);
router.post('/', authMiddleware, permitirRoles('admin', 'administrador'), premioController.crearPremio);
router.put('/:id', authMiddleware, permitirRoles('admin', 'administrador'), premioController.actualizarPremio);
router.delete('/:id', authMiddleware, permitirRoles('admin', 'administrador'), premioController.eliminarPremio);

module.exports = router;

