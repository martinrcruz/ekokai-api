const express = require('express');
const router = express.Router();
const estadisticasCtrl = require('../controllers/estadisticas.controller');
const { authMiddleware, permitirRoles } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Ruta de prueba con autenticación
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Rutas de estadísticas funcionando correctamente',
    usuario: req.usuario ? req.usuario.email : 'No autenticado'
  });
});

// Solo administrador puede ver estadísticas generales
router.get('/total-kilos', permitirRoles('administrador'), estadisticasCtrl.totalKilos);
router.get('/sucursal-top', permitirRoles('administrador'), estadisticasCtrl.sucursalTop);
router.get('/kilos-por-mes', permitirRoles('administrador'), estadisticasCtrl.kilosPorMes);
router.get('/meta-mensual', permitirRoles('administrador'), estadisticasCtrl.progresoMetaMensual);

// Rutas para estadísticas del usuario logueado (cualquier rol autenticado)
router.get('/usuario-hoy', estadisticasCtrl.estadisticasUsuarioHoy);
router.get('/usuario-hoy/kilos', estadisticasCtrl.kilosUsuarioHoy);
router.get('/usuario-hoy/meta', estadisticasCtrl.metaDiariaUsuario);

module.exports = router;
