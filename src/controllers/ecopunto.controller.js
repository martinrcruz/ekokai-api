const ecopuntoService = require('../services/ecopunto.service');
const ecopuntoRepo= require('../repositories/ecopunto.repository');
const crearEcopunto = async (req, res) => {
    console.log('🎯 [CONTROLLER] → POST /ecopuntos');
    try {
      const { nombre, direccion, descripcion, horarioApertura, horarioCierre, activo, encargadoId } = req.body;
      const nuevoEcopunto = await ecopuntoService.crearEcopunto({ 
        nombre, 
        direccion, 
        descripcion, 
        horarioApertura, 
        horarioCierre, 
        activo, 
        encargadoId 
      });
      return res.status(201).json(nuevoEcopunto);
    } catch (err) {
      console.error('❌ [CONTROLLER] Error al crear ecopunto:', err.message);
      return res.status(400).json({ error: err.message });
    }
  };

const enrolarEncargado = async (req, res) => {
  console.log('🎯 [CONTROLLER] → PATCH /ecopuntos/:id/enrolar');
  try {
    const { id } = req.params;
    const { encargadoId } = req.body;

    const actualizado = await ecopuntoService.asignarEncargado(id, encargadoId);
    res.json(actualizado);
  } catch (err) {
    console.error('❌ [CONTROLLER] Error al enrolar encargado:', err.message);
    res.status(500).json({ error: err.message });
  }
};
// controllers/ecopunto.controller.js
const listarEcopuntos = async (req, res) => {
    try {
      console.log('📋 [CONTROLLER] Listando ecopuntos con encargado y vecinos');
      const ecopuntos = await ecopuntoRepo.listarEcopuntosConDetalle();
      res.json(ecopuntos);
    } catch (err) {
      console.error('❌ Error al listar ecopuntos:', err);
      res.status(500).json({ error: 'Error al obtener ecopuntos' });
    }
  };

  // === TOTAL HISTÓRICO DE BASURA (KG) ===
// Usa service si existe; si no, cae al repository
const obtenerTotalKgPorEcopunto = async (req, res) => {
  console.log('🎯 [CONTROLLER] → GET /ecopunto/:id/total-kg');
  try {
    const { id } = req.params;

    // preferimos el service si está implementado
    const usarService = typeof ecopuntoService?.obtenerTotalKgPorEcopuntoId === 'function';
    const totalKg = usarService
      ? await ecopuntoService.obtenerTotalKgPorEcopuntoId(id)
      : await ecopuntoRepo.calcularTotalKgPorEcopuntoId(id);

    return res.status(200).json({
      success: true,
      ecopuntoId: id,
      totalKg,
      unidad: 'kg',
    });
  } catch (err) {
    console.error('❌ [CONTROLLER] Error totalKg por ecopunto:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const obtenerTotalKgPorNombre = async (req, res) => {
  console.log('🎯 [CONTROLLER] → GET /ecopunto/total-kg?nombre=XYZ');
  try {
    const { nombre } = req.query;
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'Debe indicar ?nombre= del ecopunto',
      });
    }

    // preferimos el service si está implementado
    const usarService = typeof ecopuntoService?.obtenerTotalKgPorNombre === 'function';
    const { totalKg, ecopunto } = usarService
      ? await ecopuntoService.obtenerTotalKgPorNombre(nombre)
      : await ecopuntoRepo.calcularTotalKgPorNombre(nombre);

    return res.status(200).json({
      success: true,
      ecopunto: ecopunto ? { id: ecopunto._id, nombre: ecopunto.nombre } : null,
      totalKg,
      unidad: 'kg',
    });
  } catch (err) {
    console.error('❌ [CONTROLLER] Error totalKg por nombre:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// === TOTAL DE VECINOS (usuarios con rol 'vecino') ===
const obtenerTotalVecinosPorEcopunto = async (req, res) => {
  console.log('🎯 [CONTROLLER] → GET /ecopunto/:id/total-vecinos');
  try {
    const { id } = req.params;
    const totalVecinos = await ecopuntoService.obtenerTotalVecinosPorEcopuntoId(id);
    return res.status(200).json({
      success: true,
      ecopuntoId: id,
      totalVecinos,
      unidad: 'personas',
    });
  } catch (err) {
    console.error('❌ [CONTROLLER] Error totalVecinos por ecopunto:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const obtenerTotalVecinosPorNombre = async (req, res) => {
  console.log('🎯 [CONTROLLER] → GET /ecopunto/total-vecinos?nombre=XYZ');
  try {
    const { nombre } = req.query;
    if (!nombre) {
      return res.status(400).json({ success: false, message: 'Debe indicar ?nombre= del ecopunto' });
    }

    const usarService = typeof ecopuntoService?.obtenerTotalVecinosPorNombre === 'function';
    const { totalVecinos, ecopunto } = usarService
      ? await ecopuntoService.obtenerTotalVecinosPorNombre(nombre)
      : await ecopuntoRepo.contarVecinosPorNombre(nombre);

    return res.status(200).json({
      success: true,
      ecopunto: ecopunto ? { id: ecopunto._id, nombre: ecopunto.nombre } : null,
      totalVecinos,
      unidad: 'personas',
    });
  } catch (err) {
    console.error('❌ [CONTROLLER] Error totalVecinos por nombre:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// === SERIE MENSUAL DE KG ===
const obtenerTotalKgMensualPorEcopunto = async (req, res) => {
  console.log('🎯 [CONTROLLER] → GET /ecopunto/:id/total-kg-mensual');
  try {
    const { id } = req.params;
    const series = await ecopuntoService.obtenerTotalKgMensualPorEcopuntoId(id);
    return res.status(200).json({ success: true, ecopuntoId: id, series });
  } catch (err) {
    console.error('❌ [CONTROLLER] Error totalKg mensual por ecopunto:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const obtenerTotalKgMensualPorNombre = async (req, res) => {
  console.log('🎯 [CONTROLLER] → GET /ecopunto/total-kg-mensual?nombre=XYZ');
  try {
    const { nombre } = req.query;
    if (!nombre) {
      return res.status(400).json({ success: false, message: 'Debe indicar ?nombre= del ecopunto' });
    }

    const usarService = typeof ecopuntoService?.obtenerTotalKgMensualPorNombre === 'function';
    const { series, ecopunto } = usarService
      ? await ecopuntoService.obtenerTotalKgMensualPorNombre(nombre)
      : await ecopuntoRepo.calcularTotalKgMensualPorNombre(nombre);

    return res.status(200).json({
      success: true,
      ecopunto: ecopunto ? { id: ecopunto._id, nombre: ecopunto.nombre } : null,
      series
    });
  } catch (err) {
    console.error('❌ [CONTROLLER] Error totalKg mensual por nombre:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// === DETALLE DE ENTREGAS: fecha/hora/nombreVecino/kg ===
const obtenerEntregasDetalladasPorEcopunto = async (req, res) => {
  console.log('🎯 [CONTROLLER] → GET /ecopunto/:id/entregas-detalle');
  try {
    const { id } = req.params;
    const { desde, hasta, limit } = req.query;
    const opciones = { desde, hasta, limit };
    // Seguridad adicional: si es encargado, solo puede ver su propio ecopunto
    if (req.usuario?.rol === 'encargado') {
      const ecopunto = await ecopuntoRepo.obtenerPorId(id);
      if (!ecopunto) return res.status(404).json({ success: false, message: 'Ecopunto no encontrado' });
      if (String(ecopunto.encargado) !== String(req.usuario._id)) {
        return res.status(403).json({ success: false, message: 'Acceso denegado a este ecopunto' });
      }
    }
    const entregas = await ecopuntoService.obtenerEntregasDetalladasPorEcopuntoId(id, opciones);
    return res.status(200).json({ success: true, ecopuntoId: id, entregas });
  } catch (err) {
    console.error('❌ [CONTROLLER] Error entregas detalle por ecopunto:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// === METAS MENSUALES ===
const upsertMetaMensual = async (req, res) => {
  console.log('🎯 [CONTROLLER] → PUT /ecopunto/:id/meta-mensual');
  try {
    const { id } = req.params;
    const { year, month, objetivoKg } = req.body;
    if (!year || !month || !objetivoKg) {
      return res.status(400).json({ success: false, message: 'year, month y objetivoKg son obligatorios' });
    }
    // Encargado solo su ecopunto
    if (req.usuario?.rol === 'encargado') {
      const ecopunto = await ecopuntoRepo.obtenerPorId(id);
      if (!ecopunto) return res.status(404).json({ success: false, message: 'Ecopunto no encontrado' });
      if (String(ecopunto.encargado) !== String(req.usuario._id)) {
        return res.status(403).json({ success: false, message: 'Acceso denegado a este ecopunto' });
      }
    }
    const meta = await ecopuntoService.crearOEditarMetaMensual({ ecopuntoId: id, year: Number(year), month: Number(month), objetivoKg: Number(objetivoKg) });
    return res.status(200).json({ success: true, meta });
  } catch (err) {
    console.error('❌ [CONTROLLER] Error upsert meta mensual:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const obtenerMetaMensual = async (req, res) => {
  console.log('🎯 [CONTROLLER] → GET /ecopunto/:id/meta-mensual');
  try {
    const { id } = req.params;
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ success: false, message: 'year y month son obligatorios' });
    if (req.usuario?.rol === 'encargado') {
      const ecopunto = await ecopuntoRepo.obtenerPorId(id);
      if (!ecopunto) return res.status(404).json({ success: false, message: 'Ecopunto no encontrado' });
      if (String(ecopunto.encargado) !== String(req.usuario._id)) {
        return res.status(403).json({ success: false, message: 'Acceso denegado a este ecopunto' });
      }
    }
    const meta = await ecopuntoService.obtenerMetaMensual({ ecopuntoId: id, year: Number(year), month: Number(month) });
    return res.status(200).json({ success: true, meta });
  } catch (err) {
    console.error('❌ [CONTROLLER] Error obtener meta mensual:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const eliminarMetaMensual = async (req, res) => {
  console.log('🎯 [CONTROLLER] → DELETE /ecopunto/:id/meta-mensual');
  try {
    const { id } = req.params;
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ success: false, message: 'year y month son obligatorios' });
    if (req.usuario?.rol === 'encargado') {
      const ecopunto = await ecopuntoRepo.obtenerPorId(id);
      if (!ecopunto) return res.status(404).json({ success: false, message: 'Ecopunto no encontrado' });
      if (String(ecopunto.encargado) !== String(req.usuario._id)) {
        return res.status(403).json({ success: false, message: 'Acceso denegado a este ecopunto' });
      }
    }
    const deleted = await ecopuntoService.eliminarMetaMensual({ ecopuntoId: id, year: Number(year), month: Number(month) });
    return res.status(200).json({ success: true, deleted: !!deleted });
  } catch (err) {
    console.error('❌ [CONTROLLER] Error eliminar meta mensual:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const obtenerEntregasDetalladasPorNombre = async (req, res) => {
  console.log('🎯 [CONTROLLER] → GET /ecopunto/entregas-detalle?nombre=XYZ');
  try {
    const { nombre, desde, hasta, limit } = req.query;
    if (!nombre) {
      return res.status(400).json({ success: false, message: 'Debe indicar ?nombre= del ecopunto' });
    }
    const opciones = { desde, hasta, limit };
    const { entregas, ecopunto } = await ecopuntoService.obtenerEntregasDetalladasPorNombre(nombre, opciones);
    if (req.usuario?.rol === 'encargado') {
      if (!ecopunto) return res.status(404).json({ success: false, message: 'Ecopunto no encontrado' });
      if (String(ecopunto.encargado) !== String(req.usuario._id)) {
        return res.status(403).json({ success: false, message: 'Acceso denegado a este ecopunto' });
      }
    }
    return res.status(200).json({ success: true, ecopunto: ecopunto ? { id: ecopunto._id, nombre: ecopunto.nombre } : null, entregas });
  } catch (err) {
    console.error('❌ [CONTROLLER] Error entregas detalle por nombre:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};


module.exports = {
  crearEcopunto,
  enrolarEncargado,
  listarEcopuntos,
  obtenerTotalKgPorEcopunto,
  obtenerTotalKgPorNombre,
  obtenerTotalVecinosPorEcopunto,
  obtenerTotalVecinosPorNombre,
  obtenerTotalKgMensualPorEcopunto,
  obtenerTotalKgMensualPorNombre,
  obtenerEntregasDetalladasPorEcopunto,
  obtenerEntregasDetalladasPorNombre,
  upsertMetaMensual,
  obtenerMetaMensual,
  eliminarMetaMensual
};
