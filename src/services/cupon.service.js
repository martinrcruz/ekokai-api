const cuponRepo = require('../repositories/cupon.repository');

const crearCupon = (data) => cuponRepo.crearCupon(data);
const listarCupones = () => cuponRepo.listarCupones();
const actualizarCupon = (id, data) => cuponRepo.actualizarCupon(id, data);
const eliminarCupon = (id) => cuponRepo.eliminarCupon(id);

module.exports = { crearCupon, listarCupones, actualizarCupon, eliminarCupon }; 