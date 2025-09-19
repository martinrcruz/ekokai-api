const express = require('express');
const router = express.Router();
const usuarioCtrl = require('../controllers/usuario.controller');
const { authMiddleware, permitirRoles } = require('../middleware/auth.middleware');

// ✅ RUTA DE PRUEBA SIN AUTENTICACIÓN (DEBE IR ANTES DEL MIDDLEWARE)
router.get('/test-sin-auth', (req, res) => {
  console.log('🧪 [TEST] Ruta de prueba sin auth accedida');
  res.json({ message: 'Ruta sin auth funcionando', timestamp: new Date().toISOString() });
});

// ✅ RUTA DE PRUEBA CON AUTENTICACIÓN MANUAL
router.get('/test-con-auth', authMiddleware, (req, res) => {
  console.log('🧪 [TEST] Ruta de prueba con auth accedida');
  res.json({ message: 'Ruta con auth funcionando', usuario: req.usuario?.email, timestamp: new Date().toISOString() });
});

// ✅ RUTA DE PRUEBA PARA VERIFICAR SI EL MIDDLEWARE ESTÁ BLOQUEANDO
router.get('/test-middleware', (req, res) => {
  console.log('🧪 [TEST] Ruta de prueba middleware accedida');
  res.json({ message: 'Ruta middleware funcionando', timestamp: new Date().toISOString() });
});

// GET /api/usuarios/buscar-telefono - Buscar usuario por número de teléfono (SIN AUTENTICACIÓN)
router.get('/buscar-telefono', async (req, res) => {
  try {
    const { telefono } = req.query;
    
    console.log('🔍 [buscar-telefono] Buscando usuario con teléfono:', telefono);
    
    if (!telefono) {
      return res.status(400).json({
        success: false,
        mensaje: 'Número de teléfono es requerido'
      });
    }

    const Usuario = require('../models/usuario.model');
    const usuario = await Usuario.findOne({ where: { telefono: telefono } });
    
    console.log('🔍 [buscar-telefono] Usuario encontrado:', usuario ? `${usuario.nombre} ${usuario.apellido}` : 'No encontrado');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado con ese número de teléfono'
      });
    }

    // No devolver información sensible
    const usuarioLimpio = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      telefono: usuario.telefono,
      tokensAcumulados: usuario.tokensAcumulados,
      zona: usuario.zona,
      rol: usuario.rol,
      activo: usuario.activo,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt
    };

    res.json({
      success: true,
      usuario: usuarioLimpio,
      mensaje: 'Usuario encontrado exitosamente'
    });

  } catch (error) {
    console.error('Error buscando usuario por teléfono:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error buscando usuario',
      error: error.message
    });
  }
});

// ✅ REGISTRO DE VECINO DESDE WHATSAPP (SIN AUTENTICACIÓN) - DEBE IR ANTES DEL MIDDLEWARE
router.post('/registro-vecino', usuarioCtrl.registroVecinoWhatsApp);

// Aplica JWT a todas las rutas
router.use(authMiddleware);

// ========================================
// RUTAS ESPECÍFICAS (DEBEN IR PRIMERO)
// ========================================

// ✅ RUTA DE PRUEBA TEMPORAL
router.get('/test-estado', (req, res) => {
  console.log('🧪 [TEST] Ruta de prueba /test-estado accedida');
  res.json({ message: 'Ruta de prueba funcionando', timestamp: new Date().toISOString() });
});


// ✅ RUTA DE PRUEBA TEMPORAL PARA HISTORIAL (SIN AUTENTICACIÓN)
router.get('/test-historial/:usuarioId', async (req, res) => {
  try {
    console.log('🧪 [TEST] Ruta de prueba /test-historial accedida para usuario:', req.params.usuarioId);
    const entregaService = require('../services/entregaresiduo.service');
    const canjeService = require('../services/canje.service');
    
    const entregas = await entregaService.obtenerHistorialUsuario(req.params.usuarioId);
    const canjes = await canjeService.obtenerHistorialCanjes(req.params.usuarioId);
    
    res.json({ 
      message: 'Test de historial exitoso',
      entregas, 
      canjes,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('❌ [TEST] Error en test-historial:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ RUTA DE PRUEBA PATCH TEMPORAL
router.patch('/test-estado', (req, res) => {
  console.log('🧪 [TEST] Ruta de prueba PATCH /test-estado accedida');
  console.log('🧪 [TEST] Body recibido:', req.body);
  res.json({ 
    message: 'Ruta de prueba PATCH funcionando', 
    body: req.body,
    timestamp: new Date().toISOString() 
  });
});

// ✅ BUSCAR VECINOS - DEBE IR ANTES DE CUALQUIER RUTA CON PARÁMETROS
router.get('/buscar-vecinos', permitirRoles('administrador', 'encargado'), usuarioCtrl.buscarVecinos);

// ✅ REGISTRAR VECINO - DEBE IR ANTES DE CUALQUIER RUTA CON PARÁMETROS
router.post('/registrar', permitirRoles('administrador','encargado'), usuarioCtrl.registrarVecino);

// ✅ REGISTRAR ENCARGADO - DEBE IR ANTES DE CUALQUIER RUTA CON PARÁMETROS
router.post('/registrar-encargado', permitirRoles('administrador'), usuarioCtrl.registrarConRol);

// ✅ ADMINISTRADOR lista solo usuarios vecinos (DEBE IR ANTES DE LAS RUTAS CON PARÁMETROS)
router.get('/vecinos', permitirRoles('administrador'), usuarioCtrl.listarVecinos);

// ✅ ADMINISTRADOR lista usuarios no vecinos (DEBE IR ANTES DE LAS RUTAS CON PARÁMETROS)
router.get('/no-vecinos', permitirRoles('administrador'), usuarioCtrl.listarUsuariosNoVecinos);

// ========================================
// RUTAS CON PARÁMETROS (DEBEN IR DESPUÉS)
// ========================================

// ADMINISTRADOR lista usuarios
router.get('/', permitirRoles('administrador'), usuarioCtrl.listarUsuarios);

// Historial de usuario específico
router.get('/:usuarioId/historial', permitirRoles('administrador', 'encargado'), usuarioCtrl.historialInteracciones);

// Cupones de usuario específico (DEBE ir ANTES de las rutas genéricas)
router.get('/:usuarioId/cupones', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    
    console.log('🎟️ [cupones-usuario] Obteniendo cupones para usuario:', usuarioId);
    
    const cuponRepo = require('../repositories/cupon.repository');
    const cupones = await cuponRepo.buscarCuponesPorUsuario(usuarioId);
    
    console.log('🎟️ [cupones-usuario] Cupones encontrados:', cupones.length);
    
    res.json({
      success: true,
      cupones: cupones,
      count: cupones.length,
      mensaje: 'Cupones obtenidos exitosamente'
    });
    
  } catch (error) {
    console.error('❌ [cupones-usuario] Error obteniendo cupones:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error obteniendo cupones del usuario',
      error: error.message
    });
  }
});

// GET /api/usuarios/:id/estadisticas-reciclaje - Estadísticas de reciclaje de un usuario
router.get('/:id/estadisticas-reciclaje', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const Usuario = require('../models/usuario.model');
    const usuario = await Usuario.findById(id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    // Obtener estadísticas de canjes de reciclaje
    const CanjeReciclaje = require('../models/canjeReciclaje.model');
    const Trazabilidad = require('../models/trazabilidad.model');

    const [estadisticasCanjes, estadisticasTrazabilidad] = await Promise.all([
      CanjeReciclaje.aggregate([
        { $match: { usuarioId: mongoose.Types.ObjectId(id) } },
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
            ultimoCanje: { $max: '$fechaInicio' }
          }
        }
      ]),
      Trazabilidad.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(id) } },
        {
          $group: {
            _id: '$step',
            count: { $sum: 1 },
            ultimoEvento: { $max: '$timestamp' }
          }
        }
      ])
    ]);

    // Obtener canjes por mes (últimos 6 meses)
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    const canjesPorMes = await CanjeReciclaje.aggregate([
      {
        $match: {
          usuarioId: mongoose.Types.ObjectId(id),
          fechaInicio: { $gte: seisMesesAtras }
        }
      },
      {
        $group: {
          _id: {
            año: { $year: '$fechaInicio' },
            mes: { $month: '$fechaInicio' }
          },
          canjes: { $sum: 1 },
          tokens: { $sum: '$tokensGenerados' }
        }
      },
      { $sort: { '_id.año': -1, '_id.mes': -1 } }
    ]);

    const estadisticas = estadisticasCanjes[0] || {
      totalCanjes: 0,
      tokensGenerados: 0,
      canjesCompletados: 0,
      canjesFallidos: 0,
      ultimoCanje: null
    };

    res.json({
      success: true,
      estadisticas: {
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          tokensAcumulados: usuario.tokensAcumulados
        },
        reciclaje: {
          ...estadisticas,
          tasaExito: estadisticas.totalCanjes > 0 
            ? ((estadisticas.canjesCompletados / estadisticas.totalCanjes) * 100).toFixed(2)
            : 0
        },
        trazabilidad: estadisticasTrazabilidad,
        historialMensual: canjesPorMes
      },
      mensaje: 'Estadísticas obtenidas exitosamente'
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de reciclaje:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error obteniendo estadísticas de reciclaje',
      error: error.message
    });
  }
});

// Cambiar estado de usuario (solo admin)
router.patch('/:id/estado', permitirRoles('administrador'), usuarioCtrl.cambiarEstadoUsuario);

// Obtener usuario por ID
router.get('/:id', permitirRoles('administrador', 'encargado', 'vecino'), usuarioCtrl.obtenerUsuario);

// Actualizar usuario (solo admin)
router.put('/:id', permitirRoles('administrador'), usuarioCtrl.actualizarUsuario);

// Eliminar usuario (solo admin)
router.delete('/:id', permitirRoles('administrador'), usuarioCtrl.eliminarUsuario);

module.exports = router;
