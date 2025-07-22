const { getDB1 } = require('../config/database');
const getEntregaResiduoModel = require('../models/entregaresiduo.model');

function getEntregaResiduo() {
  const db = getDB1();
  if (!db) throw new Error('DB1 no inicializada');
  return getEntregaResiduoModel(db);
}

module.exports = {
  async crearEntrega(data) {
    const entrega = new (getEntregaResiduo())(data);
    return entrega.save();
  },
  async listarPorUsuario(usuarioId) {
    return getEntregaResiduo().find({ usuario: usuarioId }).populate('tipoResiduo').populate('ecopunto');
  },
  async buscarPorUsuario(usuarioId) {
    return getEntregaResiduo().find({ usuario: usuarioId });
  }
};