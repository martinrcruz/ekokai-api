const TipoResiduo = require('../models/tiporesiduo.model');

module.exports = {
  async crear(data) {
    return await TipoResiduo.create(data);
  },
  async listar() {
    return await TipoResiduo.findAll();
  },
  async buscarPorNombre(nombre) {
    return await TipoResiduo.findOne({ where: { nombre } });
  },
  async buscarPorId(id) {
    return await TipoResiduo.findByPk(id);
  },
  async eliminarTipoResiduo(id) {
    const tipo = await TipoResiduo.findByPk(id);
    if (!tipo) return null;
    
    await tipo.destroy();
    return tipo;
  },
  async eliminar(id) {
    const tipo = await TipoResiduo.findByPk(id);
    if (!tipo) return null;
    
    await tipo.destroy();
    return tipo;
  },
  async actualizar(id, data) {
    const tipo = await TipoResiduo.findByPk(id);
    if (!tipo) return null;
    
    await tipo.update(data);
    return tipo;
  }
};