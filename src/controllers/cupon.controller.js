const cuponRepo = require('../repositories/cupon.repository');

const crearCupon = async (req, res) => {
  try {
    const cupon = await cuponRepo.crearCupon(req.body);
    res.status(201).json(cupon);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const listarCupones = async (req, res) => {
  try {
    const cupones = await cuponRepo.listarCupones();
    res.json(cupones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const actualizarCupon = async (req, res) => {
  try {
    const cupon = await cuponRepo.actualizarCupon(req.params.id, req.body);
    if (!cupon) return res.status(404).json({ error: 'Cupón no encontrado' });
    res.json(cupon);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const eliminarCupon = async (req, res) => {
  try {
    const cupon = await cuponRepo.eliminarCupon(req.params.id);
    if (!cupon) return res.status(404).json({ error: 'Cupón no encontrado' });
    res.json({ mensaje: 'Cupón eliminado correctamente' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { crearCupon, listarCupones, actualizarCupon, eliminarCupon }; 