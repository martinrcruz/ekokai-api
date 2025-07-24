const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');

// GET /api/qr/info - Obtener información del QR permanente
router.get('/info', (req, res) => {
  try {
    const baseURL = `${req.protocol}://${req.get('host')}`;
    const registroURL = `${baseURL}/registro`;
    
    res.json({
      success: true,
      data: {
        qrUrl: registroURL,
        formUrl: registroURL,
        qrPageUrl: `${baseURL}/qr-permanente`,
        description: 'QR permanente para registro de usuarios en EKOKAI',
        instructions: [
          'Imprime este QR o muéstralo en una pantalla',
          'Los usuarios escanean el QR con su teléfono',
          'Se abre automáticamente el formulario de registro',
          'Completan sus datos y se registran en EKOKAI',
          'Reciben confirmación por WhatsApp'
        ],
        createdAt: new Date().toISOString(),
        isPermanent: true
      }
    });
  } catch (error) {
    console.error('Error al obtener información del QR:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/qr/generate - Generar QR como imagen PNG
router.get('/generate', async (req, res) => {
  try {
    const baseURL = `${req.protocol}://${req.get('host')}`;
    const registroURL = `${baseURL}/registro`;
    
    // Generar QR como buffer PNG
    const qrBuffer = await QRCode.toBuffer(registroURL, {
      width: 512,
      height: 512,
      margin: 2,
      color: {
        dark: '#2c3e50',
        light: '#ffffff'
      }
    });
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="ekokai-qr-registro.png"');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache por 1 año
    
    res.send(qrBuffer);
  } catch (error) {
    console.error('Error al generar QR:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el QR',
      error: error.message
    });
  }
});

// GET /api/qr/data-url - Obtener QR como data URL (para frontend)
router.get('/data-url', async (req, res) => {
  try {
    const baseURL = `${req.protocol}://${req.get('host')}`;
    const registroURL = `${baseURL}/registro`;
    
    // Generar QR como data URL
    const dataURL = await QRCode.toDataURL(registroURL, {
      width: 256,
      height: 256,
      margin: 2,
      color: {
        dark: '#2c3e50',
        light: '#ffffff'
      }
    });
    
    res.json({
      success: true,
      data: {
        qrDataURL: dataURL,
        qrUrl: registroURL,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error al generar QR data URL:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el QR',
      error: error.message
    });
  }
});

// GET /api/qr/validate - Validar que el QR funciona correctamente
router.get('/validate', async (req, res) => {
  try {
    const baseURL = `${req.protocol}://${req.get('host')}`;
    const registroURL = `${baseURL}/registro`;
    
    // Verificar que la URL del formulario es accesible
    const testResponse = await fetch(registroURL);
    const isFormAccessible = testResponse.ok;
    
    res.json({
      success: true,
      data: {
        qrUrl: registroURL,
        isFormAccessible,
        formStatus: isFormAccessible ? 'OK' : 'ERROR',
        timestamp: new Date().toISOString(),
        serverInfo: {
          host: req.get('host'),
          protocol: req.protocol,
          userAgent: req.get('User-Agent')
        }
      }
    });
  } catch (error) {
    console.error('Error al validar QR:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar el QR',
      error: error.message
    });
  }
});

module.exports = router; 