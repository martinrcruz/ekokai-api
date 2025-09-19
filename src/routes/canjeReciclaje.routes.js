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
    console.log('🔍 [canje-reciclaje] Datos recibidos:', {
      usuarioId: req.body.usuarioId,
      qrCode: req.body.qrCode,
      phoneNumber: req.body.phoneNumber,
      imagenes: req.body.imagenes,
      metadata: req.body.metadata
    });

    const {
      usuarioId,
      qrCode,
      phoneNumber,
      imagenes,
      metadata
    } = req.body;

    // Validar datos requeridos
    if (!usuarioId || !qrCode || !phoneNumber) {
      console.log('❌ [canje-reciclaje] Faltan datos requeridos:', { usuarioId, qrCode, phoneNumber });
      return res.status(400).json({
        success: false,
        mensaje: 'Faltan datos requeridos: usuarioId, qrCode, phoneNumber'
      });
    }

    // Verificar que el usuario existe
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    // Verificar que el QR existe y está activo
    console.log('🔍 [canje-reciclaje] Buscando QR:', qrCode);
    let qrReciclaje = await QRReciclaje.findOne({ where: { codigo: qrCode } });
    
    // Si es un QR temporal y no existe, crearlo
    if (!qrReciclaje && qrCode.startsWith('TEMP-')) {
      console.log('🔧 [canje-reciclaje] Creando QR temporal:', qrCode);
      qrReciclaje = await QRReciclaje.create({
        codigo: qrCode,
        tipo: 'reciclaje',
        estado: 'activo',
        activo: true,
        fechaExpiracion: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        configuracion: {
          valorTokens: 10,
          tipo: 'temporal'
        },
        metadatos: {
          esTemporal: true,
          creadoPara: usuarioId,
          telefono: phoneNumber
        }
      });
    }
    
    if (!qrReciclaje) {
      console.log('❌ [canje-reciclaje] QR no encontrado:', qrCode);
      return res.status(404).json({
        success: false,
        mensaje: 'Código QR no encontrado'
      });
    }

    console.log('🔍 [canje-reciclaje] QR encontrado:', {
      id: qrReciclaje.id,
      codigo: qrReciclaje.codigo,
      estado: qrReciclaje.estado,
      activo: qrReciclaje.activo,
      fechaExpiracion: qrReciclaje.fechaExpiracion,
      esTemporal: qrReciclaje.metadatos?.esTemporal || false
    });

    if (!qrReciclaje.esValido()) {
      console.log('❌ [canje-reciclaje] QR no es válido');
      return res.status(400).json({
        success: false,
        mensaje: 'El código QR no es válido o ya fue utilizado'
      });
    }

    // Verificar que no existe un canje activo para este QR
    const canjeExistente = await CanjeReciclaje.findOne({
      where: {
        qrCode: qrCode,
        estado: ['iniciado', 'primera_imagen_validada']
      }
    });

    if (canjeExistente) {
      return res.status(400).json({
        success: false,
        mensaje: 'Ya existe un proceso de canje activo para este código QR'
      });
    }

    // Marcar QR como usado
    await qrReciclaje.marcarComoUsado(usuarioId);

    // Crear canje de reciclaje usando Sequelize
    const canjeReciclaje = await CanjeReciclaje.create({
      usuarioId,
      qrCode,
      qrReciclajeId: qrReciclaje.id,
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
        segunda: imagenes.segunda ? {
          ruta: imagenes.segunda,
          timestamp: new Date(),
          validacion: {
            exitosa: true,
            confianza: 0.9
          }
        } : null
      },
      tokensGenerados: qrReciclaje.configuracion?.valorTokens || 10,
      metadata: {
        ...metadata,
        startTime: new Date(),
        completedTime: new Date()
      }
    });

    // Generar cupón automáticamente
    const cuponCodigo = `RECYCLE-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
    const cupon = await Cupon.create({
      nombre: `Cupón de Reciclaje - ${qrCode}`,
      descripcion: 'Cupón generado por canje de basura reciclada',
      tokensRequeridos: 0, // El cupón ya está "pagado" con la acción de reciclaje
      codigo: cuponCodigo,
      fechaExpiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      activo: true,
      tipo: 'reciclaje',
      usuarioGenerado: usuarioId,
      canjeReciclajeId: canjeReciclaje.id
    });

    // Asociar cupón al canje
    await canjeReciclaje.update({ cuponGeneradoId: cupon.id });

    // Actualizar tokens del usuario
    await usuario.update({ 
      tokensAcumulados: (usuario.tokensAcumulados || 0) + canjeReciclaje.tokensGenerados 
    });

    // ACTUALIZAR CUPONMONEDA - Esto es lo que faltaba para sincronizar los sistemas
    const { CuponMoneda } = require('../models');
    let cuponMoneda = await CuponMoneda.findOne({
      where: { usuarioId }
    });
    
    if (!cuponMoneda) {
      // Crear CuponMoneda si no existe
      cuponMoneda = await CuponMoneda.create({
        usuarioId,
        cantidad: 0,
        activo: true
      });
    }
    
    // Incrementar la cantidad de cupones del usuario en 1
    await cuponMoneda.increment('cantidad', { by: 1 });
    
    console.log(`🎟️ [canje-reciclaje] CuponMoneda actualizado para usuario ${usuarioId}: ${cuponMoneda.cantidad + 1} cupones`);

    // Registrar trazabilidad
    await Trazabilidad.registrarEvento({
      phoneNumber,
      userId: usuarioId,
      step: 'exchange_completed',
      qr_code: qrCode,
      canjeReciclajeId: canjeReciclaje.id,
      coupon_id: cupon.id,
      exchange_id: canjeReciclaje.id,
      metadata: {
        tokensGenerados: canjeReciclaje.tokensGenerados,
        ...metadata
      }
    });

    res.status(201).json({
      success: true,
      mensaje: 'Canje de reciclaje creado exitosamente',
      canje: {
        id: canjeReciclaje.id,
        estado: canjeReciclaje.estado,
        fechaCompletado: canjeReciclaje.fechaCompletado,
        tokensGenerados: canjeReciclaje.tokensGenerados
      },
      cupon: {
        id: cupon.id,
        codigo: cupon.codigo,
        nombre: cupon.nombre,
        tokensRequeridos: cupon.tokensRequeridos,
        fechaExpiracion: cupon.fechaExpiracion,
        descripcion: cupon.descripcion
      },
      usuario: {
        tokensAcumulados: usuario.tokensAcumulados,
        cuponesDisponibles: cuponMoneda.cantidad + 1 // Incluir el nuevo saldo de cupones
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
