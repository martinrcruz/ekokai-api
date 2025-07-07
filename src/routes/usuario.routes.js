const express = require('express');
const router = express.Router();
const usuarioCtrl = require('../controllers/usuario.controller');
const { authMiddleware, permitirRoles } = require('../middleware/auth.middleware');

// Aplica JWT a todas las rutas
router.use(authMiddleware);

// ENCARGADO registra nuevos vecinos
router.post('/registrar', permitirRoles('administrador','encargado'), usuarioCtrl.registrarVecino);

// ADMINISTRADOR lista usuarios
router.get('/', permitirRoles('administrador'), usuarioCtrl.listarUsuarios);

// TODOS consultan su perfil
router.get('/:id', permitirRoles('administrador', 'encargado', 'vecino'), usuarioCtrl.obtenerUsuario);

// Requiere autenticación y rol ADMIN
router.post('/registrar-encargado', authMiddleware, permitirRoles('administrador'), usuarioCtrl.registrarConRol);
module.exports = router;
