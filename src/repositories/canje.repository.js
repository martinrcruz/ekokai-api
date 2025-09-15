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
  return await CanjeRecompensa.create(data);
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