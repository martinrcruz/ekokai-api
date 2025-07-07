const Entrega = require('../models/entregaresiduo.model');

const crearEntrega = async (datos) => {
  console.log('🛠️ [REPO] Guardando entrega de residuos');
  return await Entrega.create(datos);
};

const listarPorUsuario = async (usuarioId) => {
  return await Entrega.find({ usuario: usuarioId })
    .populate('tipoResiduo')
    .populate('ecopunto')
    .sort({ fecha: -1 });
};

const buscarPorUsuario = async (usuarioId) => {
  return await Entrega.find({ usuario: usuarioId }).sort({ fecha: 1 });
};

module.exports = {
  crearEntrega,
  listarPorUsuario,
  buscarPorUsuario
};
