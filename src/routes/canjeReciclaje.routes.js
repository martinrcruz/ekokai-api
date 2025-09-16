const express = require('express');
const router = express.Router();
// const mongoose = require('mongoose'); // Removido - usando Sequelize
const CanjeReciclaje = require('../models/canjeReciclaje.model');
const QRReciclaje = require('../models/qrReciclaje.model');
const Usuario = require('../models/usuario.model');
const Cupon = require('../models/cupon.model');
const Trazabilidad = require('../models/trazabilidad.model');
const { authMiddleware: auth } = require('../middleware/auth.middleware');

// POST /api/canjes/reciclaje - Crear un nuevo canje de reciclaje
router.post('/reciclaje', async (req, res) => {
  try {
    const {
      usuarioId,
      qrCode,
      phoneNumber,
      imagenes,
      metadata
    } = req.body;

    // Validar datos requeridos
    if (!usuarioId || !qrCode || !phoneNumber) {
      return res.status(400).json({
        success: false,
        mensaje: 'Faltan datos requeridos: usuarioId, qrCode, phoneNumber'
      });
    }

    // Verificar que el usuario existe
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    // Verificar que el QR existe y está activo
    const qrReciclaje = await QRReciclaje.findOne({ codigo: qrCode });
    if (!qrReciclaje) {
      return res.status(404).json({
        success: false,
        mensaje: 'Código QR no encontrado'
      });
    }

    if (!qrReciclaje.esValido()) {
      return res.status(400).json({
        success: false,
        mensaje: 'El código QR no es válido o ya fue utilizado'
      });
    }

    // Verificar que no existe un canje activo para este QR
    const canjeExistente = await CanjeReciclaje.findOne({
      qrCode: qrCode,
      estado: { $in: ['iniciado', 'primera_imagen_validada'] }
    });

    if (canjeExistente) {
      return res.status(400).json({
        success: false,
        mensaje: 'Ya existe un proceso de canje activo para este código QR'
      });
    }

    // Marcar QR como usado
    await qrReciclaje.marcarComoUsado(usuarioId);

    // Crear canje de reciclaje
    const canjeReciclaje = new CanjeReciclaje({
      usuarioId,
      qrCode,
      qrReciclajeId: qrReciclaje._id,
      phoneNumber,
      estado: 'completado',
      fechaCompletado: new Date(),
      imagenes: {
        primera: {
          ruta: imagenes.primera,
          timestamp: new Date(),
          validacion: {
            exitosa: true,
            confianza: 0.9
          }
        },
        segunda: {
          ruta: imagenes.segunda,
          timestamp: new Date(),
          validacion: {
            exitosa: true,
            confianza: 0.9
          }
        }
      },
      tokensGenerados: qrReciclaje.configuracion.valorTokens || 10,
      metadata: {
        ...metadata,
        startTime: new Date(),
        completedTime: new Date()
      }
    });

    // Generar cupón automáticamente
    const cupon = new Cupon({
      nombre: `Cupón de Reciclaje - ${qrCode}`,
      descripcion: 'Cupón generado por canje de basura reciclada',
      tokensRequeridos: 0, // El cupón ya está "pagado" con la acción de reciclaje
      valor: canjeReciclaje.tokensGenerados,
      fechaExpiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      activo: true,
      tipo: 'reciclaje',
      usuarioGenerado: usuarioId,
      canjeReciclaje: canjeReciclaje._id
    });

    await cupon.save();

    // Asociar cupón al canje
    canjeReciclaje.cuponGenerado = cupon._id;
    await canjeReciclaje.save();

    // Actualizar tokens del usuario
    usuario.tokensAcumulados += canjeReciclaje.tokensGenerados;
    await usuario.save();

    // Registrar trazabilidad
    await Trazabilidad.registrarEvento({
      phoneNumber,
      userId: usuarioId,
      step: 'exchange_completed',
      qr_code: qrCode,
      canjeReciclajeId: canjeReciclaje._id,
      coupon_id: cupon._id,
      exchange_id: canjeReciclaje._id,
      metadata: {
        tokensGenerados: canjeReciclaje.tokensGenerados,
        ...metadata
      }
    });

    res.status(201).json({
      success: true,
      mensaje: 'Canje de reciclaje creado exitosamente',
      canje: {
        id: canjeReciclaje._id,
        estado: canjeReciclaje.estado,
        fechaCompletado: canjeReciclaje.fechaCompletado,
        tokensGenerados: canjeReciclaje.tokensGenerados
      },
      cupon: {
        id: cupon._id,
        codigo: cupon._id.toString(),
        nombre: cupon.nombre,
        valor: cupon.valor,
        fechaExpiracion: cupon.fechaExpiracion,
        descripcion: cupon.descripcion
      },
      usuario: {
        tokensAcumulados: usuario.tokensAcumulados
      }
    });

  } catch (error) {
    console.error('Error creando canje de reciclaje:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error creando canje de reciclaje',
      error: error.message
    });
  }
});

// GET /api/canjes/reciclaje/:id - Obtener información de un canje específico
router.get('/reciclaje/:id', auth, async (req, res) => {
  try {
    const canje = await CanjeReciclaje.findById(req.params.id)
      .populate('usuarioId', 'nombre apellido telefono tokensAcumulados')
      .populate('qrReciclajeId', 'codigo configuracion createdAt')
      .populate('cuponGenerado', 'nombre valor fechaExpiracion descripcion');

    if (!canje) {
      return res.status(404).json({
        success: false,
        mensaje: 'Canje no encontrado'
      });
    }

    res.json({
      success: true,
      canje
    });

  } catch (error) {
    console.error('Error obteniendo canje:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error obteniendo información del canje',
      error: error.message
    });
  }
});

// GET /api/canjes/reciclaje - Listar canjes de reciclaje
router.get('/reciclaje', auth, async (req, res) => {
  try {
    const {
      usuarioId,
      estado,
      phoneNumber,
      fechaInicio,
      fechaFin,
      limite = 50,
      pagina = 1
    } = req.query;

    const filtros = {};
    
    if (usuarioId) filtros.usuarioId = usuarioId;
    if (estado) filtros.estado = estado;
    if (phoneNumber) filtros.phoneNumber = phoneNumber;
    
    if (fechaInicio || fechaFin) {
      filtros.fechaInicio = {};
      if (fechaInicio) filtros.fechaInicio.$gte = new Date(fechaInicio);
      if (fechaFin) filtros.fechaInicio.$lte = new Date(fechaFin);
    }

    const skip = (pagina - 1) * limite;

    const [canjes, total] = await Promise.all([
      CanjeReciclaje.find(filtros)
        .populate('usuarioId', 'nombre apellido telefono')
        .populate('qrReciclajeId', 'codigo configuracion')
        .populate('cuponGenerado', 'nombre valor fechaExpiracion')
        .sort({ fechaInicio: -1 })
        .limit(parseInt(limite))
        .skip(skip),
      CanjeReciclaje.countDocuments(filtros)
    ]);

    res.json({
      success: true,
      data: canjes,
      pagination: {
        total,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(total / limite)
      }
    });

  } catch (error) {
    console.error('Error listando canjes:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error obteniendo canjes',
      error: error.message
    });
  }
});

// GET /api/canjes/reciclaje/usuario/:userId - Obtener canjes de un usuario específico
router.get('/reciclaje/usuario/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limite = 20 } = req.query;

    const canjes = await CanjeReciclaje.find({ usuarioId: userId })
      .populate('qrReciclajeId', 'codigo configuracion')
      .populate('cuponGenerado', 'nombre valor fechaExpiracion descripcion')
      .sort({ fechaInicio: -1 })
      .limit(parseInt(limite));

    const estadisticas = await CanjeReciclaje.aggregate([
      { $match: { usuarioId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalCanjes: { $sum: 1 },
          tokensGenerados: { $sum: '$tokensGenerados' },
          canjesCompletados: {
            $sum: { $cond: [{ $eq: ['$estado', 'completado'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        canjes,
        estadisticas: estadisticas[0] || {
          totalCanjes: 0,
          tokensGenerados: 0,
          canjesCompletados: 0
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo canjes de usuario:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error obteniendo canjes del usuario',
      error: error.message
    });
  }
});

// GET /api/canjes/reciclaje/phone/:phoneNumber - Obtener canjes por número de teléfono
router.get('/reciclaje/phone/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const { limite = 20 } = req.query;

    const canjes = await CanjeReciclaje.find({ phoneNumber })
      .populate('usuarioId', 'nombre apellido')
      .populate('qrReciclajeId', 'codigo configuracion')
      .populate('cuponGenerado', 'nombre valor fechaExpiracion descripcion')
      .sort({ fechaInicio: -1 })
      .limit(parseInt(limite));

    res.json({
      success: true,
      data: canjes
    });

  } catch (error) {
    console.error('Error obteniendo canjes por teléfono:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error obteniendo canjes por número de teléfono',
      error: error.message
    });
  }
});

// GET /api/canjes/reciclaje/estadisticas - Estadísticas generales de canjes
router.get('/reciclaje/estadisticas', auth, async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    const filtros = {};
    if (fechaInicio || fechaFin) {
      filtros.fechaInicio = {};
      if (fechaInicio) filtros.fechaInicio.$gte = new Date(fechaInicio);
      if (fechaFin) filtros.fechaInicio.$lte = new Date(fechaFin);
    }

    const estadisticas = await CanjeReciclaje.obtenerEstadisticas(filtros);

    const resumen = await CanjeReciclaje.aggregate([
      { $match: filtros },
      {
        $group: {
          _id: null,
          totalCanjes: { $sum: 1 },
          tokensGenerados: { $sum: '$tokensGenerados' },
          canjesCompletados: {
            $sum: { $cond: [{ $eq: ['$estado', 'completado'] }, 1, 0] }
          },
          canjesFallidos: {
            $sum: { $cond: [{ $eq: ['$estado', 'fallido'] }, 1, 0] }
          },
          promedioTokens: { $avg: '$tokensGenerados' }
        }
      }
    ]);

    const estadisticasPorDia = await CanjeReciclaje.aggregate([
      { $match: filtros },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$fechaInicio'
            }
          },
          canjes: { $sum: 1 },
          tokens: { $sum: '$tokensGenerados' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    res.json({
      success: true,
      estadisticas: {
        resumen: resumen[0] || {
          totalCanjes: 0,
          tokensGenerados: 0,
          canjesCompletados: 0,
          canjesFallidos: 0,
          promedioTokens: 0
        },
        porEstado: estadisticas,
        porDia: estadisticasPorDia
      }
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

// PUT /api/canjes/reciclaje/:id/estado - Actualizar estado de un canje
router.put('/reciclaje/:id/estado', auth, async (req, res) => {
  try {
    const { estado, observaciones } = req.body;
    
    if (!['iniciado', 'primera_imagen_validada', 'completado', 'fallido'].includes(estado)) {
      return res.status(400).json({
        success: false,
        mensaje: 'Estado no válido'
      });
    }

    const canje = await CanjeReciclaje.findById(req.params.id);
    if (!canje) {
      return res.status(404).json({
        success: false,
        mensaje: 'Canje no encontrado'
      });
    }

    canje.estado = estado;
    if (observaciones) canje.observaciones = observaciones;
    
    if (estado === 'completado' && !canje.fechaCompletado) {
      canje.fechaCompletado = new Date();
    }

    await canje.save();

    res.json({
      success: true,
      mensaje: 'Estado del canje actualizado exitosamente',
      canje
    });

  } catch (error) {
    console.error('Error actualizando estado del canje:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error actualizando estado del canje',
      error: error.message
    });
  }
});

module.exports = router;
