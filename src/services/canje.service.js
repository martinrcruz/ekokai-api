const canjeRepo = require('../repositories/canje.repository');
const cuponRepo = require('../repositories/cupon.repository');
const recompensaRepo = require('../repositories/recompensa.repository');
const premioRepo = require('../repositories/premio.repository');

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
  console.log('🔍 [CANJE-DEBUG] Datos recibidos:', data);
  
  const { usuarioId, codigoRecompensa, cupones } = data;
  
  // Validar que la recompensa existe y está activa (buscar en tabla premios)
  console.log('🔍 [CANJE-DEBUG] Buscando premio con ID:', codigoRecompensa);
  const premio = await premioRepo.obtenerPremioPorId(codigoRecompensa);
  console.log('🔍 [CANJE-DEBUG] Premio encontrado:', premio ? { id: premio.id, nombre: premio.nombre, cuponesRequeridos: premio.cuponesRequeridos, activo: premio.activo } : 'No encontrado');
  
  if (!premio || !premio.activo) {
    throw new Error('Recompensa no válida o inactiva');
  }
  
  // Validar que el usuario tiene suficientes cupones
  console.log('🔍 [CANJE-DEBUG] Verificando cupones del usuario:', usuarioId);
  const cuponesUsuario = await cuponRepo.obtenerCuponesDisponibles(usuarioId);
  console.log('🔍 [CANJE-DEBUG] Cupones del usuario:', cuponesUsuario);
  const cuponesDisponibles = cuponesUsuario.length > 0 ? cuponesUsuario[0].cantidadDisponible : 0;
  console.log('🔍 [CANJE-DEBUG] Cupones disponibles:', cuponesDisponibles, 'Cupones requeridos:', premio.cuponesRequeridos);
  
  if (cuponesDisponibles < premio.cuponesRequeridos) {
    throw new Error('Cupones insuficientes');
  }
  
  // Decrementar cupones del usuario usando la función normalizada
  console.log('🔍 [CANJE-DEBUG] Decrementando cupones...');
  await cuponRepo.decrementarCuponesUsuario(usuarioId, premio.cuponesRequeridos);
  console.log('🔍 [CANJE-DEBUG] Cupones decrementados exitosamente');
  
  // Crear registro de canje
  const canjeData = {
    usuarioId,
    recompensaId: premio.id,
    codigoRecompensa,
    cuponesUsados: [premio.cuponesRequeridos], // Array JSON con la cantidad de cupones usados
    estado: 'completado',
    fecha: new Date()
  };
  
  console.log('🔍 [CANJE-DEBUG] Datos del canje a crear:', canjeData);
  
  try {
    const resultado = await canjeRepo.crearCanjeRecompensa(canjeData);
    console.log('🔍 [CANJE-DEBUG] Canje creado exitosamente:', resultado);
    return resultado;
  } catch (error) {
    console.error('❌ [CANJE-DEBUG] Error al crear canje:', error);
    throw error;
  }
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