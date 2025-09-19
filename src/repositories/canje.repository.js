const Canje = require('../models/canje.model');
const CanjeRecompensa = require('../models/canjeRecompensa.model');

const crearCanje = async (data) => {
  return await Canje.create(data);
};

const listarCanjesPorUsuario = async (usuarioId) => {
  return await Canje.findAll({
    where: { usuarioId: usuarioId },
    order: [['fechaCanje', 'DESC']]
  });
};

/**
 * Crear canje de recompensa
 */
const crearCanjeRecompensa = async (data) => {
  console.log('🔍 [CANJE-REPO-DEBUG] Datos recibidos para crear canje:', data);
  
  try {
    const resultado = await CanjeRecompensa.create(data);
    console.log('🔍 [CANJE-REPO-DEBUG] Canje creado exitosamente:', resultado);
    return resultado;
  } catch (error) {
    console.error('❌ [CANJE-REPO-DEBUG] Error al crear canje en repositorio:', error);
    console.error('❌ [CANJE-REPO-DEBUG] Detalles del error:', {
      name: error.name,
      message: error.message,
      errors: error.errors
    });
    throw error;
  }
};

/**
 * Listar canjes de recompensas por usuario
 */
const listarCanjesRecompensaPorUsuario = async (usuarioId) => {
  return await CanjeRecompensa.findAll({
    where: { usuarioId },
    include: [
      {
        model: require('../models/recompensa.model'),
        as: 'recompensa'
      }
    ],
    order: [['fecha', 'DESC']]
  });
};

/**
 * Buscar canje de recompensa por ID
 */
const buscarCanjeRecompensaPorId = async (id) => {
  return await CanjeRecompensa.findByPk(id, {
    include: [
      {
        model: require('../models/recompensa.model'),
        as: 'recompensa'
      },
      {
        model: require('../models/usuario.model'),
        as: 'usuario'
      }
    ]
  });
};

module.exports = { 
  crearCanje, 
  listarCanjesPorUsuario,
  crearCanjeRecompensa,
  listarCanjesRecompensaPorUsuario,
  buscarCanjeRecompensaPorId
}; 