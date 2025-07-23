const getEntregaResiduoModel = require('../models/entregaresiduo.model');

module.exports = {
  async crearEntrega(data) {
    const EntregaResiduo = await getEntregaResiduoModel();
    const entrega = new EntregaResiduo(data);
    return entrega.save();
  },
  async listarPorUsuario(usuarioId) {
    const EntregaResiduo = await getEntregaResiduoModel();
    return EntregaResiduo.find({ usuario: usuarioId }).populate('tipoResiduo').populate('ecopunto');
  },
  async buscarPorUsuario(usuarioId) {
    const EntregaResiduo = await getEntregaResiduoModel();
    return EntregaResiduo.find({ usuario: usuarioId });
  }
};