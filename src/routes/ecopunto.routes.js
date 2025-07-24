const express = require('express');
const router = express.Router();
const { 
  registrarUsuarioDesdeEcopunto, 
  procesarReciclaje 
} = require('../controllers/whatsapp.controller');
const ecopuntoRepo = require('../repositories/ecopunto.repository');

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

module.exports = router;
