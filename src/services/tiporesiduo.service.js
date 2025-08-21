const tipoRepo = require('../repositories/tiporesiduo.repository');

const crearTipoResiduo = async (data) => {
  console.log('🟡 [SERVICE] → Iniciando creación de tipo de residuo');
  const existente = await tipoRepo.buscarPorNombre(data.nombre);
  if (existente) throw new Error('El tipo de residuo ya existe');
  return await tipoRepo.crear(data);
};

const obtenerTodos = async () => {
  console.log('🟡 [SERVICE] → Obteniendo todos los tipos de residuo');
  const tipos = await tipoRepo.listar();
  console.log(`✅ [SERVICE] Tipos de residuo obtenidos: ${tipos.length}`);
  return tipos;
};

const obtenerPorId = async (id) => {
  return await tipoRepo.buscarPorId(id);
};

const eliminarTipoResiduo = async (id) => {
  console.log('🟡 [SERVICE] → Eliminando tipo de residuo:', id);
  
  // Verificar que existe antes de eliminar
  const tipoExistente = await tipoRepo.buscarPorId(id);
  if (!tipoExistente) {
    throw new Error('Tipo de residuo no encontrado');
  }
  
  const eliminado = await tipoRepo.eliminar(id);
  console.log('✅ [SERVICE] Tipo de residuo eliminado:', id);
  return eliminado;
};

const actualizarTipoResiduo = async (id, data) => {
  console.log('🟡 [SERVICE] → Actualizando tipo de residuo:', id);
  console.log('📋 [SERVICE] Datos de actualización:', data);
  
  // Verificar que existe antes de actualizar
  const tipoExistente = await tipoRepo.buscarPorId(id);
  if (!tipoExistente) {
    throw new Error('Tipo de residuo no encontrado');
  }
  
  // Verificar que el nombre no esté duplicado (si se está cambiando)
  if (data.nombre && data.nombre !== tipoExistente.nombre) {
    const existenteConMismoNombre = await tipoRepo.buscarPorNombre(data.nombre);
    if (existenteConMismoNombre) {
      throw new Error('Ya existe un tipo de residuo con ese nombre');
    }
  }
  
  const actualizado = await tipoRepo.actualizar(id, data);
  console.log('✅ [SERVICE] Tipo de residuo actualizado:', id);
  return actualizado;
};

module.exports = {
  crearTipoResiduo,
  obtenerTodos,
  obtenerPorId,
  eliminarTipoResiduo,
  actualizarTipoResiduo
};
