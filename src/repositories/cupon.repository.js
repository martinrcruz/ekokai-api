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
  // En lugar de asociar el cupón directamente al usuario,
  // incrementamos el saldo de CuponMoneda del usuario
  const { CuponMoneda } = require('../models');
  
  let cuponMoneda = await CuponMoneda.findOne({
    where: { usuarioId }
  });
  
  if (!cuponMoneda) {
    // Crear CuponMoneda si no existe
    cuponMoneda = await CuponMoneda.create({
      usuarioId,
      cantidad: 0,
      activo: true
    });
  }
  
  // Incrementar la cantidad de cupones del usuario
  await cuponMoneda.increment('cantidad', { by: 1 });
  
  return cuponMoneda;
};

const desasociarUsuario = async (cuponId, usuarioId) => {
  // En lugar de desasociar el cupón directamente del usuario,
  // decrementamos el saldo de CuponMoneda del usuario
  const { CuponMoneda } = require('../models');
  
  const cuponMoneda = await CuponMoneda.findOne({
    where: { usuarioId }
  });
  
  if (!cuponMoneda || cuponMoneda.cantidad <= 0) {
    throw new Error('Usuario no tiene cupones disponibles');
  }
  
  // Decrementar la cantidad de cupones del usuario
  await cuponMoneda.decrement('cantidad', { by: 1 });
  
  return cuponMoneda;
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
 * Nota: Los cupones no tienen usuarioId directo, se relacionan a través de CuponMoneda
 */
const obtenerCuponesDisponibles = async (usuarioId) => {
  // Primero obtener el CuponMoneda del usuario
  const { CuponMoneda } = require('../models');
  const cuponMoneda = await CuponMoneda.findOne({
    where: { 
      usuarioId
      // Removido el filtro activo: true para ser consistente con buscarCuponesPorUsuario
    }
  });

  if (!cuponMoneda || cuponMoneda.cantidad <= 0) {
    return []; // Usuario no tiene cupones disponibles
  }

  // Por ahora, retornar información del CuponMoneda como si fuera un cupón
  // Esto es temporal hasta que se defina mejor la lógica de negocio
  return [{
    id: cuponMoneda.id,
    nombre: 'Cupones Disponibles',
    descripcion: `Tienes ${cuponMoneda.cantidad} cupones disponibles`,
    tokensRequeridos: 0,
    cantidadDisponible: cuponMoneda.cantidad,
    cantidadUtilizada: 0,
    activo: cuponMoneda.activo,
    tipo: 'moneda',
    createdAt: cuponMoneda.createdAt,
    updatedAt: cuponMoneda.updatedAt
  }];
};

/**
 * Marcar cupón como usado
 * Nota: Con el sistema de CuponMoneda, esto debería decrementar el saldo del usuario
 */
const marcarComoUsado = async (cuponId) => {
  // En el sistema normalizado, esto debería recibir el usuarioId
  // Por ahora, retornamos éxito para mantener compatibilidad
  console.log('⚠️ [WARNING] marcarComoUsado llamado con cuponId:', cuponId);
  console.log('⚠️ [WARNING] Esta función debería ser actualizada para usar usuarioId');
  
  return { id: cuponId, usado: true, fechaUso: new Date() };
};

/**
 * Decrementar cupones de un usuario (función normalizada)
 */
const decrementarCuponesUsuario = async (usuarioId, cantidad = 1) => {
  const { CuponMoneda } = require('../models');
  
  const cuponMoneda = await CuponMoneda.findOne({
    where: { usuarioId }
  });
  
  if (!cuponMoneda || cuponMoneda.cantidad < cantidad) {
    throw new Error('Cupones insuficientes');
  }
  
  await cuponMoneda.decrement('cantidad', { by: cantidad });
  
  return cuponMoneda;
};

/**
 * Buscar cupones por usuario
 * Nota: Los cupones no tienen usuarioId directo, se relacionan a través de CuponMoneda
 */
const buscarCuponesPorUsuario = async (usuarioId) => {
  // Primero obtener el CuponMoneda del usuario
  const { CuponMoneda } = require('../models');
  const cuponMoneda = await CuponMoneda.findOne({
    where: { usuarioId }
  });

  if (!cuponMoneda) {
    return []; // Usuario no tiene cupones
  }

  // Por ahora, retornar información del CuponMoneda como si fuera un cupón
  // Esto es temporal hasta que se defina mejor la lógica de negocio
  return [{
    id: cuponMoneda.id,
    nombre: 'Cupones Disponibles',
    descripcion: `Tienes ${cuponMoneda.cantidad} cupones disponibles`,
    tokensRequeridos: 0,
    cantidadDisponible: cuponMoneda.cantidad,
    cantidadUtilizada: 0,
    activo: cuponMoneda.activo,
    tipo: 'moneda',
    createdAt: cuponMoneda.createdAt,
    updatedAt: cuponMoneda.updatedAt
  }];
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
  decrementarCuponesUsuario,
  buscarCuponesPorUsuario
};
