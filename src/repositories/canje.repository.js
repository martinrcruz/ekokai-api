const Canje = require('../models/canje.model');

const crearCanje = async (data) => await Canje.create(data);

const listarCanjesPorUsuario = async (usuarioId) => {
  return await Canje.find({ usuario: usuarioId })
    .populate('premio')
    .sort({ fecha: -1 });
};

module.exports = { crearCanje, listarCanjesPorUsuario }; 