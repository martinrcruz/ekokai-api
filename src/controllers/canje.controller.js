const canjeService = require('../services/canje.service');

const registrarCanje = async (req, res) => {
  try {
    const canje = await canjeService.registrarCanje(req.body);
    res.status(201).json(canje);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const historialCanjesUsuario = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    const canjes = await canjeService.obtenerHistorialCanjes(usuarioId);
    res.json(canjes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { registrarCanje, historialCanjesUsuario }; 