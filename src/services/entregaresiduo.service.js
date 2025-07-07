const entregaRepo = require('../repositories/entregaresiduio.repository');
const usuarioRepo = require('../repositories/usuario.repository');
const tipoRepo = require('../repositories/tiporesiduo.repository');

const registrarEntrega = async ({ usuarioId, ecopuntoId, tipoResiduoId, pesoKg }) => {
  console.log('🟡 [SERVICE] Iniciando registro de entrega...');

  const tipo = await tipoRepo.buscarPorId(tipoResiduoId);
  if (!tipo) throw new Error('Tipo de residuo no encontrado');

  const tokens = Math.round(tipo.tokensPorKg * pesoKg);
  console.log(`🧮 Tokens otorgados: ${tokens} (${tipo.tokensPorKg} x ${pesoKg})`);

  const entrega = await entregaRepo.crearEntrega({
    usuario: usuarioId,
    ecopunto: ecopuntoId,
    tipoResiduo: tipoResiduoId,
    pesoKg,
    tokensOtorgados: tokens
  });

  console.log('📌 [SERVICE] Entrega guardada correctamente');

  await usuarioRepo.incrementarTokens(usuarioId, tokens);

  return entrega;
};

const obtenerHistorialUsuario = async (usuarioId) => {
  return await entregaRepo.listarPorUsuario(usuarioId);
};

module.exports = {
  registrarEntrega,
  obtenerHistorialUsuario
};
