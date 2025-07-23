const express = require('express');
const router = express.Router();
const { 
  registrarUsuarioDesdeEcopunto, 
  procesarReciclaje 
} = require('../controllers/whatsapp.controller');

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
      reciclar: 'POST /api/ecopunto/reciclar'
    }
  });
});

module.exports = router;
