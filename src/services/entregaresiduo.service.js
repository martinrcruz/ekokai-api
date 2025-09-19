const entregaRepo = require('../repositories/entregaresiduo.repository');
const usuarioRepo = require('../repositories/usuario.repository');
const tipoRepo = require('../repositories/tiporesiduo.repository');
const cuponRepo = require('../repositories/cupon.repository');

const calcularCupones = (pesoKg) => {
  // Por 0,5 kg redondeado hacia arriba es 1 cupón
  // 2,5 kg redondeado hacia arriba es 3 cupones
  // 2,4 kg redondeado hacia abajo son 2 cupones
  // 15 kg son 15 cupones
  return Math.ceil(pesoKg * 2); // Multiplicador de 2 para mantener la lógica especificada
};

const registrarEntrega = async ({ usuarioId, ecopuntoId, tipoResiduoId, pesoKg, descripcion = '', encargadoId = null }) => {
  console.log('🟡 [SERVICE] Iniciando registro de entrega...');

  const tipo = await tipoRepo.buscarPorId(tipoResiduoId);
  if (!tipo) throw new Error('Tipo de residuo no encontrado');

  // Calcular cupones según el peso
  const cuponesGenerados = calcularCupones(pesoKg);
  console.log(`🧮 Cupones generados: ${cuponesGenerados} (peso: ${pesoKg}kg)`);

  // Incrementar cupones del usuario directamente en CuponMoneda
  const { CuponMoneda } = require('../models');
  
  let cuponMoneda = await CuponMoneda.findOne({
    where: { usuarioId }
  });
  
  if (!cuponMoneda) {
    // Crear CuponMoneda si no existe
    cuponMoneda = await CuponMoneda.create({
      usuarioId,
      cantidad: 0,
      activo: true
    });
  }
  
  // Incrementar la cantidad de cupones del usuario
  await cuponMoneda.increment('cantidad', { by: cuponesGenerados });
  console.log(`🎫 [SERVICE] Cupones agregados al usuario: ${cuponesGenerados}`);

  const entrega = await entregaRepo.crearEntrega({
    usuario: usuarioId,
    ecopunto: ecopuntoId,
    tipoResiduo: tipoResiduoId,
    pesoKg,
    cuponesGenerados: cuponesGenerados,
    cuponGenerado: null, // Ya no necesitamos un cupón específico
    descripcion,
    encargado: encargadoId, // ID del encargado que procesa la entrega
    estado: 'completado'
  });

  console.log('📌 [SERVICE] Entrega guardada correctamente');

  // Incrementar tokens del usuario
  await usuarioRepo.incrementarTokens(usuarioId, cuponesGenerados);

  return { entrega, cuponMoneda, cuponesGenerados };
};

const obtenerHistorialUsuario = async (usuarioId) => {
  return await entregaRepo.listarPorUsuario(usuarioId);
};

const obtenerHistorialCompleto = async (filtros = {}) => {
  return await entregaRepo.listarTodasLasEntregas(filtros);
};

const obtenerEstadisticas = async () => {
  return await entregaRepo.obtenerEstadisticas();
};

module.exports = {
  registrarEntrega,
  obtenerHistorialUsuario,
  obtenerHistorialCompleto,
  obtenerEstadisticas,
  calcularCupones
};
