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

const historialPorUsuario = async (usuarioId) => {
  const entregas = await Entrega.find({ usuario: usuarioId });
  const totalKg = entregas.reduce((sum, e) => sum + (e.pesoKg || 0), 0);
  const totalTokens = entregas.reduce((sum, e) => sum + (e.tokensOtorgados || 0), 0);
  return { entregas, totalKg, totalTokens };
};

const metricasPorEcopunto = async (ecopuntoId) => {
  const entregas = await Entrega.find({ ecopunto: ecopuntoId });
  const totalKg = entregas.reduce((sum, e) => sum + (e.pesoKg || 0), 0);
  const totalTokens = entregas.reduce((sum, e) => sum + (e.tokensOtorgados || 0), 0);
  return { totalKg, totalTokens };
};

module.exports = {
  crearEntrega,
  listarPorUsuario,
  buscarPorUsuario,
  historialPorUsuario,
  metricasPorEcopunto
};
