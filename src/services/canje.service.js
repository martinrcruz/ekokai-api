const canjeRepo = require('../repositories/canje.repository');

const registrarCanje = async (data) => {
  return await canjeRepo.crearCanje(data);
};

const obtenerHistorialCanjes = async (usuarioId) => {
  return await canjeRepo.listarCanjesPorUsuario(usuarioId);
};

module.exports = { registrarCanje, obtenerHistorialCanjes }; 