const recompensaRepo = require('../repositories/recompensa.repository');
const premioRepo = require('../repositories/premio.repository');

/**
 * Obtener todas las recompensas disponibles (desde tabla premios)
 */
const obtenerRecompensasDisponibles = async () => {
  return await premioRepo.listarPremiosActivos();
};

/**
 * Validar código de recompensa (buscar por ID en tabla premios)
 */
const validarCodigo = async (codigo) => {
  // El código es en realidad el ID del premio (UUID)
  const premio = await premioRepo.obtenerPremioPorId(codigo);
  
  if (!premio) {
    return {
      valido: false,
      mensaje: 'Código de recompensa no encontrado'
    };
  }
  
  if (!premio.activo) {
    return {
      valido: false,
      mensaje: 'Código de recompensa inactivo'
    };
  }
  
  // Verificar stock disponible
  if (premio.stock !== null && premio.stock <= 0) {
    return {
      valido: false,
      mensaje: 'Recompensa agotada'
    };
  }
  
  return {
    valido: true,
    recompensa: {
      id: premio.id,
      codigo: premio.id, // El código es el ID
      nombre: premio.nombre,
      descripcion: premio.descripcion,
      cuponesRequeridos: premio.cuponesRequeridos,
      activo: premio.activo,
      stock: premio.stock,
      categoria: premio.categoria,
      imagen: premio.imagen
    }
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
