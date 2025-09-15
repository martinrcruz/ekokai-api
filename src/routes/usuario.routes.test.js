const express = require('express');
const router = express.Router();
const usuarioCtrl = require('../controllers/usuario.controller');
const { authMiddleware, permitirRoles } = require('../middleware/auth.middleware');

// ✅ RUTA DE PRUEBA SIN AUTENTICACIÓN
router.get('/test-sin-auth', (req, res) => {
  console.log('🧪 [TEST] Ruta de prueba sin auth accedida');
  res.json({ message: 'Ruta sin auth funcionando', timestamp: new Date().toISOString() });
});

// ✅ RUTA DE PRUEBA CON AUTENTICACIÓN MANUAL
router.get('/test-con-auth', authMiddleware, (req, res) => {
  console.log('🧪 [TEST] Ruta de prueba con auth accedida');
  res.json({ message: 'Ruta con auth funcionando', usuario: req.usuario?.email, timestamp: new Date().toISOString() });
});

// ✅ ADMINISTRADOR lista solo usuarios vecinos (DEBE IR ANTES DE LAS RUTAS CON PARÁMETROS)
router.get('/vecinos', authMiddleware, permitirRoles('administrador'), usuarioCtrl.listarVecinos);

// ✅ ADMINISTRADOR lista usuarios no vecinos (DEBE IR ANTES DE LAS RUTAS CON PARÁMETROS)
router.get('/no-vecinos', authMiddleware, permitirRoles('administrador'), usuarioCtrl.listarUsuariosNoVecinos);

// ADMINISTRADOR lista usuarios
router.get('/', authMiddleware, permitirRoles('administrador'), usuarioCtrl.listarUsuarios);

module.exports = router;
