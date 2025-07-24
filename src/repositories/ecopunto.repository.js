const { getDB1 } = require('../config/database');
const getEcopuntoModel = require('../models/ecopunto.model');

function getEcopunto() {
  const db = getDB1();
  if (!db) throw new Error('DB1 no inicializada');
  return getEcopuntoModel(db);
}

module.exports = {
  async crearEcopunto(data) {
    const ecopunto = new (getEcopunto())(data);
    return ecopunto.save();
  },
  async listarEcopuntosConDetalle() {
    return getEcopunto().find().populate('encargado').populate('vecinos');
  },
  async buscarPorEncargado(encargadoId) {
    return getEcopunto().findOne({ encargado: encargadoId });
  },
  async actualizarEncargado(ecopuntoId, encargadoId) {
    return getEcopunto().findByIdAndUpdate(ecopuntoId, { encargado: encargadoId }, { new: true });
  },
  async actualizarEcopunto(ecopuntoId, datos) {
    return getEcopunto().findByIdAndUpdate(ecopuntoId, datos, { new: true });
  },
  async eliminarEcopunto(ecopuntoId) {
    return getEcopunto().findByIdAndDelete(ecopuntoId);
  }
};