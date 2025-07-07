const Ecopunto = require('../models/ecopunto.model');

const crearEcopunto = async (datos) => {
  console.log('🛠️ [REPO] → Guardando nuevo ecopunto:', datos.nombre);
  const creado = await Ecopunto.create(datos);
  console.log('✅ [REPO] → Ecopunto creado con ID:', creado._id);
  return creado;
};

const actualizarEncargado = async (ecopuntoId, encargadoId) => {
  console.log(`🔄 [REPO] → Actualizando encargado del ecopunto ${ecopuntoId} con encargado ${encargadoId}`);
  const actualizado = await Ecopunto.findByIdAndUpdate(
    ecopuntoId,
    { encargado: encargadoId },
    { new: true }
  );
  console.log('✅ [REPO] → Encargado asignado correctamente');
  return actualizado;
};


const buscarPorEncargado = async (encargadoId) => {
    console.log(`🔍 [REPO] Buscando ecopunto con encargado ${encargadoId}`);
    return await Ecopunto.findOne({ encargado: encargadoId });
  };
  
  const listarEcopuntosConDetalle = async () => {
    return await Ecopunto.find()
      .populate('encargado', 'nombre email')
      .populate({
        path: 'vecinos',
        select: 'nombre email dni',
      });
  };
  

module.exports = {
  crearEcopunto,
  actualizarEncargado,
  buscarPorEncargado,
  listarEcopuntosConDetalle
};
