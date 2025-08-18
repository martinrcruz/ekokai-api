const express = require('express');
const router = express.Router();
const { 
  registrarUsuarioDesdeEcopunto, 
  procesarReciclaje 
} = require('../controllers/whatsapp.controller');
const ecopuntoRepo = require('../repositories/ecopunto.repository');

const ecopuntoCtrl = require('../controllers/ecopunto.controller');
// importa tu middleware de autenticación
const { authMiddleware, permitirRoles } = require('../middleware/auth.middleware');

// ==============================
// LOGS INICIALES (TIPOS / KEYS)
// ==============================
try {
  console.log('[ROUTES/ecopunto] Controller keys:', Object.keys(ecopuntoCtrl || {}));
} catch (e) {
  console.error('[ROUTES/ecopunto] ERROR leyendo keys del controller:', e?.message);
}
try {
  console.log('[ROUTES/ecopunto] Auth middleware keys:', typeof authMiddleware, typeof permitirRoles);
} catch (e) {
  console.error('[ROUTES/ecopunto] ERROR leyendo tipos de middlewares:', e?.message);
}

// ==============================
// HELPERS DEFENSIVOS Y DE LOG
// ==============================
const ensureFn = (fn, name) => {
  if (typeof fn === 'function') return fn;
  console.error(`[ROUTES/ecopunto] ❌ ${name} no es función (valor: ${String(fn)}). Se usará handler 500.`);
  return (req, res) =>
    res.status(500).json({
      success: false,
      error: `Handler "${name}" no está disponible. Revisa exports/imports.`,
    });
};

const withTiming = (label, handler) => {
  const safeHandler = ensureFn(handler, label);
  return async (req, res, next) => {
    const start = process.hrtime.bigint();
    console.log(`[ROUTES/ecopunto] ▶ ${label} IN :: params=${JSON.stringify(req.params)} query=${JSON.stringify(req.query)}`);
    try {
      await safeHandler(req, res, next);
    } finally {
      const end = process.hrtime.bigint();
      const ms = Number(end - start) / 1e6;
      console.log(`[ROUTES/ecopunto] ◀ ${label} OUT :: ${ms.toFixed(2)}ms`);
    }
  };
};

const logMW = (label) => (req, _res, next) => {
  console.log(`[ROUTES/ecopunto] → ${label} :: usuario=${req.usuario?.email || 'N/A'} rol=${req.usuario?.rol || 'N/A'} url=${req.originalUrl}`);
  next();
};

const safePermitirRolesFactory = (...roles) => {
  if (typeof permitirRoles !== 'function') {
    console.error('[ROUTES/ecopunto] ❌ permitirRoles no es función. Se devolverá middleware 500.');
    return (req, res) => res.status(500).json({ success: false, error: 'Middleware "permitirRoles" no disponible' });
  }
  try {
    const mw = permitirRoles(...roles);
    if (typeof mw !== 'function') {
      console.error('[ROUTES/ecopunto] ❌ permitirRoles(...) no devolvió función.');
      return (req, res) => res.status(500).json({ success: false, error: 'permitirRoles no devolvió handler' });
    }
    return (req, res, next) => {
      console.log(`[ROUTES/ecopunto] Check roles [${roles.join(', ')}], usuario=${req.usuario?.email || 'N/A'} rol=${req.usuario?.rol || 'N/A'}`);
      return mw(req, res, next);
    };
  } catch (e) {
    console.error('[ROUTES/ecopunto] ❌ Error creando middleware permitirRoles:', e?.message);
    return (req, res) => res.status(500).json({ success: false, error: 'Error inicializando permitirRoles' });
  }
};

const safeAuth = ensureFn(authMiddleware, 'authMiddleware');

// Log de toda request que entra a este router
router.use((req, _res, next) => {
  console.log(`[ROUTES/ecopunto] >>> INCOMING ${req.method} ${req.originalUrl}`);
  next();
});

// Handlers del controller, envueltos con ensure + timing
const hTotalKgPorId     = withTiming('ecopuntoCtrl.obtenerTotalKgPorEcopunto', ecopuntoCtrl?.obtenerTotalKgPorEcopunto);
const hTotalKgPorNom    = withTiming('ecopuntoCtrl.obtenerTotalKgPorNombre',   ecopuntoCtrl?.obtenerTotalKgPorNombre);
const hTotalKgMensPorId = withTiming('ecopuntoCtrl.obtenerTotalKgMensualPorEcopunto', ecopuntoCtrl?.obtenerTotalKgMensualPorEcopunto);
const hTotalKgMensPorNom= withTiming('ecopuntoCtrl.obtenerTotalKgMensualPorNombre',   ecopuntoCtrl?.obtenerTotalKgMensualPorNombre);
const hVecinosPorId   = withTiming('ecopuntoCtrl.obtenerTotalVecinosPorEcopunto', ecopuntoCtrl?.obtenerTotalVecinosPorEcopunto);
const hVecinosPorNom  = withTiming('ecopuntoCtrl.obtenerTotalVecinosPorNombre',   ecopuntoCtrl?.obtenerTotalVecinosPorNombre);
const hEntregasDetId  = withTiming('ecopuntoCtrl.obtenerEntregasDetalladasPorEcopunto', ecopuntoCtrl?.obtenerEntregasDetalladasPorEcopunto);
const hEntregasDetNom = withTiming('ecopuntoCtrl.obtenerEntregasDetalladasPorNombre',   ecopuntoCtrl?.obtenerEntregasDetalladasPorNombre);
const hUpsertMeta     = withTiming('ecopuntoCtrl.upsertMetaMensual', ecopuntoCtrl?.upsertMetaMensual);
const hGetMeta        = withTiming('ecopuntoCtrl.obtenerMetaMensual', ecopuntoCtrl?.obtenerMetaMensual);
const hDelMeta        = withTiming('ecopuntoCtrl.eliminarMetaMensual', ecopuntoCtrl?.eliminarMetaMensual);

// Función para enrolar encargado
const enrolarEncargado = async (req, res) => {
  console.log('🎯 [CONTROLLER] → PATCH /ecopuntos/:id/enrolar');
  try {
    const { id } = req.params;
    const { encargadoId } = req.body;

    const actualizado = await ecopuntoRepo.actualizarEncargado(id, encargadoId);
    res.json(actualizado);
  } catch (err) {
    console.error('❌ [CONTROLLER] Error al enrolar encargado:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/ecopunto/registrar
// Registro de usuario desde ecopunto
router.post('/registrar', async (req, res) => {
  console.log('📥 [ROUTE] POST /api/ecopunto/registrar - Datos recibidos:', req.body);
  
  try {
    const { nombre, apellido, dni, telefono, email } = req.body;
    
    console.log('📋 [ROUTE] Datos extraídos:', { nombre, apellido, dni, telefono, email });
    
    // Validar datos requeridos
    if (!nombre || !apellido || !dni || !telefono) {
      console.log('❌ [ROUTE] Validación fallida - Datos faltantes:', { 
        nombre: !!nombre, 
        apellido: !!apellido, 
        dni: !!dni, 
        telefono: !!telefono 
      });
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: nombre, apellido, dni, telefono'
      });
    }
    
    console.log('✅ [ROUTE] Validación exitosa, llamando a registrarUsuarioDesdeEcopunto...');
    
    const usuario = await registrarUsuarioDesdeEcopunto({
      nombre,
      apellido,
      dni,
      telefono,
      email
    });
    
    console.log('✅ [ROUTE] Usuario registrado exitosamente:', usuario._id);
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        id: usuario._id,
        nombre: usuario.nombre,
        telefono: usuario.telefono,
        tokens: usuario.tokens
      }
    });
    
  } catch (error) {
    console.error('[ERROR] Error en registro desde ecopunto:', error);
    console.error('[ERROR] Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/ecopunto/reciclar
// Procesar reciclaje y asignar tokens
router.post('/reciclar', async (req, res) => {
  try {
    const { telefono, tipoMaterial, peso } = req.body;
    
    // Validar datos requeridos
    if (!telefono || !tipoMaterial || !peso) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: telefono, tipoMaterial, peso'
      });
    }
    
    // Validar que el peso sea un número positivo
    const pesoNumero = parseFloat(peso);
    if (isNaN(pesoNumero) || pesoNumero <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El peso debe ser un número positivo'
      });
    }
    
    const resultado = await procesarReciclaje({
      telefono,
      tipoMaterial,
      peso: pesoNumero
    });
    
    res.status(200).json({
      success: true,
      message: 'Reciclaje procesado exitosamente',
      data: {
        tokensGanados: resultado.tokensGanados,
        usuario: resultado.usuario,
        peso: pesoNumero,
        tipoMaterial
      }
    });
    
  } catch (error) {
    console.error('[ERROR] Error procesando reciclaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/ecopunto/status
// Verificar estado del servicio
router.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servicio de ecopunto funcionando correctamente',
    timestamp: new Date().toISOString(),
    endpoints: {
      registrar: 'POST /api/ecopunto/registrar',
      reciclar: 'POST /api/ecopunto/reciclar',
      listar: 'GET /api/ecopunto'
    }
  });
});

// POST /api/ecopunto
// Crear un nuevo ecopunto
router.post('/', async (req, res) => {
  try {
    console.log('📥 [ROUTE] POST /api/ecopunto - Creando nuevo ecopunto:', req.body);
    
    const { nombre, direccion, zona, horarioApertura, horarioCierre, capacidadMaxima, descripcion } = req.body;
    
    // Validar datos requeridos
    if (!nombre || !direccion || !zona) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: nombre, direccion, zona'
      });
    }
    
    const datosEcopunto = {
      nombre,
      direccion,
      zona,
      horarioApertura: horarioApertura || '08:00',
      horarioCierre: horarioCierre || '20:00',
      capacidadMaxima: capacidadMaxima || 1000,
      descripcion: descripcion || ''
    };
    
    const nuevoEcopunto = await ecopuntoRepo.crearEcopunto(datosEcopunto);
    
    console.log('✅ [ROUTE] Ecopunto creado exitosamente:', nuevoEcopunto._id);
    
    res.status(200).json({
      success: true,
      message: 'Ecopunto creado exitosamente',
      data: nuevoEcopunto
    });
    
  } catch (err) {
    console.error('❌ [ROUTE] Error al crear ecopunto:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error al crear ecopunto',
      error: err.message 
    });
  }
});

// PATCH /api/ecopunto/:id/enrolar
// Enrolar un encargado a un ecopunto
router.patch('/:id/enrolar', enrolarEncargado);

// PUT /api/ecopunto/:id
// Editar un ecopunto existente
router.put('/:id', async (req, res) => {
  try {
    console.log('📝 [ROUTE] PUT /api/ecopunto/:id - Editando ecopunto:', req.params.id);
    console.log('📋 [ROUTE] Datos de actualización:', req.body);
    
    const { id } = req.params;
    const { nombre, direccion, zona, horarioApertura, horarioCierre, capacidadMaxima, descripcion, encargadoId } = req.body;
    
    // Validar datos requeridos
    if (!nombre || !direccion || !zona) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: nombre, direccion, zona'
      });
    }
    
    const datosActualizacion = {
      nombre,
      direccion,
      zona,
      horarioApertura: horarioApertura || '08:00',
      horarioCierre: horarioCierre || '20:00',
      capacidadMaxima: capacidadMaxima || 1000,
      descripcion: descripcion || ''
    };
    
    // Si se proporciona un encargadoId, actualizarlo también
    if (encargadoId) {
      datosActualizacion.encargado = encargadoId;
    }
    
    const ecopuntoActualizado = await ecopuntoRepo.actualizarEcopunto(id, datosActualizacion);
    
    if (!ecopuntoActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Ecopunto no encontrado'
      });
    }
    
    console.log('✅ [ROUTE] Ecopunto actualizado exitosamente:', id);
    
    res.status(200).json({
      success: true,
      message: 'Ecopunto actualizado exitosamente',
      data: ecopuntoActualizado
    });
    
  } catch (err) {
    console.error('❌ [ROUTE] Error al actualizar ecopunto:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar ecopunto',
      error: err.message 
    });
  }
});

// DELETE /api/ecopunto/:id
// Eliminar un ecopunto
router.delete('/:id', async (req, res) => {
  try {
    console.log('🗑️ [ROUTE] DELETE /api/ecopunto/:id - Eliminando ecopunto:', req.params.id);
    
    const { id } = req.params;
    
    const ecopuntoEliminado = await ecopuntoRepo.eliminarEcopunto(id);
    
    if (!ecopuntoEliminado) {
      return res.status(404).json({
        success: false,
        message: 'Ecopunto no encontrado'
      });
    }
    
    console.log('✅ [ROUTE] Ecopunto eliminado exitosamente:', id);
    
    res.status(200).json({
      success: true,
      message: 'Ecopunto eliminado exitosamente',
      data: ecopuntoEliminado
    });
    
  } catch (err) {
    console.error('❌ [ROUTE] Error al eliminar ecopunto:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar ecopunto',
      error: err.message 
    });
  }
});

// GET /api/ecopunto
// Listar todos los ecopuntos con detalles de encargado y vecinos
router.get('/', async (req, res) => {
  try {
    console.log('📋 [ROUTE] GET /api/ecopunto - Listando ecopuntos con encargado y vecinos');
    const ecopuntos = await ecopuntoRepo.listarEcopuntosConDetalle();
    res.status(200).json({
      success: true,
      message: 'Ecopuntos obtenidos exitosamente',
      data: ecopuntos
    });
  } catch (err) {
    console.error('❌ [ROUTE] Error al listar ecopuntos:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener ecopuntos',
      error: err.message 
    });
  }
});


// === NUEVOS ENDPOINTS con validación de roles ===
// Serie mensual de kg por ID de ecopunto (definida ANTES que /:id/total-kg)
router.get(
  '/:id/total-kg-mensual',
  logMW('GET /:id/total-kg-mensual (pre-auth)'),
  safeAuth,
  logMW('GET /:id/total-kg-mensual (post-auth)'),
  safePermitirRolesFactory('administrador', 'encargado'),
  logMW('GET /:id/total-kg-mensual (post-roles)'),
  hTotalKgMensPorId
);

// Serie mensual de kg por nombre de ecopunto (query param ?nombre=Centro)
router.get(
  '/total-kg-mensual',
  logMW('GET /total-kg-mensual (pre-auth)'),
  safeAuth,
  logMW('GET /total-kg-mensual (post-auth)'),
  safePermitirRolesFactory('administrador', 'encargado'),
  logMW('GET /total-kg-mensual (post-roles)'),
  hTotalKgMensPorNom
);

// Total histórico por ID de ecopunto
router.get(
  '/:id/total-kg',
  logMW('GET /:id/total-kg (pre-auth)'),
  safeAuth,
  logMW('GET /:id/total-kg (post-auth)'),
  safePermitirRolesFactory('administrador', 'encargado'),
  logMW('GET /:id/total-kg (post-roles)'),
  hTotalKgPorId
);

// Total histórico por nombre de ecopunto (query param ?nombre=Centro)
router.get(
  '/total-kg',
  logMW('GET /total-kg (pre-auth)'),
  safeAuth,
  logMW('GET /total-kg (post-auth)'),
  safePermitirRolesFactory('administrador', 'encargado'),
  logMW('GET /total-kg (post-roles)'),
  hTotalKgPorNom
);

// Entregas detalladas por ID de ecopunto (fecha/hora/nombreVecino/kg)
router.get(
  '/:id/entregas-detalle',
  logMW('GET /:id/entregas-detalle (pre-auth)'),
  safeAuth,
  logMW('GET /:id/entregas-detalle (post-auth)'),
  safePermitirRolesFactory('administrador', 'encargado'),
  logMW('GET /:id/entregas-detalle (post-roles)'),
  hEntregasDetId
);

// Entregas detalladas por nombre de ecopunto (?nombre=Centro)
router.get(
  '/entregas-detalle',
  logMW('GET /entregas-detalle (pre-auth)'),
  safeAuth,
  logMW('GET /entregas-detalle (post-auth)'),
  safePermitirRolesFactory('administrador', 'encargado'),
  logMW('GET /entregas-detalle (post-roles)'),
  hEntregasDetNom
);
// Total vecinos por ID de ecopunto
router.get(
  '/:id/total-vecinos',
  logMW('GET /:id/total-vecinos (pre-auth)'),
  safeAuth,
  logMW('GET /:id/total-vecinos (post-auth)'),
  safePermitirRolesFactory('administrador', 'encargado'),
  logMW('GET /:id/total-vecinos (post-roles)'),
  hVecinosPorId
);

// Total vecinos por nombre de ecopunto (?nombre=Centro)
router.get(
  '/total-vecinos',
  logMW('GET /total-vecinos (pre-auth)'),
  safeAuth,
  logMW('GET /total-vecinos (post-auth)'),
  safePermitirRolesFactory('administrador', 'encargado'),
  logMW('GET /total-vecinos (post-roles)'),
  hVecinosPorNom
);

// === Metas mensuales ===
router.put(
  '/:id/meta-mensual',
  logMW('PUT /:id/meta-mensual (pre-auth)'),
  safeAuth,
  logMW('PUT /:id/meta-mensual (post-auth)'),
  safePermitirRolesFactory('administrador', 'encargado'),
  logMW('PUT /:id/meta-mensual (post-roles)'),
  hUpsertMeta
);

router.get(
  '/:id/meta-mensual',
  logMW('GET /:id/meta-mensual (pre-auth)'),
  safeAuth,
  logMW('GET /:id/meta-mensual (post-auth)'),
  safePermitirRolesFactory('administrador', 'encargado'),
  logMW('GET /:id/meta-mensual (post-roles)'),
  hGetMeta
);

router.delete(
  '/:id/meta-mensual',
  logMW('DELETE /:id/meta-mensual (pre-auth)'),
  safeAuth,
  logMW('DELETE /:id/meta-mensual (post-auth)'),
  safePermitirRolesFactory('administrador', 'encargado'),
  logMW('DELETE /:id/meta-mensual (post-roles)'),
  hDelMeta
);

// 404 local del router de ecopuntos para loguear claramente
router.use((req, res) => {
  console.warn(`[ROUTES/ecopunto] 404 (router) para ${req.method} ${req.originalUrl}`);
  return res.status(404).json({ success: false, message: 'Ruta de ecopuntos no encontrada', path: req.originalUrl });
});

// Debug: listar rutas registradas en este router
try {
  const listRoutes = (rtr) => {
    const routes = [];
    rtr.stack?.forEach((layer) => {
      if (layer.route) {
        const path = layer.route?.path;
        const methods = Object.keys(layer.route?.methods || {}).join(',').toUpperCase();
        routes.push(`${methods} ${path}`);
      }
    });
    console.log('[ROUTES/ecopunto] Rutas registradas:', routes);
  };
  listRoutes(router);
} catch (e) {
  console.warn('[ROUTES/ecopunto] No se pudieron listar rutas:', e?.message);
}

module.exports = router;
