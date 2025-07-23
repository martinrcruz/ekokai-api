const getCuponModel = require('../models/cupon.model');

const crearCupon = async (data) => {
  const Cupon = await getCuponModel();
  return await Cupon.create(data);
};

const listarCupones = async () => {
  const Cupon = await getCuponModel();
  return await Cupon.find();
};

const actualizarCupon = async (id, data) => {
  const Cupon = await getCuponModel();
  return await Cupon.findByIdAndUpdate(id, data, { new: true });
};

const eliminarCupon = async (id) => {
  const Cupon = await getCuponModel();
  return await Cupon.findByIdAndDelete(id);
};

module.exports = { crearCupon, listarCupones, actualizarCupon, eliminarCupon };
