const Premio = require('../models/premio.model');

const crearPremio = async (data) => await Premio.create(data);
const listarPremios = async () => await Premio.findAll();
const actualizarPremio = async (id, data) => {
  const premio = await Premio.findByPk(id);
  if (!premio) return null;
  
  await premio.update(data);
  return premio;
};
const eliminarPremio = async (id) => {
  const premio = await Premio.findByPk(id);
  if (!premio) return null;
  
  await premio.destroy();
  return premio;
};

// Nuevos métodos para el catálogo
const listarPremiosActivos = async () => await Premio.findAll({
  where: { activo: true },
  order: [['orden', 'ASC'], ['nombre', 'ASC']]
});
const listarPremiosPorCategoria = async (categoria) => await Premio.findAll({
  where: { activo: true, categoria },
  order: [['orden', 'ASC'], ['nombre', 'ASC']]
});
const listarPremiosDestacados = async () => await Premio.findAll({
  where: { activo: true, destacado: true },
  order: [['orden', 'ASC'], ['nombre', 'ASC']]
});
const buscarPremios = async (searchTerm) => {
  const { Op } = require('sequelize');
  return await Premio.findAll({
    where: {
      activo: true,
      [Op.or]: [
        { nombre: { [Op.iLike]: `%${searchTerm}%` } },
        { descripcion: { [Op.iLike]: `%${searchTerm}%` } },
        { categoria: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    },
    order: [['orden', 'ASC'], ['nombre', 'ASC']]
  });
};
const obtenerPremioPorId = async (id) => await Premio.findByPk(id);

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