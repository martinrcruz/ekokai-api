const getCuponModel = require('../models/cupon.model');

const crearCupon = async (data) => {
  const Cupon = await getCuponModel();
  return await Cupon.create(data);
};

const listarCupones = async () => {
  const Cupon = await getCuponModel();
  return await Cupon.find().sort({ fechaCreacion: -1 });
};

const obtenerCuponPorId = async (id) => {
  const Cupon = await getCuponModel();
  return await Cupon.findById(id);
};

const actualizarCupon = async (id, data) => {
  const Cupon = await getCuponModel();
  return await Cupon.findByIdAndUpdate(id, data, { new: true });
};

const eliminarCupon = async (id) => {
  const Cupon = await getCuponModel();
  return await Cupon.findByIdAndDelete(id);
};

const listarCuponesActivos = async () => {
  const Cupon = await getCuponModel();
  return await Cupon.find({ activo: true }).sort({ fechaCreacion: -1 });
};

const buscarCuponesPorNombre = async (nombre) => {
  const Cupon = await getCuponModel();
  const regex = new RegExp(nombre, 'i'); // Búsqueda case-insensitive
  return await Cupon.find({ 
    nombre: regex,
    activo: true 
  }).sort({ fechaCreacion: -1 });
};

module.exports = { 
  crearCupon, 
  listarCupones, 
  obtenerCuponPorId,
  actualizarCupon, 
  eliminarCupon,
  listarCuponesActivos,
  buscarCuponesPorNombre
};
