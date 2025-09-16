const Cupon = require('../models/cupon.model');
const Canje = require('../models/canje.model');

const crearCupon = async (data) => {
  return await Cupon.create(data);
};

const listarCupones = async () => {
  return await Cupon.findAll({
    order: [['createdAt', 'DESC']]
  });
};

const obtenerCuponPorId = async (id) => {
  return await Cupon.findByPk(id);
};

const actualizarCupon = async (id, data) => {
  const cupon = await Cupon.findByPk(id);
  if (!cupon) return null;
  
  await cupon.update(data);
  return cupon;
};

const eliminarCupon = async (id) => {
  const cupon = await Cupon.findByPk(id);
  if (!cupon) return null;
  
  await cupon.destroy();
  return cupon;
};

const listarCuponesActivos = async () => {
  return await Cupon.findAll({
    where: { activo: true },
    order: [['createdAt', 'DESC']]
  });
};

const buscarCuponesPorNombre = async (nombre) => {
  const { Op } = require('sequelize');
  return await Cupon.findAll({ 
    where: {
      nombre: { [Op.iLike]: `%${nombre}%` },
      activo: true 
    },
    order: [['createdAt', 'DESC']]
  });
};

// Nuevas funcionalidades
const generarCuponesMasivos = async (data, cantidad) => {
  const cupones = [];
  
  for (let i = 0; i < cantidad; i++) {
    const cuponData = { ...data, cantidadDisponible: 1 };
    const cupon = await Cupon.create(cuponData);
    cupones.push(cupon);
  }
  
  return cupones;
};

const asociarUsuario = async (cuponId, usuarioId) => {
  const cupon = await Cupon.findByPk(cuponId);
  if (!cupon) {
    throw new Error('Cupón no encontrado');
  }
  
  await cupon.update({ usuarioId });
  return cupon;
};

const desasociarUsuario = async (cuponId, usuarioId) => {
  const cupon = await Cupon.findByPk(cuponId);
  if (!cupon) {
    throw new Error('Cupón no encontrado');
  }
  
  await cupon.update({ usuarioId: null });
  return cupon;
};

const asociarComercio = async (cuponId, comercioId) => {
  const cupon = await Cupon.findByPk(cuponId);
  if (!cupon) {
    throw new Error('Cupón no encontrado');
  }
  
  await cupon.update({ comercioId });
  return cupon;
};

const desasociarComercio = async (cuponId, comercioId) => {
  const cupon = await Cupon.findByPk(cuponId);
  if (!cupon) {
    throw new Error('Cupón no encontrado');
  }
  
  await cupon.update({ comercioId: null });
  return cupon;
};

const canjearCupon = async (cuponId, usuarioId, comercioId, tokensGastados) => {
  const cupon = await Cupon.findByPk(cuponId);
  if (!cupon) {
    throw new Error('Cupón no encontrado');
  }
  
  // TODO: Implementar lógica de uso de cupón con Sequelize
  // Por ahora solo crear el registro de canje
  const canje = await Canje.create({
    cuponId,
    usuarioId,
    comercioId,
    tokensGastados,
    estado: cupon.requiereAprobacion ? 'pendiente' : 'aprobado'
  });
  
  return { cupon, canje };
};

const listarCanjes = async (filtros = {}) => {
  let whereClause = {};
  
  if (filtros.cuponId) whereClause.cuponId = filtros.cuponId;
  if (filtros.usuarioId) whereClause.usuarioId = filtros.usuarioId;
  if (filtros.comercioId) whereClause.comercioId = filtros.comercioId;
  if (filtros.estado) whereClause.estado = filtros.estado;
  
  return await Canje.findAll({
    where: whereClause,
    order: [['fechaCanje', 'DESC']]
  });
};

const aprobarCanje = async (canjeId, aprobadoPor, observaciones = '') => {
  const canje = await Canje.findByPk(canjeId);
  if (!canje) return null;
  
  await canje.update({
    estado: 'aprobado',
    aprobadoPor,
    fechaAprobacion: new Date(),
    observaciones
  });
  
  return canje;
};

const rechazarCanje = async (canjeId, aprobadoPor, observaciones = '') => {
  const canje = await Canje.findByPk(canjeId);
  if (!canje) return null;
  
  await canje.update({
    estado: 'rechazado',
    aprobadoPor,
    fechaAprobacion: new Date(),
    observaciones
  });
  
  return canje;
};

const obtenerEstadisticasCupones = async () => {
  const totalCupones = await Cupon.count();
  const cuponesActivos = await Cupon.count({ where: { activo: true } });
  const totalCanjes = await Canje.count();
  const canjesPendientes = await Canje.count({ where: { estado: 'pendiente' } });
  
  return {
    totalCupones,
    cuponesActivos,
    totalCanjes,
    canjesPendientes
  };
};

const listarCanjesPorUsuario = async (usuarioId) => {
  return await Canje.findAll({
    where: { usuarioId: usuarioId },
    order: [['fechaCanje', 'DESC']]
  });
};

/**
 * Obtener cupones disponibles de un usuario
 */
const obtenerCuponesDisponibles = async (usuarioId) => {
  return await Cupon.findAll({
    where: {
      usuarioId: usuarioId,
      activo: true,
      usado: false
    },
    order: [['createdAt', 'ASC']]
  });
};

/**
 * Marcar cupón como usado
 */
const marcarComoUsado = async (cuponId) => {
  const [updatedRowsCount] = await Cupon.update({
    usado: true,
    fechaUso: new Date()
  }, {
    where: { id: cuponId }
  });
  
  if (updatedRowsCount === 0) {
    throw new Error('Cupón no encontrado');
  }
  
  return await Cupon.findByPk(cuponId);
};

/**
 * Buscar cupones por usuario
 */
const buscarCuponesPorUsuario = async (usuarioId) => {
  return await Cupon.findAll({
    where: { usuarioId },
    order: [['createdAt', 'DESC']]
  });
};

module.exports = { 
  crearCupon, 
  listarCupones, 
  obtenerCuponPorId,
  actualizarCupon, 
  eliminarCupon,
  listarCuponesActivos,
  buscarCuponesPorNombre,
  generarCuponesMasivos,
  asociarUsuario,
  desasociarUsuario,
  asociarComercio,
  desasociarComercio,
  canjearCupon,
  listarCanjes,
  listarCanjesPorUsuario,
  aprobarCanje,
  rechazarCanje,
  obtenerEstadisticasCupones,
  obtenerCuponesDisponibles,
  marcarComoUsado,
  buscarCuponesPorUsuario
};
