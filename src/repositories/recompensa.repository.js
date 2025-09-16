const Recompensa = require('../models/recompensa.model');

/**
 * Obtener todas las recompensas disponibles
 */
const obtenerDisponibles = async () => {
  return await Recompensa.findAll({
    where: {
      activo: true
    },
    order: [['createdAt', 'DESC']]
  });
};

/**
 * Buscar recompensa por código
 */
const buscarPorCodigo = async (codigo) => {
  return await Recompensa.findOne({
    where: { codigo }
  });
};

/**
 * Crear nueva recompensa
 */
const crear = async (data) => {
  return await Recompensa.create(data);
};

/**
 * Actualizar recompensa
 */
const actualizar = async (id, data) => {
  const [updatedRowsCount] = await Recompensa.update(data, {
    where: { id }
  });
  
  if (updatedRowsCount === 0) {
    throw new Error('Recompensa no encontrada');
  }
  
  return await Recompensa.findByPk(id);
};

/**
 * Eliminar recompensa
 */
const eliminar = async (id) => {
  const deletedRowsCount = await Recompensa.destroy({
    where: { id }
  });
  
  if (deletedRowsCount === 0) {
    throw new Error('Recompensa no encontrada');
  }
  
  return true;
};

/**
 * Buscar recompensa por ID
 */
const buscarPorId = async (id) => {
  return await Recompensa.findByPk(id);
};

module.exports = {
  obtenerDisponibles,
  buscarPorCodigo,
  crear,
  actualizar,
  eliminar,
  buscarPorId
};
