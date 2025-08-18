const express = require('express');
const router = express.Router();
const tipoCtrl = require('../controllers/tiporesiduo.controller');
const { authMiddleware, permitirRoles } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Solo administrador puede crear y eliminar tipos
router.post('/', permitirRoles('administrador','encargado'), tipoCtrl.crear);
router.get('/', permitirRoles('administrador', 'encargado', 'vecino'), tipoCtrl.listar);
router.delete('/:id', permitirRoles('administrador'), tipoCtrl.eliminar);
router.put('/:id', permitirRoles('administrador','encargado'), tipoCtrl.actualizar);

module.exports = router;
