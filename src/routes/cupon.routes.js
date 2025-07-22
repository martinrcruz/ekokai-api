const express = require('express');
const router = express.Router();
const cuponCtrl = require('../controllers/cupon.controller');
const { authMiddleware, permitirRoles } = require('../middleware/auth.middleware');

router.use(authMiddleware);
router.use(permitirRoles('administrador'));

router.get('/', cuponCtrl.listarCupones);
router.post('/', cuponCtrl.crearCupon);
router.put('/:id', cuponCtrl.actualizarCupon);
router.delete('/:id', cuponCtrl.eliminarCupon);

module.exports = router; 