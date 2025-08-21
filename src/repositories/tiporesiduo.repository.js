const TipoResiduo = require('../models/tiporesiduo.model');

module.exports = {
  async crear(data) {
    const tipo = new TipoResiduo(data);
    return tipo.save();
  },
  async listar() {
    return TipoResiduo.find();
  },
  async buscarPorNombre(nombre) {
    return TipoResiduo.findOne({ nombre });
  },
  async buscarPorId(id) {
    return TipoResiduo.findById(id);
  },
  async eliminarTipoResiduo(id) {
    return TipoResiduo.findByIdAndDelete(id);
  },
  async eliminar(id) {
    return TipoResiduo.findByIdAndDelete(id);
  },
  async actualizar(id, data) {
    return TipoResiduo.findByIdAndUpdate(id, data, { new: true });
  }
};