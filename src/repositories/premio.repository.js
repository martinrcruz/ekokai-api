const Premio = require('../models/premio.model');

const crearPremio = async (data) => await Premio.create(data);
const listarPremios = async () => await Premio.find();
const actualizarPremio = async (id, data) => await Premio.findByIdAndUpdate(id, data, { new: true });
const eliminarPremio = async (id) => await Premio.findByIdAndDelete(id);

module.exports = { crearPremio, listarPremios, actualizarPremio, eliminarPremio };