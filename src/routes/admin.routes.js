const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');
const { authMiddleware, permitirRoles } = require('../middleware/auth.middleware');

// 🔐 Middleware de autenticación para todas las rutas de administrador
router.use(authMiddleware);

// =======================
// 👥 Usuarios
// =======================

// Listar todos los usuarios
router.get('/usuarios', permitirRoles('administrador'), adminCtrl.listarUsuarios);

// Historial de un usuario
router.get('/usuarios/:id/historial', permitirRoles('administrador'), adminCtrl.historialUsuario);

// =======================
// 🏭 Ecopuntos
// =======================

// Métricas de un ecopunto
router.get('/ecopuntos/:id/metricas', permitirRoles('administrador'), adminCtrl.metricasEcopunto);

// =======================
// 🎁 Premios
// =======================

// Crear un premio
router.post('/premios', permitirRoles('administrador'), adminCtrl.crearPremio);

// Listar premios
router.get('/premios', permitirRoles('administrador'), adminCtrl.listarPremios);

// Actualizar un premio
router.put('/premios/:id', permitirRoles('administrador'), adminCtrl.actualizarPremio);

// Eliminar un premio
router.delete('/premios/:id', permitirRoles('administrador'), adminCtrl.eliminarPremio);

module.exports = router;
