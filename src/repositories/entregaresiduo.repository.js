const EntregaResiduo = require('../models/entregaresiduo.model');
const Usuario = require('../models/usuario.model');
const Ecopunto = require('../models/ecopunto.model');
const TipoResiduo = require('../models/tiporesiduo.model');
const { Op } = require('sequelize');

module.exports = {
  async crearEntrega(data) {
    return await EntregaResiduo.create(data);
  },
  async listarPorUsuario(usuarioId) {
    return await EntregaResiduo.findAll({
      where: { usuarioId: usuarioId },
      include: [
        {
          model: TipoResiduo,
          as: 'tipoResiduo',
          attributes: ['id', 'nombre', 'descripcion']
        },
        {
          model: Ecopunto,
          as: 'ecopunto',
          attributes: ['id', 'nombre', 'direccion']
        }
      ],
      order: [['fecha', 'DESC']]
    });
  },
  async buscarPorUsuario(usuarioId) {
    return await EntregaResiduo.findAll({
      where: { usuarioId: usuarioId },
      order: [['fecha', 'DESC']]
    });
  },
  async listarTodasLasEntregas(filtros = {}) {
    let whereClause = {};
    
    if (filtros.usuarioId) whereClause.usuarioId = filtros.usuarioId;
    if (filtros.ecopuntoId) whereClause.ecopuntoId = filtros.ecopuntoId;
    if (filtros.tipoResiduoId) whereClause.tipoResiduoId = filtros.tipoResiduoId;
    if (filtros.estado) whereClause.estado = filtros.estado;
    
    if (filtros.fechaDesde || filtros.fechaHasta) {
      whereClause.fecha = {};
      if (filtros.fechaDesde) whereClause.fecha[Op.gte] = new Date(filtros.fechaDesde);
      if (filtros.fechaHasta) whereClause.fecha[Op.lte] = new Date(filtros.fechaHasta);
    }
    
    return await EntregaResiduo.findAll({
      where: whereClause,
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: Ecopunto,
          as: 'ecopunto',
          attributes: ['id', 'nombre', 'direccion']
        },
        {
          model: TipoResiduo,
          as: 'tipoResiduo',
          attributes: ['id', 'nombre', 'descripcion']
        }
      ],
      order: [['fecha', 'DESC']]
    });
  },
  async obtenerEstadisticas() {
    const totalEntregas = await EntregaResiduo.count();
    const totalPeso = await EntregaResiduo.sum('pesoKg') || 0;
    const totalCupones = await EntregaResiduo.sum('cuponesGenerados') || 0;
    
    return {
      totalEntregas,
      totalPeso,
      totalCupones
    };
  },

  // Métodos adicionales para admin
  async historialPorUsuario(usuarioId) {
    return await EntregaResiduo.findAll({
      where: { usuarioId: usuarioId },
      include: [
        {
          model: TipoResiduo,
          as: 'tipoResiduo',
          attributes: ['id', 'nombre', 'descripcion']
        },
        {
          model: Ecopunto,
          as: 'ecopunto',
          attributes: ['id', 'nombre', 'direccion']
        }
      ],
      order: [['fecha', 'DESC']]
    });
  },

  async metricasPorEcopunto(ecopuntoId) {
    const entregas = await EntregaResiduo.findAll({
      where: { ecopuntoId: ecopuntoId },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido']
        },
        {
          model: TipoResiduo,
          as: 'tipoResiduo',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['fecha', 'DESC']]
    });

    const totalKg = entregas.reduce((sum, entrega) => sum + (entrega.pesoKg || 0), 0);
    const totalCupones = entregas.reduce((sum, entrega) => sum + (entrega.cuponesGenerados || 0), 0);
    const usuariosUnicos = new Set(entregas.map(e => e.usuario?.id?.toString())).size;

    return {
      entregas,
      totalKg,
      totalCupones,
      usuariosUnicos,
      totalEntregas: entregas.length
    };
  }
};