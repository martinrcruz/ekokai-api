// whatsapp/core/similarity.js
function normalizarTexto(txt) {
    return String(txt || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9áéíóúñü\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  function levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
    for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }
  
  function calcularSimilitud(str1, str2) {
    const s1 = normalizarTexto(str1);
    const s2 = normalizarTexto(str2);
    if (s1 === s2) return 1.0;
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1.0;
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }
  
  function encontrarMejorCoincidencia(mensaje, opciones, umbral = 0.5) {
    console.log(`[LOG] Buscando coincidencia para: "${mensaje}"`);
    console.log(`[LOG] Opciones disponibles: ${JSON.stringify(opciones)}`);
    let mejorCoincidencia = null;
    let mejorSimilitud = 0;
    for (const opcion of opciones) {
      const similitud = calcularSimilitud(mensaje, opcion);
      console.log(`[LOG] Similitud con "${opcion}": ${similitud}`);
      if (similitud > mejorSimilitud && similitud >= umbral) {
        mejorSimilitud = similitud;
        mejorCoincidencia = opcion;
      }
    }
    console.log(`[LOG] Mejor coincidencia: "${mejorCoincidencia}" (similitud: ${mejorSimilitud})`);
    return mejorCoincidencia;
  }
  
  module.exports = {
    normalizarTexto,
    levenshteinDistance,
    calcularSimilitud,
    encontrarMejorCoincidencia,
  };
  