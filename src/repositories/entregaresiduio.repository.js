const EntregaResiduo = require('../models/entregaresiduo.model');

module.exports = {
  async crearEntrega(data) {
    const entrega = new EntregaResiduo(data);
    return entrega.save();
  },
  async listarPorUsuario(usuarioId) {
    return EntregaResiduo.find({ usuario: usuarioId }).populate('tipoResiduo').populate('ecopunto');
  },
  async buscarPorUsuario(usuarioId) {
    return EntregaResiduo.find({ usuario: usuarioId });
  },
  async listarTodasLasEntregas(filtros = {}) {
    let query = {};
    
    if (filtros.usuarioId) query.usuario = filtros.usuarioId;
    if (filtros.ecopuntoId) query.ecopunto = filtros.ecopuntoId;
    if (filtros.tipoResiduoId) query.tipoResiduo = filtros.tipoResiduoId;
    if (filtros.estado) query.estado = filtros.estado;
    if (filtros.fechaDesde) query.fecha = { $gte: new Date(filtros.fechaDesde) };
    if (filtros.fechaHasta) {
      if (query.fecha) {
        query.fecha.$lte = new Date(filtros.fechaHasta);
      } else {
        query.fecha = { $lte: new Date(filtros.fechaHasta) };
      }
    }
    
    return EntregaResiduo.find(query)
      .populate('usuario', 'nombre apellido email')
      .populate('ecopunto', 'nombre direccion')
      .populate('tipoResiduo', 'nombre descripcion')
      .populate('encargado', 'nombre apellido')
      .sort({ fecha: -1 });
  },
  async obtenerEstadisticas() {
    const totalEntregas = await EntregaResiduo.countDocuments();
    const totalPeso = await EntregaResiduo.aggregate([
      { $group: { _id: null, total: { $sum: '$pesoKg' } } }
    ]);
    const totalCupones = await EntregaResiduo.aggregate([
      { $group: { _id: null, total: { $sum: '$cuponesGenerados' } } }
    ]);
    
    return {
      totalEntregas,
      totalPeso: totalPeso[0]?.total || 0,
      totalCupones: totalCupones[0]?.total || 0
    };
  }
};