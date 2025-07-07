const express = require('express');
const router = express.Router();
const estadisticasCtrl = require('../controllers/estadisticas.controller');
const { authMiddleware, permitirRoles } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Solo administrador puede ver estadísticas
router.get('/total-kilos', permitirRoles('administrador'), estadisticasCtrl.totalKilos);
router.get('/sucursal-top', permitirRoles('administrador'), estadisticasCtrl.sucursalTop);
router.get('/kilos-por-mes', permitirRoles('administrador'), estadisticasCtrl.kilosPorMes);
router.get('/meta-mensual', permitirRoles('administrador'), estadisticasCtrl.progresoMetaMensual);

module.exports = router;
