const premioRepo = require('../repositories/premio.repository');

const crearPremio = async (data) => await premioRepo.crearPremio(data);
const listarPremios = async () => await premioRepo.listarPremios();
const actualizarPremio = async (id, data) => await premioRepo.actualizarPremio(id, data);
const eliminarPremio = async (id) => await premioRepo.eliminarPremio(id);

// Nuevos métodos para el catálogo
const listarPremiosActivos = async () => await premioRepo.listarPremiosActivos();
const listarPremiosPorCategoria = async (categoria) => await premioRepo.listarPremiosPorCategoria(categoria);
const listarPremiosDestacados = async () => await premioRepo.listarPremiosDestacados();
const buscarPremios = async (searchTerm) => await premioRepo.buscarPremios(searchTerm);
const obtenerPremioPorId = async (id) => await premioRepo.obtenerPremioPorId(id);

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
