const express = require('express');
const router = express.Router();
const ecopuntoCtrl = require('../controllers/ecopunto.controller');
const { authMiddleware, permitirRoles } = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Solo ADMINISTRADOR puede crear ecopunto y asignar encargado
router.post('/', permitirRoles('administrador'), ecopuntoCtrl.crearEcopunto);
router.patch('/:id/enrolar', permitirRoles('administrador'), ecopuntoCtrl.enrolarEncargado);

// routes/ecopuntos.routes.js
router.get('/', permitirRoles('administrador'), ecopuntoCtrl.listarEcopuntos);

module.exports = router;
