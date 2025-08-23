const Canje = require('../models/canje.model');

const crearCanje = async (data) => {
  return await Canje.create(data);
};

const listarCanjesPorUsuario = async (usuarioId) => {
  return await Canje.find({ usuarioId: usuarioId })
    .populate('cuponId')
    .sort({ fechaCanje: -1 });
};

module.exports = { crearCanje, listarCanjesPorUsuario }; 