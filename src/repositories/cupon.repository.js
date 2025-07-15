const Cupon = require('../models/cupon.model');

const crearCupon = async (data) => await Cupon.create(data);
const listarCupones = async () => await Cupon.find();
const actualizarCupon = async (id, data) => await Cupon.findByIdAndUpdate(id, data, { new: true });
const eliminarCupon = async (id) => await Cupon.findByIdAndDelete(id);

module.exports = { crearCupon, listarCupones, actualizarCupon, eliminarCupon };
