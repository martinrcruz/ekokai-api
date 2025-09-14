const recompensaService = require('../services/recompensa.service');

/**
 * Obtener todas las recompensas disponibles
 */
const obtenerRecompensasDisponibles = async (req, res) => {
  try {
    const recompensas = await recompensaService.obtenerRecompensasDisponibles();
    res.json(recompensas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Validar código de recompensa
 */
const validarCodigoRecompensa = async (req, res) => {
  try {
    const { codigo } = req.params;
    const resultado = await recompensaService.validarCodigo(codigo);
    
    if (resultado.valido) {
      res.json({
        valido: true,
        recompensa: resultado.recompensa
      });
    } else {
      res.status(404).json({
        valido: false,
        mensaje: resultado.mensaje || 'Código de recompensa no válido'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Crear nueva recompensa (solo administradores)
 */
const crearRecompensa = async (req, res) => {
  try {
    const recompensa = await recompensaService.crearRecompensa(req.body);
    res.status(201).json(recompensa);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Actualizar recompensa (solo administradores)
 */
const actualizarRecompensa = async (req, res) => {
  try {
    const { id } = req.params;
    const recompensa = await recompensaService.actualizarRecompensa(id, req.body);
    res.json(recompensa);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Eliminar recompensa (solo administradores)
 */
const eliminarRecompensa = async (req, res) => {
  try {
    const { id } = req.params;
    await recompensaService.eliminarRecompensa(id);
    res.json({ mensaje: 'Recompensa eliminada exitosamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  obtenerRecompensasDisponibles,
  validarCodigoRecompensa,
  crearRecompensa,
  actualizarRecompensa,
  eliminarRecompensa
};
