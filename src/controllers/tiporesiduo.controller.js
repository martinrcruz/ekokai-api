const tipoService = require('../services/tiporesiduo.service');

const crear = async (req, res) => {
  try {
    console.log('🎯 [CONTROLLER] → POST /tipos-residuo');
    const nuevoTipo = await tipoService.crearTipoResiduo(req.body);
    res.status(201).json(nuevoTipo);
  } catch (error) {
    console.error('❌ [CONTROLLER] Error al crear tipo de residuo:', error.message);
    res.status(400).json({ error: error.message });
  }
};

const listar = async (req, res) => {
  try {
    console.log('🎯 [CONTROLLER] → GET /tipos-residuo');
    const tipos = await tipoService.obtenerTodos();
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar tipos de residuo' });
  }
};

const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ [CONTROLLER] → DELETE /tipos-residuo/' + id);
    await tipoService.eliminarTipoResiduo(id);
    res.json({ mensaje: 'Tipo de residuo eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizado = await tipoService.actualizarTipoResiduo(id, req.body);
    res.json(actualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  crear,
  listar,
  eliminar,
  actualizar
};
