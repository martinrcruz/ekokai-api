const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const QRReciclaje = require('../models/qrReciclaje.model');
const CanjeReciclaje = require('../models/canjeReciclaje.model');
const Usuario = require('../models/usuario.model');
const { authMiddleware: auth } = require('../middleware/auth.middleware');

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

// POST /api/qr/generar-reciclaje - Generar códigos QR para reciclaje
router.post('/generar-reciclaje', auth, async (req, res) => {
  try {
    const { tipo = 'reciclaje', configuracion = {} } = req.body;
    const usuarioCreador = req.usuario._id;

    // Generar código único
    const codigo = QRReciclaje.generarCodigo();

    // Crear registro en base de datos
    const qrReciclaje = new QRReciclaje({
      codigo,
      tipo,
      usuarioCreador,
      configuracion: {
        tamano: configuracion.tamano || '20x20cm',
        descripcion: configuracion.descripcion || 'Código QR para canje de basura por cupones',
        instrucciones: configuracion.instrucciones || 'Pega este QR en una bolsa de basura y sigue las instrucciones en WhatsApp',
        valorTokens: configuracion.valorTokens || 10
      },
      metadatos: {
        ubicacionCreacion: req.ip,
        dispositivoCreacion: req.get('User-Agent'),
        versionApp: req.get('App-Version') || '1.0.0'
      }
    });

    await qrReciclaje.save();

    // Generar imagen QR
    const qrImageBuffer = await QRCode.toBuffer(codigo, {
      width: 512,
      height: 512,
      margin: 2,
      color: {
        dark: '#2c3e50',
        light: '#ffffff'
      }
    });

    // Convertir a base64 para respuesta
    const qrImageBase64 = qrImageBuffer.toString('base64');

    res.status(201).json({
      success: true,
      qr: {
        id: qrReciclaje._id,
        codigo: codigo,
        imagen: `data:image/png;base64,${qrImageBase64}`,
        estado: qrReciclaje.estado,
        createdAt: qrReciclaje.createdAt,
        fechaExpiracion: qrReciclaje.fechaExpiracion,
        configuracion: qrReciclaje.configuracion
      },
      mensaje: 'Código QR generado exitosamente'
    });

  } catch (error) {
    console.error('Error generando QR de reciclaje:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error generando código QR',
      error: error.message
    });
  }
});

// POST /api/qr/validar-reciclaje - Validar código QR de reciclaje
router.post('/validar-reciclaje', async (req, res) => {
  try {
    const { qrCode, phoneNumber } = req.body;

    if (!qrCode || !phoneNumber) {
      return res.status(400).json({
        success: false,
        valido: false,
        mensaje: 'Código QR y número de teléfono son requeridos'
      });
    }

    // Buscar QR en la base de datos
    const qrReciclaje = await QRReciclaje.findOne({ codigo: qrCode });

    if (!qrReciclaje) {
      return res.status(404).json({
        success: false,
        valido: false,
        mensaje: 'Código QR no encontrado en el sistema'
      });
    }

    // Verificar si el QR es válido
    if (!qrReciclaje.esValido()) {
      let razon = 'Código QR no válido';
      
      if (qrReciclaje.estado === 'usado') {
        razon = 'Este código QR ya fue utilizado';
      } else if (qrReciclaje.estado === 'expirado') {
        razon = 'Este código QR ha expirado';
      } else if (qrReciclaje.fechaExpiracion <= new Date()) {
        razon = 'Este código QR ha expirado';
      } else if (!qrReciclaje.activo) {
        razon = 'Este código QR ha sido desactivado';
      }

      return res.status(400).json({
        success: false,
        valido: false,
        mensaje: razon,
        qr: {
          codigo: qrReciclaje.codigo,
          estado: qrReciclaje.estado,
          fechaExpiracion: qrReciclaje.fechaExpiracion,
          fechaUso: qrReciclaje.fechaUso
        }
      });
    }

    // Buscar usuario por teléfono
    const usuario = await Usuario.findOne({ telefono: phoneNumber });
    if (!usuario) {
      return res.status(404).json({
        success: false,
        valido: false,
        mensaje: 'Usuario no encontrado con ese número de teléfono'
      });
    }

    // Verificar si ya existe un canje activo para este QR
    const canjeExistente = await CanjeReciclaje.findOne({
      qrCode: qrCode,
      estado: { $in: ['iniciado', 'primera_imagen_validada'] }
    });

    if (canjeExistente) {
      return res.status(400).json({
        success: false,
        valido: false,
        mensaje: 'Ya existe un proceso de canje activo para este código QR'
      });
    }

    // QR válido
    res.json({
      success: true,
      valido: true,
      mensaje: 'Código QR válido para reciclaje',
      qr: {
        id: qrReciclaje._id,
        codigo: qrReciclaje.codigo,
        configuracion: qrReciclaje.configuracion,
        createdAt: qrReciclaje.createdAt,
        fechaExpiracion: qrReciclaje.fechaExpiracion
      },
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        tokensAcumulados: usuario.tokensAcumulados
      }
    });

  } catch (error) {
    console.error('Error validando QR de reciclaje:', error);
    res.status(500).json({
      success: false,
      valido: false,
      mensaje: 'Error validando código QR',
      error: error.message
    });
  }
});

// GET /api/qr/reciclaje/:id - Obtener información de un QR de reciclaje
router.get('/reciclaje/:id', auth, async (req, res) => {
  try {
    const qrReciclaje = await QRReciclaje.findById(req.params.id)
      .populate('usuarioCreador', 'nombre apellido email')
      .populate('usuarioUso', 'nombre apellido telefono');

    if (!qrReciclaje) {
      return res.status(404).json({
        success: false,
        mensaje: 'Código QR no encontrado'
      });
    }

    res.json({
      success: true,
      qr: qrReciclaje
    });

  } catch (error) {
    console.error('Error obteniendo QR de reciclaje:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error obteniendo información del QR',
      error: error.message
    });
  }
});

// GET /api/qr/reciclaje - Listar códigos QR de reciclaje
router.get('/reciclaje', auth, async (req, res) => {
  try {
    const { 
      estado, 
      limite = 50, 
      pagina = 1, 
      usuarioCreador,
      fechaInicio,
      fechaFin 
    } = req.query;

    const filtros = {};
    
    if (estado) filtros.estado = estado;
    if (usuarioCreador) filtros.usuarioCreador = usuarioCreador;
    
    if (fechaInicio || fechaFin) {
      filtros.createdAt = {};
      if (fechaInicio) filtros.createdAt.$gte = new Date(fechaInicio);
      if (fechaFin) filtros.createdAt.$lte = new Date(fechaFin);
    }

    const skip = (pagina - 1) * limite;

    const [qrs, total] = await Promise.all([
      QRReciclaje.find(filtros)
        .populate('usuarioCreador', 'nombre apellido email')
        .populate('usuarioUso', 'nombre apellido telefono')
        .sort({ createdAt: -1 })
        .limit(parseInt(limite))
        .skip(skip),
      QRReciclaje.countDocuments(filtros)
    ]);

    res.json({
      success: true,
      data: qrs,
      pagination: {
        total,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(total / limite)
      }
    });

  } catch (error) {
    console.error('Error listando QRs de reciclaje:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error obteniendo códigos QR',
      error: error.message
    });
  }
});

// PUT /api/qr/reciclaje/:id/desactivar - Desactivar código QR
router.put('/reciclaje/:id/desactivar', auth, async (req, res) => {
  try {
    const qrReciclaje = await QRReciclaje.findById(req.params.id);

    if (!qrReciclaje) {
      return res.status(404).json({
        success: false,
        mensaje: 'Código QR no encontrado'
      });
    }

    qrReciclaje.estado = 'cancelado';
    qrReciclaje.activo = false;
    await qrReciclaje.save();

    res.json({
      success: true,
      mensaje: 'Código QR desactivado exitosamente',
      qr: qrReciclaje
    });

  } catch (error) {
    console.error('Error desactivando QR:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error desactivando código QR',
      error: error.message
    });
  }
});

// GET /api/qr/estadisticas - Estadísticas de códigos QR
router.get('/estadisticas', auth, async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    const filtros = {};
    if (fechaInicio || fechaFin) {
      filtros.createdAt = {};
      if (fechaInicio) filtros.createdAt.$gte = new Date(fechaInicio);
      if (fechaFin) filtros.createdAt.$lte = new Date(fechaFin);
    }

    const [estadisticasEstado, estadisticasUso] = await Promise.all([
      QRReciclaje.aggregate([
        { $match: filtros },
        {
          $group: {
            _id: '$estado',
            count: { $sum: 1 }
          }
        }
      ]),
      QRReciclaje.aggregate([
        { $match: filtros },
        {
          $group: {
            _id: null,
            totalGenerados: { $sum: 1 },
            totalUsados: {
              $sum: {
                $cond: [{ $eq: ['$estado', 'usado'] }, 1, 0]
              }
            },
            totalActivos: {
              $sum: {
                $cond: [{ $eq: ['$estado', 'activo'] }, 1, 0]
              }
            },
            totalExpirados: {
              $sum: {
                $cond: [{ $eq: ['$estado', 'expirado'] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    const estadisticas = estadisticasUso[0] || {
      totalGenerados: 0,
      totalUsados: 0,
      totalActivos: 0,
      totalExpirados: 0
    };

    estadisticas.porEstado = estadisticasEstado;
    estadisticas.tasaUso = estadisticas.totalGenerados > 0 
      ? (estadisticas.totalUsados / estadisticas.totalGenerados * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      estadisticas
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
});

module.exports = router; 