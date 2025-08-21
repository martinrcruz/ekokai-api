const getCanjeModel = require('../models/canje.model');

const crearCanje = async (data) => {
  const Canje = await getCanjeModel();
  return await Canje.create(data);
};

const listarCanjesPorUsuario = async (usuarioId) => {
  const Canje = await getCanjeModel();
  return await Canje.find({ usuario: usuarioId })
    .populate('premio')
    .sort({ fecha: -1 });
};

module.exports = { crearCanje, listarCanjesPorUsuario }; 