const Cupon = require('../models/cupon.model');
const Canje = require('../models/canje.model');

const crearCupon = async (data) => {
  return await Cupon.create(data);
};

const listarCupones = async () => {
  return await Cupon.find()
    .populate('usuariosAsociados.usuarioId', 'nombre apellido email')
    .populate('comerciosAsociados.comercioId', 'nombre apellido email')
    .sort({ fechaCreacion: -1 });
};

const obtenerCuponPorId = async (id) => {
  return await Cupon.findById(id)
    .populate('usuariosAsociados.usuarioId', 'nombre apellido email')
    .populate('comerciosAsociados.comercioId', 'nombre apellido email')
    .populate('historialUso.usuarioId', 'nombre apellido email')
    .populate('historialUso.comercioId', 'nombre apellido email');
};

const actualizarCupon = async (id, data) => {
  return await Cupon.findByIdAndUpdate(id, data, { new: true });
};

const eliminarCupon = async (id) => {
  return await Cupon.findByIdAndDelete(id);
};

const listarCuponesActivos = async () => {
  return await Cupon.find({ activo: true })
    .populate('usuariosAsociados.usuarioId', 'nombre apellido email')
    .populate('comerciosAsociados.comercioId', 'nombre apellido email')
    .sort({ fechaCreacion: -1 });
};

const buscarCuponesPorNombre = async (nombre) => {
  const regex = new RegExp(nombre, 'i');
  return await Cupon.find({ 
    nombre: regex,
    activo: true 
  }).populate('usuariosAsociados.usuarioId', 'nombre apellido email')
    .populate('comerciosAsociados.comercioId', 'nombre apellido email')
    .sort({ fechaCreacion: -1 });
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
  return await Cupon.findByIdAndUpdate(
    cuponId,
    { 
      $addToSet: { 
        usuariosAsociados: { 
          usuarioId, 
          fechaAsociacion: new Date() 
        } 
      } 
    },
    { new: true }
  );
};

const desasociarUsuario = async (cuponId, usuarioId) => {
  return await Cupon.findByIdAndUpdate(
    cuponId,
    { 
      $pull: { 
        usuariosAsociados: { usuarioId } 
      } 
    },
    { new: true }
  );
};

const asociarComercio = async (cuponId, comercioId) => {
  return await Cupon.findByIdAndUpdate(
    cuponId,
    { 
      $addToSet: { 
        comerciosAsociados: { 
          comercioId, 
          fechaAsociacion: new Date() 
        } 
      } 
    },
    { new: true }
  );
};

const desasociarComercio = async (cuponId, comercioId) => {
  return await Cupon.findByIdAndUpdate(
    cuponId,
    { 
      $pull: { 
        comerciosAsociados: { comercioId } 
      } 
    },
    { new: true }
  );
};

const canjearCupon = async (cuponId, usuarioId, comercioId, tokensGastados) => {
  
  const cupon = await Cupon.findById(cuponId);
  if (!cupon) {
    throw new Error('Cupón no encontrado');
  }
  
  // Usar el cupón
  await cupon.usarCupon(usuarioId, comercioId, tokensGastados);
  
  // Crear registro de canje
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
  let query = {};
  
  if (filtros.cuponId) query.cuponId = filtros.cuponId;
  if (filtros.usuarioId) query.usuarioId = filtros.usuarioId;
  if (filtros.comercioId) query.comercioId = filtros.comercioId;
  if (filtros.estado) query.estado = filtros.estado;
  
  return await Canje.find(query)
    .populate('cuponId', 'nombre codigo')
    .populate('usuarioId', 'nombre apellido email')
    .populate('comercioId', 'nombre apellido email')
    .populate('aprobadoPor', 'nombre apellido')
    .sort({ fechaCanje: -1 });
};

const aprobarCanje = async (canjeId, aprobadoPor, observaciones = '') => {
  return await Canje.findByIdAndUpdate(
    canjeId,
    {
      estado: 'aprobado',
      aprobadoPor,
      fechaAprobacion: new Date(),
      observaciones
    },
    { new: true }
  );
};

const rechazarCanje = async (canjeId, aprobadoPor, observaciones = '') => {
  return await Canje.findByIdAndUpdate(
    canjeId,
    {
      estado: 'rechazado',
      aprobadoPor,
      fechaAprobacion: new Date(),
      observaciones
    },
    { new: true }
  );
};

const obtenerEstadisticasCupones = async () => {
  
  const totalCupones = await Cupon.countDocuments();
  const cuponesActivos = await Cupon.countDocuments({ activo: true });
  const totalCanjes = await Canje.countDocuments();
  const canjesPendientes = await Canje.countDocuments({ estado: 'pendiente' });
  
  return {
    totalCupones,
    cuponesActivos,
    totalCanjes,
    canjesPendientes
  };
};

const listarCanjesPorUsuario = async (usuarioId) => {
  return await Canje.find({ usuarioId: usuarioId })
    .populate('cuponId')
    .sort({ fechaCanje: -1 });
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
    order: [['fechaCreacion', 'ASC']]
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
    order: [['fechaCreacion', 'DESC']]
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
