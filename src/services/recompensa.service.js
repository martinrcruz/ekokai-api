const recompensaRepo = require('../repositories/recompensa.repository');

/**
 * Obtener todas las recompensas disponibles
 */
const obtenerRecompensasDisponibles = async () => {
  return await recompensaRepo.obtenerDisponibles();
};

/**
 * Validar código de recompensa
 */
const validarCodigo = async (codigo) => {
  const recompensa = await recompensaRepo.buscarPorCodigo(codigo);
  
  if (!recompensa) {
    return {
      valido: false,
      mensaje: 'Código de recompensa no encontrado'
    };
  }
  
  if (!recompensa.activo) {
    return {
      valido: false,
      mensaje: 'Código de recompensa inactivo'
    };
  }
  
  // Verificar fecha de expiración si existe
  if (recompensa.fechaExpiracion && new Date() > new Date(recompensa.fechaExpiracion)) {
    return {
      valido: false,
      mensaje: 'Código de recompensa expirado'
    };
  }
  
  return {
    valido: true,
    recompensa: recompensa
  };
};

/**
 * Crear nueva recompensa
 */
const crearRecompensa = async (data) => {
  return await recompensaRepo.crear(data);
};

/**
 * Actualizar recompensa
 */
const actualizarRecompensa = async (id, data) => {
  return await recompensaRepo.actualizar(id, data);
};

/**
 * Eliminar recompensa
 */
const eliminarRecompensa = async (id) => {
  return await recompensaRepo.eliminar(id);
};

module.exports = {
  obtenerRecompensasDisponibles,
  validarCodigo,
  crearRecompensa,
  actualizarRecompensa,
  eliminarRecompensa
};
