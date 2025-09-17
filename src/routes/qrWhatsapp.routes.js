const express = require('express');
const router = express.Router();
const qrWhatsappController = require('../controllers/qrWhatsapp.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

/**
 * @route POST /api/qr-whatsapp
 * @desc Crear un nuevo código QR de WhatsApp
 * @access Private (requiere autenticación)
 */
router.post('/', qrWhatsappController.crearQR);

/**
 * @route GET /api/qr-whatsapp
 * @desc Obtener todos los códigos QR
 * @access Private (requiere autenticación)
 * @query soloActivos - Solo mostrar QRs activos (true/false)
 * @query limit - Límite de resultados (default: 50)
 * @query offset - Offset para paginación (default: 0)
 */
router.get('/', qrWhatsappController.obtenerQRs);

/**
 * @route GET /api/qr-whatsapp/estadisticas
 * @desc Obtener estadísticas de códigos QR
 * @access Private (requiere autenticación)
 */
router.get('/estadisticas', qrWhatsappController.obtenerEstadisticas);

/**
 * @route GET /api/qr-whatsapp/:id
 * @desc Obtener un código QR por ID
 * @access Private (requiere autenticación)
 */
router.get('/:id', qrWhatsappController.obtenerQRPorId);

/**
 * @route PUT /api/qr-whatsapp/:id
 * @desc Actualizar un código QR
 * @access Private (requiere autenticación)
 */
router.put('/:id', qrWhatsappController.actualizarQR);

/**
 * @route DELETE /api/qr-whatsapp/:id
 * @desc Desactivar un código QR
 * @access Private (requiere autenticación)
 */
router.delete('/:id', qrWhatsappController.desactivarQR);

/**
 * @route POST /api/qr-whatsapp/limpiar-expirados
 * @desc Limpiar códigos QR expirados
 * @access Private (requiere autenticación)
 */
router.post('/limpiar-expirados', qrWhatsappController.limpiarQRsExpirados);

module.exports = router;
