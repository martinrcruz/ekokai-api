const servicio = require('../services/entregaresiduo.service');

const registrarEntrega = async (req, res) => {
  try {
    console.log('🎯 [CONTROLLER] → POST /entregas');
    const entrega = await servicio.registrarEntrega(req.body);
    res.status(201).json(entrega);
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
