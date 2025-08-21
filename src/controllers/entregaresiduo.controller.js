const servicio = require('../services/entregaresiduo.service');

const registrarEntrega = async (req, res) => {
  try {
    console.log('🎯 [CONTROLLER] → POST /entregas');
    console.log('📋 [CONTROLLER] Datos recibidos:', req.body);
    
    const { usuarioId, ecopuntoId, tipoResiduoId, pesoKg, descripcion } = req.body;
    
    // Validaciones básicas
    if (!usuarioId || !ecopuntoId || !tipoResiduoId || !pesoKg) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: usuarioId, ecopuntoId, tipoResiduoId, pesoKg' 
      });
    }
    
    if (pesoKg <= 0) {
      return res.status(400).json({ error: 'El peso debe ser mayor a 0' });
    }
    
    const resultado = await servicio.registrarEntrega({
      usuarioId, 
      ecopuntoId, 
      tipoResiduoId, 
      pesoKg, 
      descripcion: descripcion || ''
    });
    
    console.log('✅ [CONTROLLER] Entrega registrada exitosamente');
    res.status(201).json({
      mensaje: 'Entrega registrada exitosamente',
      entrega: resultado.entrega,
      cupon: resultado.cupon,
      cuponesGenerados: resultado.cuponesGenerados
    });
  } catch (error) {
    console.error('❌ [CONTROLLER] Error al registrar entrega:', error.message);
    res.status(400).json({ error: error.message });
  }
};

const historialUsuario = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    const historial = await servicio.obtenerHistorialUsuario(usuarioId);
    res.json(historial);
  } catch (error) {
    console.error('❌ Error al obtener historial:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registrarEntrega,
  historialUsuario
};
