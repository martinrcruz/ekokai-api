const Ecopunto = require('../models/ecopunto.model');
const Usuario = require('../models/usuario.model');
const EcopuntoMeta = require('../models/ecopuntoMeta.model');
const EntregaResiduo = require('../models/entregaresiduo.model');
const { Op } = require('sequelize');

async function calcularTotalKgPorEcopuntoId(ecopuntoId) {
  const resultado = await EntregaResiduo.sum('pesoKg', {
    where: { ecopuntoId: ecopuntoId }
  });
  return resultado || 0;
}

async function calcularTotalKgPorNombre(nombre) {
  // busca el ecopunto por nombre (case-insensitive) y delega al sumatorio por id
  const ecopunto = await Ecopunto.findOne({ 
    where: { 
      nombre: { [Op.iLike]: nombre } 
    } 
  });
  if (!ecopunto) return { totalKg: 0, ecopunto: null };

  const totalKg = await calcularTotalKgPorEcopuntoId(ecopunto.id);
  return { totalKg, ecopunto };
}

async function calcularTotalKgMensualPorEcopuntoId(ecopuntoId) {
  const { Op, fn, col, literal } = require('sequelize');
  
  const resultados = await EntregaResiduo.findAll({
    attributes: [
      [fn('EXTRACT', literal('YEAR FROM "fecha"')), 'año'],
      [fn('EXTRACT', literal('MONTH FROM "fecha"')), 'mes'],
      [fn('SUM', col('pesoKg')), 'totalKg']
    ],
    where: { ecopuntoId },
    group: [
      fn('EXTRACT', literal('YEAR FROM "fecha"')),
      fn('EXTRACT', literal('MONTH FROM "fecha"'))
    ],
    order: [
      [fn('EXTRACT', literal('YEAR FROM "fecha"')), 'ASC'],
      [fn('EXTRACT', literal('MONTH FROM "fecha"')), 'ASC']
    ],
    raw: true
  });

  return resultados.map(r => ({
    año: parseInt(r.año),
    mes: parseInt(r.mes),
    totalKg: parseFloat(r.totalKg) || 0
  }));
}

async function calcularTotalKgMensualPorNombre(nombre) {
  const ecopunto = await Ecopunto.findOne({ 
    where: { 
      nombre: { [Op.iLike]: nombre } 
    } 
  });
  if (!ecopunto) return { series: [], ecopunto: null };
  const series = await calcularTotalKgMensualPorEcopuntoId(ecopunto.id);
  return { series, ecopunto };
}

async function contarVecinosPorEcopuntoId(ecopuntoId) {
  const totalVecinos = await Usuario.count({
    where: { 
      ecopuntoId: ecopuntoId, 
      rol: 'vecino' 
    }
  });
  return totalVecinos;
}

async function contarVecinosPorNombre(nombre) {
  const ecopunto = await Ecopunto.findOne({ 
    where: { 
      nombre: { [Op.iLike]: nombre } 
    } 
  });
  if (!ecopunto) return { totalVecinos: 0, ecopunto: null };
  const totalVecinos = await contarVecinosPorEcopuntoId(ecopunto.id);
  return { totalVecinos, ecopunto };
}

async function listarEntregasDetalladasPorEcopuntoId(ecopuntoId, { desde, hasta, limit } = {}) {
  const whereClause = { ecopuntoId: ecopuntoId };
  
  if (desde || hasta) {
    whereClause.fecha = {};
    if (desde) whereClause.fecha[Op.gte] = new Date(desde);
    if (hasta) whereClause.fecha[Op.lte] = new Date(hasta);
  }

  const max = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(500, Number(limit))) : 100;

  const entregas = await EntregaResiduo.findAll({
    where: whereClause,
    include: [{
      model: Usuario,
      as: 'usuario',
      attributes: ['id', 'nombre', 'apellido']
    }],
    order: [['fecha', 'DESC']],
    limit: max
  });

  // Transformar datos para mantener compatibilidad
  return entregas.map(entrega => ({
    fecha: entrega.fecha.toISOString().split('T')[0],
    hora: entrega.fecha.toTimeString().split(' ')[0],
    pesoKg: entrega.pesoKg || 0,
    nombreVecino: entrega.usuario ? `${entrega.usuario.nombre || ''} ${entrega.usuario.apellido || ''}`.trim() : 'N/A',
    usuarioId: entrega.usuario?.id
  }));
}

async function listarEntregasDetalladasPorNombre(nombre, opts = {}) {
  const ecopunto = await Ecopunto.findOne({ 
    where: { 
      nombre: { [Op.iLike]: nombre } 
    } 
  });
  if (!ecopunto) return { entregas: [], ecopunto: null };
  const entregas = await listarEntregasDetalladasPorEcopuntoId(ecopunto.id, opts);
  return { entregas, ecopunto };
}


module.exports = {
  async crearEcopunto(data) {
    const ecopuntoData = {
      nombre: data.nombre,
      direccion: data.direccion,
      descripcion: data.descripcion || '',
      horarioApertura: data.horarioApertura || '08:00',
      horarioCierre: data.horarioCierre || '20:00',
      capacidadMaxima: data.capacidadMaxima || 1000,
      activo: data.activo !== undefined ? data.activo : true,
      encargadoId: data.encargado || null
    };
    
    return await Ecopunto.create(ecopuntoData);
  },
  async obtenerPorId(id) {
    return await Ecopunto.findByPk(id);
  },
  async obtenerPorNombre(nombre) {
    return await Ecopunto.findOne({ 
      where: { 
        nombre: { [Op.iLike]: nombre } 
      } 
    });
  },
  async listarEcopuntosConDetalle() {
    return await Ecopunto.findAll({
      include: [
        {
          model: Usuario,
          as: 'encargado',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: Usuario,
          as: 'vecinos',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ]
    });
  },
  async buscarPorEncargado(encargadoId) {
    return await Ecopunto.findOne({ 
      where: { encargadoId: encargadoId } 
    });
  },
  async actualizarEncargado(ecopuntoId, encargadoId) {
    const ecopunto = await Ecopunto.findByPk(ecopuntoId);
    if (!ecopunto) return null;
    
    await ecopunto.update({ encargadoId: encargadoId });
    return ecopunto;
  },
  async actualizarEcopunto(ecopuntoId, datos) {
    const ecopunto = await Ecopunto.findByPk(ecopuntoId);
    if (!ecopunto) return null;
    
    const updateData = { ...datos };
    
    // Asegurar que los campos opcionales tengan valores por defecto si no se proporcionan
    if (updateData.horarioApertura === undefined) updateData.horarioApertura = '08:00';
    if (updateData.horarioCierre === undefined) updateData.horarioCierre = '20:00';
    if (updateData.capacidadMaxima === undefined) updateData.capacidadMaxima = 1000;
    if (updateData.activo === undefined) updateData.activo = true;
    if (updateData.descripcion === undefined) updateData.descripcion = '';
    
    await ecopunto.update(updateData);
    return ecopunto;
  },
  async eliminarEcopunto(ecopuntoId) {
    const ecopunto = await Ecopunto.findByPk(ecopuntoId);
    if (!ecopunto) return null;
    
    await ecopunto.destroy();
    return ecopunto;
  },

  calcularTotalKgPorEcopuntoId,
  calcularTotalKgPorNombre,
  calcularTotalKgMensualPorEcopuntoId,
  calcularTotalKgMensualPorNombre,
  contarVecinosPorEcopuntoId,
  contarVecinosPorNombre,
  listarEntregasDetalladasPorEcopuntoId,
  listarEntregasDetalladasPorNombre,

  // === Metas mensuales ===
  async upsertMetaMensual({ ecopuntoId, year, month, objetivoKg }) {
    const [meta, created] = await EcopuntoMeta.findOrCreate({
      where: { ecopuntoId, year, month },
      defaults: {
        objetivoKg,
        creadoEn: new Date(),
        actualizadoEn: new Date()
      }
    });
    
    if (!created) {
      await meta.update({ 
        objetivoKg, 
        actualizadoEn: new Date() 
      });
    }
    
    return meta;
  },
  async obtenerMetaMensual({ ecopuntoId, year, month }) {
    return await EcopuntoMeta.findOne({ 
      where: { ecopuntoId, year, month } 
    });
  },
  async eliminarMetaMensual({ ecopuntoId, year, month }) {
    const meta = await EcopuntoMeta.findOne({ 
      where: { ecopuntoId, year, month } 
    });
    
    if (meta) {
      await meta.destroy();
      return meta;
    }
    
    return null;
  }

};