const TipoResiduo = require('../models/tiporesiduo.model');

const crear = async (data) => {
  console.log('🛠️ [REPO] → Creando tipo de residuo:', data.nombre);
  return await TipoResiduo.create(data);
};

const listar = async () => {
  console.log('📄 [REPO] → Listando tipos de residuos');
  return await TipoResiduo.find().sort({ nombre: 1 });
};

const eliminar = async (id) => {
  console.log(`🗑️ [REPO] → Eliminando tipo de residuo ID: ${id}`);
  return await TipoResiduo.findByIdAndDelete(id);
};

const buscarPorNombre = async (nombre) => {
  return await TipoResiduo.findOne({ nombre });
};

const buscarPorId = async (id) => {
    return await TipoResiduo.findById(id);
  };

const actualizar = async (id, data) => {
  return await TipoResiduo.findByIdAndUpdate(id, data, { new: true });
};
  
module.exports = {
  crear,
  listar,
  eliminar,
  buscarPorNombre,
  buscarPorId,
  actualizar
};
