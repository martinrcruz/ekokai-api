const Premio = require('../models/premio.model');

const crearPremio = async (data) => await Premio.create(data);
const listarPremios = async () => await Premio.find();
const actualizarPremio = async (id, data) => await Premio.findByIdAndUpdate(id, data, { new: true });
const eliminarPremio = async (id) => await Premio.findByIdAndDelete(id);

// Nuevos métodos para el catálogo
const listarPremiosActivos = async () => await Premio.find({ activo: true }).sort({ orden: 1, nombre: 1 });
const listarPremiosPorCategoria = async (categoria) => await Premio.find({ activo: true, categoria }).sort({ orden: 1, nombre: 1 });
const listarPremiosDestacados = async () => await Premio.find({ activo: true, destacado: true }).sort({ orden: 1, nombre: 1 });
const buscarPremios = async (searchTerm) => {
  const regex = new RegExp(searchTerm, 'i');
  return await Premio.find({
    activo: true,
    $or: [
      { nombre: regex },
      { descripcion: regex },
      { categoria: regex }
    ]
  }).sort({ orden: 1, nombre: 1 });
};
const obtenerPremioPorId = async (id) => await Premio.findById(id);

module.exports = { 
  crearPremio, 
  listarPremios, 
  actualizarPremio, 
  eliminarPremio,
  listarPremiosActivos,
  listarPremiosPorCategoria,
  listarPremiosDestacados,
  buscarPremios,
  obtenerPremioPorId
};