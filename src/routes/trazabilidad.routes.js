const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Trazabilidad = require('../models/trazabilidad.model');
const Usuario = require('../models/usuario.model');
const CanjeReciclaje = require('../models/canjeReciclaje.model');
const { authMiddleware: auth } = require('../middleware/auth.middleware');

// POST /api/trazabilidad/registro - Registrar evento de trazabilidad
router.post('/registro', async (req, res) => {
  try {
    const {
      phoneNumber,
      userId,
      step,
      qr_code,
      canjeReciclajeId,
      coupon_id,
      exchange_id,
      image_path,
      validation_result,
      ubicacion,
      metadata,
      error_info
    } = req.body;

    // Validar datos requeridos
    if (!phoneNumber || !userId || !step) {
      return res.status(400).json({
        success: false,
        mensaje: 'phoneNumber, userId y step son requeridos'
      });
    }

    // Verificar que el usuario existe
    const usuario = await Usuario.findById(userId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    // Crear registro de trazabilidad
    const trazabilidad = await Trazabilidad.registrarEvento({
      phoneNumber,
      userId,
      step,
      timestamp: new Date(),
      qr_code,
      canjeReciclajeId,
      coupon_id,
      exchange_id,
      image_path,
      validation_result,
      ubicacion,
      metadata: {
        ...metadata,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        registeredAt: new Date()
      },
      error_info
    });

    res.status(201).json({
      success: true,
      mensaje: 'Evento de trazabilidad registrado exitosamente',
      id: trazabilidad._id,
      timestamp: trazabilidad.timestamp
    });

  } catch (error) {
    console.error('Error registrando trazabilidad:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error registrando evento de trazabilidad',
      error: error.message
    });
  }
});

// GET /api/trazabilidad/usuario/:userId - Obtener trazabilidad de un usuario
router.get('/usuario/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limite = 50, step } = req.query;

    // Verificar que el usuario existe
    const usuario = await Usuario.findById(userId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    const filtros = { userId };
    if (step) filtros.step = step;

    const trazabilidad = await Trazabilidad.find(filtros)
      .populate('coupon_id', 'nombre valor fechaExpiracion')
      .populate('exchange_id', 'estado tokensGenerados')
      .sort({ timestamp: -1 })
      .limit(parseInt(limite));

    // Estadísticas del usuario
    const estadisticas = await Trazabilidad.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$step',
          count: { $sum: 1 },
          ultimoEvento: { $max: '$timestamp' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          telefono: usuario.telefono
        },
        eventos: trazabilidad,
        estadisticas
      }
    });

  } catch (error) {
    console.error('Error obteniendo trazabilidad de usuario:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error obteniendo trazabilidad del usuario',
      error: error.message
    });
  }
});

// GET /api/trazabilidad/phone/:phoneNumber - Obtener trazabilidad por teléfono
router.get('/phone/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const { limite = 50, step } = req.query;

    const filtros = { phoneNumber };
    if (step) filtros.step = step;

    const trazabilidad = await Trazabilidad.find(filtros)
      .populate('userId', 'nombre apellido email')
      .populate('coupon_id', 'nombre valor fechaExpiracion')
      .populate('exchange_id', 'estado tokensGenerados')
      .sort({ timestamp: -1 })
      .limit(parseInt(limite));

    res.json({
      success: true,
      data: {
        phoneNumber,
        eventos: trazabilidad,
        totalEventos: trazabilidad.length
      }
    });

  } catch (error) {
    console.error('Error obteniendo trazabilidad por teléfono:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error obteniendo trazabilidad por número de teléfono',
      error: error.message
    });
  }
});

// GET /api/trazabilidad/qr/:qrCode - Obtener trazabilidad de un código QR
router.get('/qr/:qrCode', auth, async (req, res) => {
  try {
    const { qrCode } = req.params;

    const trazabilidad = await Trazabilidad.obtenerPorQR(qrCode);

    if (trazabilidad.length === 0) {
      return res.status(404).json({
        success: false,
        mensaje: 'No se encontró trazabilidad para este código QR'
      });
    }

    // Estadísticas del QR
    const estadisticas = await Trazabilidad.aggregate([
      { $match: { qr_code: qrCode } },
      {
        $group: {
          _id: '$step',
          count: { $sum: 1 },
          primerEvento: { $min: '$timestamp' },
          ultimoEvento: { $max: '$timestamp' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        qrCode,
        eventos: trazabilidad,
        estadisticas,
        totalEventos: trazabilidad.length
      }
    });

  } catch (error) {
    console.error('Error obteniendo trazabilidad de QR:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error obteniendo trazabilidad del código QR',
      error: error.message
    });
  }
});

// GET /api/trazabilidad/canje/:canjeId - Obtener trazabilidad de un canje específico
router.get('/canje/:canjeId', auth, async (req, res) => {
  try {
    const { canjeId } = req.params;

    // Verificar que el canje existe
    const canje = await CanjeReciclaje.findById(canjeId);
    if (!canje) {
      return res.status(404).json({
        success: false,
        mensaje: 'Canje no encontrado'
      });
    }

    const trazabilidad = await Trazabilidad.find({ canjeReciclajeId: canjeId })
      .populate('userId', 'nombre apellido telefono')
      .populate('coupon_id', 'nombre valor')
      .sort({ timestamp: 1 }); // Orden cronológico

    res.json({
      success: true,
      data: {
        canje: {
          id: canje._id,
          estado: canje.estado,
          qrCode: canje.qrCode,
          phoneNumber: canje.phoneNumber,
          fechaInicio: canje.fechaInicio,
          fechaCompletado: canje.fechaCompletado
        },
        eventos: trazabilidad,
        totalEventos: trazabilidad.length
      }
    });

  } catch (error) {
    console.error('Error obteniendo trazabilidad de canje:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error obteniendo trazabilidad del canje',
      error: error.message
    });
  }
});

// GET /api/trazabilidad/estadisticas - Estadísticas generales de trazabilidad
router.get('/estadisticas', auth, async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const fechaFinDate = fechaFin ? new Date(fechaFin) : new Date();

    const estadisticas = await Trazabilidad.obtenerEstadisticas(fechaInicioDate, fechaFinDate);

    // Estadísticas adicionales
    const resumen = await Trazabilidad.aggregate([
      {
        $match: {
          timestamp: {
            $gte: fechaInicioDate,
            $lte: fechaFinDate
          }
        }
      },
      {
        $group: {
          _id: null,
          totalEventos: { $sum: 1 },
          usuariosUnicos: { $addToSet: '$userId' },
          qrsUnicos: { $addToSet: '$qr_code' },
          telefonosUnicos: { $addToSet: '$phoneNumber' }
        }
      },
      {
        $project: {
          totalEventos: 1,
          usuariosUnicos: { $size: '$usuariosUnicos' },
          qrsUnicos: { $size: '$qrsUnicos' },
          telefonosUnicos: { $size: '$telefonosUnicos' }
        }
      }
    ]);

    // Eventos por día
    const eventosPorDia = await Trazabilidad.aggregate([
      {
        $match: {
          timestamp: {
            $gte: fechaInicioDate,
            $lte: fechaFinDate
          }
        }
      },
      {
        $group: {
          _id: {
            fecha: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timestamp'
              }
            },
            step: '$step'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.fecha',
          eventos: {
            $push: {
              step: '$_id.step',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    res.json({
      success: true,
      estadisticas: {
        resumen: resumen[0] || {
          totalEventos: 0,
          usuariosUnicos: 0,
          qrsUnicos: 0,
          telefonosUnicos: 0
        },
        porStep: estadisticas,
        porDia: eventosPorDia,
        periodo: {
          fechaInicio: fechaInicioDate,
          fechaFin: fechaFinDate
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de trazabilidad:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error obteniendo estadísticas de trazabilidad',
      error: error.message
    });
  }
});

// GET /api/trazabilidad/eventos - Listar todos los eventos con filtros
router.get('/eventos', auth, async (req, res) => {
  try {
    const {
      step,
      phoneNumber,
      userId,
      qr_code,
      fechaInicio,
      fechaFin,
      limite = 100,
      pagina = 1
    } = req.query;

    const filtros = {};
    
    if (step) filtros.step = step;
    if (phoneNumber) filtros.phoneNumber = phoneNumber;
    if (userId) filtros.userId = userId;
    if (qr_code) filtros.qr_code = qr_code;
    
    if (fechaInicio || fechaFin) {
      filtros.timestamp = {};
      if (fechaInicio) filtros.timestamp.$gte = new Date(fechaInicio);
      if (fechaFin) filtros.timestamp.$lte = new Date(fechaFin);
    }

    const skip = (pagina - 1) * limite;

    const [eventos, total] = await Promise.all([
      Trazabilidad.find(filtros)
        .populate('userId', 'nombre apellido telefono')
        .populate('coupon_id', 'nombre valor')
        .populate('exchange_id', 'estado tokensGenerados')
        .sort({ timestamp: -1 })
        .limit(parseInt(limite))
        .skip(skip),
      Trazabilidad.countDocuments(filtros)
    ]);

    res.json({
      success: true,
      data: eventos,
      pagination: {
        total,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(total / limite)
      }
    });

  } catch (error) {
    console.error('Error listando eventos de trazabilidad:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error obteniendo eventos de trazabilidad',
      error: error.message
    });
  }
});

// DELETE /api/trazabilidad/limpiar - Limpiar eventos antiguos (solo admin)
router.delete('/limpiar', auth, async (req, res) => {
  try {
    const { diasAntiguedad = 90 } = req.body;
    
    // Verificar que el usuario es administrador
    if (req.usuario.rol !== 'administrador') {
      return res.status(403).json({
        success: false,
        mensaje: 'Solo los administradores pueden limpiar la trazabilidad'
      });
    }

    const fechaLimite = new Date(Date.now() - diasAntiguedad * 24 * 60 * 60 * 1000);
    
    const resultado = await Trazabilidad.deleteMany({
      timestamp: { $lt: fechaLimite },
      step: { $ne: 'exchange_completed' } // Mantener eventos de canjes completados
    });

    res.json({
      success: true,
      mensaje: `Trazabilidad limpiada exitosamente`,
      eventosEliminados: resultado.deletedCount,
      fechaLimite
    });

  } catch (error) {
    console.error('Error limpiando trazabilidad:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error limpiando trazabilidad',
      error: error.message
    });
  }
});

module.exports = router;
