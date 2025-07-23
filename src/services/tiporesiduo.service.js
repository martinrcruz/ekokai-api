const tipoRepo = require('../repositories/tiporesiduo.repository');

const crearTipoResiduo = async (data) => {
  console.log('🟡 [SERVICE] → Iniciando creación de tipo de residuo');
  const existente = await tipoRepo.buscarPorNombre(data.nombre);
  if (existente) throw new Error('El tipo de residuo ya existe');
  return await tipoRepo.crear(data);
};

const obtenerTodos = async () => {
  return await tipoRepo.listar();
};

const eliminarTipoResiduo = async (id) => {
  return await tipoRepo.eliminar(id);
};

const actualizarTipoResiduo = async (id, data) => {
  return await tipoRepo.actualizar(id, data);
};

module.exports = {
  crearTipoResiduo,
  obtenerTodos,
  eliminarTipoResiduo,
  actualizarTipoResiduo
};
