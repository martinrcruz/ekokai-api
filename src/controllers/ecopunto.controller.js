const ecopuntoService = require('../services/ecopunto.service');
const ecopuntoRepo= require('../repositories/ecopunto.repository');
const crearEcopunto = async (req, res) => {
    console.log('🎯 [CONTROLLER] → POST /ecopuntos');
    try {
      const { nombre, direccion, encargadoId } = req.body;
      const nuevoEcopunto = await ecopuntoService.crearEcopunto({ nombre, direccion, encargadoId });
      return res.status(201).json(nuevoEcopunto);
    } catch (err) {
      console.error('❌ [CONTROLLER] Error al crear ecopunto:', err.message);
      return res.status(400).json({ error: err.message });
    }
  };

const enrolarEncargado = async (req, res) => {
  console.log('🎯 [CONTROLLER] → PATCH /ecopuntos/:id/enrolar');
  try {
    const { id } = req.params;
    const { encargadoId } = req.body;

    const actualizado = await ecopuntoService.asignarEncargado(id, encargadoId);
    res.json(actualizado);
  } catch (err) {
    console.error('❌ [CONTROLLER] Error al enrolar encargado:', err.message);
    res.status(500).json({ error: err.message });
  }
};
// controllers/ecopunto.controller.js
const listarEcopuntos = async (req, res) => {
    try {
      console.log('📋 [CONTROLLER] Listando ecopuntos con encargado y vecinos');
      const ecopuntos = await ecopuntoRepo.listarEcopuntosConDetalle();
      res.json(ecopuntos);
    } catch (err) {
      console.error('❌ Error al listar ecopuntos:', err);
      res.status(500).json({ error: 'Error al obtener ecopuntos' });
    }
  };
  

module.exports = {
  crearEcopunto,
  enrolarEncargado,
  listarEcopuntos
};
