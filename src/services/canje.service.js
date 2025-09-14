const canjeRepo = require('../repositories/canje.repository');
const cuponRepo = require('../repositories/cupon.repository');
const recompensaRepo = require('../repositories/recompensa.repository');

const registrarCanje = async (data) => {
  return await canjeRepo.crearCanje(data);
};

const obtenerHistorialCanjes = async (usuarioId) => {
  return await canjeRepo.listarCanjesPorUsuario(usuarioId);
};

/**
 * Registrar canje de recompensa
 */
const registrarCanjeRecompensa = async (data) => {
  const { usuarioId, codigoRecompensa, cupones } = data;
  
  // Validar que la recompensa existe y está activa
  const recompensa = await recompensaRepo.buscarPorCodigo(codigoRecompensa);
  if (!recompensa || !recompensa.activo) {
    throw new Error('Recompensa no válida o inactiva');
  }
  
  // Validar que el usuario tiene suficientes cupones
  const cuponesUsuario = await cuponRepo.obtenerCuponesDisponibles(usuarioId);
  if (cuponesUsuario.length < recompensa.cuponesRequeridos) {
    throw new Error('Cupones insuficientes');
  }
  
  // Marcar cupones como usados
  const cuponesAUsar = cuponesUsuario.slice(0, recompensa.cuponesRequeridos);
  for (const cupon of cuponesAUsar) {
    await cuponRepo.marcarComoUsado(cupon.id);
  }
  
  // Crear registro de canje
  const canjeData = {
    usuarioId,
    recompensaId: recompensa.id,
    codigoRecompensa,
    cuponesUsados: cuponesAUsar.map(c => c.id),
    estado: 'completado',
    fecha: new Date()
  };
  
  return await canjeRepo.crearCanjeRecompensa(canjeData);
};

/**
 * Obtener historial de canjes de recompensas
 */
const obtenerHistorialCanjesRecompensa = async (usuarioId) => {
  return await canjeRepo.listarCanjesRecompensaPorUsuario(usuarioId);
};

module.exports = { 
  registrarCanje, 
  obtenerHistorialCanjes,
  registrarCanjeRecompensa,
  obtenerHistorialCanjesRecompensa
}; 