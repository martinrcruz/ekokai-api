const premioRepo = require('../repositories/premio.repository');

const crearPremio = async (data) => await premioRepo.crearPremio(data);
const listarPremios = async () => await premioRepo.listarPremios();
const actualizarPremio = async (id, data) => await premioRepo.actualizarPremio(id, data);
const eliminarPremio = async (id) => await premioRepo.eliminarPremio(id);

module.exports = { crearPremio, listarPremios, actualizarPremio, eliminarPremio };
