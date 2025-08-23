const Ecopunto = require('../models/ecopunto.model');
const Usuario = require('../models/usuario.model');
const mongoose = require('mongoose');
const EcopuntoMeta = require('../models/ecopuntoMeta.model');
const EntregaResiduo = require('../models/entregaresiduo.model');

async function _getEntregasCollection() {
  // Para usar aggregate().toArray(), necesitamos la colección directamente
  return EntregaResiduo.collection;
}

async function calcularTotalKgPorEcopuntoId(ecopuntoId) {
  const entregas = await _getEntregasCollection();
  const _id = new mongoose.Types.ObjectId(ecopuntoId);

  const pipeline = [
    // El esquema real usa el campo `ecopunto` y `pesoKg`
    { $match: { ecopunto: _id } },
    {
      $group: {
        _id: null,
        totalKg: {
          $sum: {
            // Coerción defensiva por si existen documentos antiguos con `peso`
            $toDouble: { $ifNull: ['$pesoKg', '$peso'] }
          }
        }
      }
    }
  ];

  const res = await entregas.aggregate(pipeline).toArray();
  return res[0]?.totalKg || 0;
}

async function calcularTotalKgPorNombre(nombre) {
  // busca el ecopunto por nombre (case-insensitive) y delega al sumatorio por id
  const ecopunto = await Ecopunto.findOne({ nombre: new RegExp(`^${nombre}$`, 'i') });
  if (!ecopunto) return { totalKg: 0, ecopunto: null };

  const totalKg = await calcularTotalKgPorEcopuntoId(ecopunto._id);
  return { totalKg, ecopunto };
}

async function calcularTotalKgMensualPorEcopuntoId(ecopuntoId) {
  const entregas = await _getEntregasCollection();
  const _id = new mongoose.Types.ObjectId(ecopuntoId);

  const pipeline = [
    { $match: { ecopunto: _id } },
    {
      $group: {
        _id: {
          year: { $year: '$fecha' },
          month: { $month: '$fecha' }
        },
        totalKg: { $sum: { $toDouble: { $ifNull: ['$pesoKg', '$peso'] } } }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        totalKg: 1
      }
    }
  ];

  return await entregas.aggregate(pipeline).toArray();
}

async function calcularTotalKgMensualPorNombre(nombre) {
  const ecopunto = await Ecopunto.findOne({ nombre: new RegExp(`^${nombre}$`, 'i') });
  if (!ecopunto) return { series: [], ecopunto: null };
  const series = await calcularTotalKgMensualPorEcopuntoId(ecopunto._id);
  return { series, ecopunto };
}

async function contarVecinosPorEcopuntoId(ecopuntoId) {
  const _id = new mongoose.Types.ObjectId(ecopuntoId);
  const totalVecinos = await Usuario.countDocuments({ ecopuntoId: _id, rol: 'vecino' });
  return totalVecinos;
}

async function contarVecinosPorNombre(nombre) {
  const ecopunto = await Ecopunto.findOne({ nombre: new RegExp(`^${nombre}$`, 'i') });
  if (!ecopunto) return { totalVecinos: 0, ecopunto: null };
  const totalVecinos = await contarVecinosPorEcopuntoId(ecopunto._id);
  return { totalVecinos, ecopunto };
}

async function listarEntregasDetalladasPorEcopuntoId(ecopuntoId, { desde, hasta, limit } = {}) {
  const entregas = await _getEntregasCollection();
  const _id = new mongoose.Types.ObjectId(ecopuntoId);

  const match = { ecopunto: _id };
  if (desde || hasta) {
    match.fecha = {};
    if (desde) match.fecha.$gte = new Date(desde);
    if (hasta) match.fecha.$lte = new Date(hasta);
  }

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'usuarios',
        localField: 'usuario',
        foreignField: '_id',
        as: 'vecino'
      }
    },
    { $unwind: { path: '$vecino', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        fecha: { $dateToString: { date: '$fecha', format: '%Y-%m-%d' } },
        hora: { $dateToString: { date: '$fecha', format: '%H:%M:%S' } },
        pesoKg: { $toDouble: { $ifNull: ['$pesoKg', '$peso'] } },
        nombreVecino: {
          $trim: { input: { $concat: [ { $ifNull: ['$vecino.nombre', ''] }, ' ', { $ifNull: ['$vecino.apellido', ''] } ] } }
        },
        usuarioId: '$vecino._id'
      }
    },
    { $sort: { fecha: -1, hora: -1 } },
  ];

  const max = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(500, Number(limit))) : 100;
  pipeline.push({ $limit: max });

  return await entregas.aggregate(pipeline).toArray();
}

async function listarEntregasDetalladasPorNombre(nombre, opts = {}) {
  const ecopunto = await Ecopunto.findOne({ nombre: new RegExp(`^${nombre}$`, 'i') });
  if (!ecopunto) return { entregas: [], ecopunto: null };
  const entregas = await listarEntregasDetalladasPorEcopuntoId(ecopunto._id, opts);
  return { entregas, ecopunto };
}


module.exports = {
  async crearEcopunto(data) {
    const ecopuntoData = {
      nombre: data.nombre,
      direccion: data.direccion,
      zona: data.zona,
      descripcion: data.descripcion || '',
      horarioApertura: data.horarioApertura || '08:00',
      horarioCierre: data.horarioCierre || '20:00',
      capacidadMaxima: data.capacidadMaxima || 1000,
      activo: data.activo !== undefined ? data.activo : true,
      encargado: data.encargado || null
    };
    
    const ecopunto = new Ecopunto(ecopuntoData);
    return ecopunto.save();
  },
  async obtenerPorId(id) {
    return Ecopunto.findById(id);
  },
  async obtenerPorNombre(nombre) {
    return Ecopunto.findOne({ nombre: new RegExp(`^${nombre}$`, 'i') });
  },
  async listarEcopuntosConDetalle() {
    return Ecopunto.find().populate('encargado').populate('vecinos');
  },
  async buscarPorEncargado(encargadoId) {
    return Ecopunto.findOne({ encargado: encargadoId });
  },
  async actualizarEncargado(ecopuntoId, encargadoId) {
    return Ecopunto.findByIdAndUpdate(ecopuntoId, { encargado: encargadoId }, { new: true });
  },
  async actualizarEcopunto(ecopuntoId, datos) {
    const updateData = { ...datos };
    
    // Asegurar que los campos opcionales tengan valores por defecto si no se proporcionan
    if (updateData.horarioApertura === undefined) updateData.horarioApertura = '08:00';
    if (updateData.horarioCierre === undefined) updateData.horarioCierre = '20:00';
    if (updateData.capacidadMaxima === undefined) updateData.capacidadMaxima = 1000;
    if (updateData.activo === undefined) updateData.activo = true;
    if (updateData.descripcion === undefined) updateData.descripcion = '';
    
    return Ecopunto.findByIdAndUpdate(ecopuntoId, updateData, { new: true });
  },
  async eliminarEcopunto(ecopuntoId) {
    return Ecopunto.findByIdAndDelete(ecopuntoId);
  },

  calcularTotalKgPorEcopuntoId,
  calcularTotalKgPorNombre,
  calcularTotalKgMensualPorEcopuntoId,
  calcularTotalKgMensualPorNombre,
  contarVecinosPorEcopuntoId,
  contarVecinosPorNombre,
  listarEntregasDetalladasPorEcopuntoId,
  listarEntregasDetalladasPorNombre,

  // === Metas mensuales ===
  async upsertMetaMensual({ ecopuntoId, year, month, objetivoKg }) {
    const filter = { ecopunto: new mongoose.Types.ObjectId(ecopuntoId), year, month };
    const update = { $set: { objetivoKg, actualizadoEn: new Date() }, $setOnInsert: { creadoEn: new Date() } };
    const options = { upsert: true, new: true, returnDocument: 'after' };
    const res = await EcopuntoMeta.findOneAndUpdate(filter, update, options);
    return res;
  },
  async obtenerMetaMensual({ ecopuntoId, year, month }) {
    return EcopuntoMeta.findOne({ ecopunto: new mongoose.Types.ObjectId(ecopuntoId), year, month });
  },
  async eliminarMetaMensual({ ecopuntoId, year, month }) {
    return EcopuntoMeta.findOneAndDelete({ ecopunto: new mongoose.Types.ObjectId(ecopuntoId), year, month });
  }

};