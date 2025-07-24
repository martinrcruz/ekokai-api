const { getDB1 } = require('../config/database');
const getTipoResiduoModel = require('../models/tiporesiduo.model');

function getTipoResiduo() {
  const db = getDB1();
  if (!db) throw new Error('DB1 no inicializada');
  return getTipoResiduoModel(db);
}

module.exports = {
  async crear(data) {
    const tipo = new (getTipoResiduo())(data);
    return tipo.save();
  },
  async listar() {
    return getTipoResiduo().find();
  },
  async buscarPorNombre(nombre) {
    return getTipoResiduo().findOne({ nombre });
  },
  async buscarPorId(id) {
    return getTipoResiduo().findById(id);
  },
  async eliminarTipoResiduo(id) {
    return getTipoResiduo().findByIdAndDelete(id);
  },
  async eliminar(id) {
    return getTipoResiduo().findByIdAndDelete(id);
  },
  async actualizar(id, data) {
    return getTipoResiduo().findByIdAndUpdate(id, data, { new: true });
  }
};