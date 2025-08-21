const entregaRepo = require('../repositories/entregaresiduio.repository');
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

const registrarEntrega = async ({ usuarioId, ecopuntoId, tipoResiduoId, pesoKg, descripcion = '' }) => {
  console.log('🟡 [SERVICE] Iniciando registro de entrega...');

  const tipo = await tipoRepo.buscarPorId(tipoResiduoId);
  if (!tipo) throw new Error('Tipo de residuo no encontrado');

  // Calcular cupones según el peso
  const cuponesGenerados = calcularCupones(pesoKg);
  console.log(`🧮 Cupones generados: ${cuponesGenerados} (peso: ${pesoKg}kg)`);

  // Generar cupón automáticamente
  const cuponData = {
    nombre: `Cupón Reciclaje - ${tipo.nombre}`,
    descripcion: `Cupón generado por reciclaje de ${pesoKg}kg de ${tipo.nombre}`,
    cantidadDisponible: cuponesGenerados,
    activo: true,
    fechaCreacion: new Date(),
    fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
    tipo: 'reciclaje',
    pesoGenerador: pesoKg,
    tipoResiduoGenerador: tipoResiduoId
  };

  const cupon = await cuponRepo.crearCupon(cuponData);
  console.log('🎫 [SERVICE] Cupón generado:', cupon._id);

  // Asociar cupón al usuario
  await cuponRepo.asociarUsuario(cupon._id, usuarioId);

  const entrega = await entregaRepo.crearEntrega({
    usuario: usuarioId,
    ecopunto: ecopuntoId,
    tipoResiduo: tipoResiduoId,
    pesoKg,
    tokensOtorgados: cuponesGenerados,
    cuponGenerado: cupon._id,
    descripcion
  });

  console.log('📌 [SERVICE] Entrega guardada correctamente');

  // Incrementar tokens del usuario
  await usuarioRepo.incrementarTokens(usuarioId, cuponesGenerados);

  return { entrega, cupon, cuponesGenerados };
};

const obtenerHistorialUsuario = async (usuarioId) => {
  return await entregaRepo.listarPorUsuario(usuarioId);
};

module.exports = {
  registrarEntrega,
  obtenerHistorialUsuario,
  calcularCupones
};
