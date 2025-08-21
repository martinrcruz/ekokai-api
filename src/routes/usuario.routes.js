const express = require('express');
const router = express.Router();
const usuarioCtrl = require('../controllers/usuario.controller');
const { authMiddleware, permitirRoles } = require('../middleware/auth.middleware');

// Aplica JWT a todas las rutas
router.use(authMiddleware);

// ========================================
// RUTAS ESPECÍFICAS (DEBEN IR PRIMERO)
// ========================================

// ✅ RUTA DE PRUEBA TEMPORAL
router.get('/test-estado', (req, res) => {
  console.log('🧪 [TEST] Ruta de prueba /test-estado accedida');
  res.json({ message: 'Ruta de prueba funcionando', timestamp: new Date().toISOString() });
});

// ✅ RUTA DE PRUEBA PATCH TEMPORAL
router.patch('/test-estado', (req, res) => {
  console.log('🧪 [TEST] Ruta de prueba PATCH /test-estado accedida');
  console.log('🧪 [TEST] Body recibido:', req.body);
  res.json({ 
    message: 'Ruta de prueba PATCH funcionando', 
    body: req.body,
    timestamp: new Date().toISOString() 
  });
});

// ✅ BUSCAR VECINOS - DEBE IR ANTES DE CUALQUIER RUTA CON PARÁMETROS
router.get('/buscar-vecinos', permitirRoles('administrador', 'encargado'), usuarioCtrl.buscarVecinos);

// ✅ REGISTRAR VECINO - DEBE IR ANTES DE CUALQUIER RUTA CON PARÁMETROS
router.post('/registrar', permitirRoles('administrador','encargado'), usuarioCtrl.registrarVecino);

// ✅ REGISTRAR ENCARGADO - DEBE IR ANTES DE CUALQUIER RUTA CON PARÁMETROS
router.post('/registrar-encargado', permitirRoles('administrador'), usuarioCtrl.registrarConRol);

// ========================================
// RUTAS CON PARÁMETROS (DEBEN IR DESPUÉS)
// ========================================

// ADMINISTRADOR lista usuarios
router.get('/', permitirRoles('administrador'), usuarioCtrl.listarUsuarios);

// Historial de usuario específico
router.get('/:usuarioId/historial', permitirRoles('administrador', 'encargado'), usuarioCtrl.historialInteracciones);

// Cambiar estado de usuario (solo admin)
router.patch('/:id/estado', permitirRoles('administrador'), usuarioCtrl.cambiarEstadoUsuario);

// Obtener usuario por ID
router.get('/:id', permitirRoles('administrador', 'encargado', 'vecino'), usuarioCtrl.obtenerUsuario);

// Actualizar usuario (solo admin)
router.put('/:id', permitirRoles('administrador'), usuarioCtrl.actualizarUsuario);

// Eliminar usuario (solo admin)
router.delete('/:id', permitirRoles('administrador'), usuarioCtrl.eliminarUsuario);

module.exports = router;
