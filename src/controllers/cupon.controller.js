const cuponRepo = require('../repositories/cupon.repository');

const crearCupon = async (req, res) => {
  try {
    console.log('[CONTROLLER] POST /cupones - Creando cupón:', req.body);
    const cupon = await cuponRepo.crearCupon(req.body);
    console.log('[CONTROLLER] Cupón creado:', cupon._id);
    res.status(201).json(cupon);
  } catch (err) {
    console.error('[CONTROLLER] Error al crear cupón:', err);
    res.status(400).json({ error: err.message });
  }
};

const listarCupones = async (req, res) => {
  try {
    console.log('[CONTROLLER] GET /cupones - Listando cupones');
    const cupones = await cuponRepo.listarCupones();
    console.log('[CONTROLLER] Cupones encontrados:', cupones.length);
    res.json(cupones);
  } catch (err) {
    console.error('[CONTROLLER] Error al listar cupones:', err);
    res.status(500).json({ error: err.message });
  }
};

const obtenerCuponPorId = async (req, res) => {
  try {
    console.log('[CONTROLLER] GET /cupones/:id - Obteniendo cupón:', req.params.id);
    const cupon = await cuponRepo.obtenerCuponPorId(req.params.id);
    if (!cupon) {
      console.log('[CONTROLLER] Cupón no encontrado');
      return res.status(404).json({ error: 'Cupón no encontrado' });
    }
    console.log('[CONTROLLER] Cupón encontrado:', cupon._id);
    res.json(cupon);
  } catch (err) {
    console.error('[CONTROLLER] Error al obtener cupón:', err);
    res.status(500).json({ error: err.message });
  }
};

const actualizarCupon = async (req, res) => {
  try {
    console.log('[CONTROLLER] PUT /cupones/:id - Actualizando cupón:', req.params.id);
    const cupon = await cuponRepo.actualizarCupon(req.params.id, req.body);
    if (!cupon) {
      console.log('[CONTROLLER] Cupón no encontrado para actualizar');
      return res.status(404).json({ error: 'Cupón no encontrado' });
    }
    console.log('[CONTROLLER] Cupón actualizado:', cupon._id);
    res.json(cupon);
  } catch (err) {
    console.error('[CONTROLLER] Error al actualizar cupón:', err);
    res.status(400).json({ error: err.message });
  }
};

const eliminarCupon = async (req, res) => {
  try {
    console.log('[CONTROLLER] DELETE /cupones/:id - Eliminando cupón:', req.params.id);
    const cupon = await cuponRepo.eliminarCupon(req.params.id);
    if (!cupon) {
      console.log('[CONTROLLER] Cupón no encontrado para eliminar');
      return res.status(404).json({ error: 'Cupón no encontrado' });
    }
    console.log('[CONTROLLER] Cupón eliminado:', req.params.id);
    res.json({ mensaje: 'Cupón eliminado correctamente' });
  } catch (err) {
    console.error('[CONTROLLER] Error al eliminar cupón:', err);
    res.status(400).json({ error: err.message });
  }
};

const activarCupon = async (req, res) => {
  try {
    console.log('[CONTROLLER] PUT /cupones/:id/activar - Activando cupón:', req.params.id);
    const cupon = await cuponRepo.actualizarCupon(req.params.id, { activo: true });
    if (!cupon) {
      console.log('[CONTROLLER] Cupón no encontrado para activar');
      return res.status(404).json({ error: 'Cupón no encontrado' });
    }
    console.log('[CONTROLLER] Cupón activado:', cupon._id);
    res.json(cupon);
  } catch (err) {
    console.error('[CONTROLLER] Error al activar cupón:', err);
    res.status(400).json({ error: err.message });
  }
};

const desactivarCupon = async (req, res) => {
  try {
    console.log('[CONTROLLER] PUT /cupones/:id/desactivar - Desactivando cupón:', req.params.id);
    const cupon = await cuponRepo.actualizarCupon(req.params.id, { activo: false });
    if (!cupon) {
      console.log('[CONTROLLER] Cupón no encontrado para desactivar');
      return res.status(404).json({ error: 'Cupón no encontrado' });
    }
    console.log('[CONTROLLER] Cupón desactivado:', cupon._id);
    res.json(cupon);
  } catch (err) {
    console.error('[CONTROLLER] Error al desactivar cupón:', err);
    res.status(400).json({ error: err.message });
  }
};

const listarCuponesActivos = async (req, res) => {
  try {
    console.log('[CONTROLLER] GET /cupones/activos - Listando cupones activos');
    const cupones = await cuponRepo.listarCuponesActivos();
    console.log('[CONTROLLER] Cupones activos encontrados:', cupones.length);
    res.json(cupones);
  } catch (err) {
    console.error('[CONTROLLER] Error al listar cupones activos:', err);
    res.status(500).json({ error: err.message });
  }
};

const buscarCupones = async (req, res) => {
  try {
    const { nombre } = req.query;
    console.log('[CONTROLLER] GET /cupones/buscar - Buscando cupones con nombre:', nombre);
    const cupones = await cuponRepo.buscarCuponesPorNombre(nombre);
    console.log('[CONTROLLER] Cupones encontrados en búsqueda:', cupones.length);
    res.json(cupones);
  } catch (err) {
    console.error('[CONTROLLER] Error al buscar cupones:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { 
  crearCupon, 
  listarCupones, 
  obtenerCuponPorId,
  actualizarCupon, 
  eliminarCupon,
  activarCupon,
  desactivarCupon,
  listarCuponesActivos,
  buscarCupones
}; 