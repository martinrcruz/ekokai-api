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
    // Evitar falsos positivos por subcadenas: solo dar alta similitud si es coincidencia por palabra
    const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const shorter = s1.length <= s2.length ? s1 : s2;
    const longer  = s1.length <= s2.length ? s2 : s1;
    if (shorter.length >= 3) {
      const pattern = new RegExp(`(^|\\W)${escape(shorter)}(\\W|$)`);
      if (pattern.test(longer)) {
        return 0.9;
      }
    }
    const longerLeven = s1.length > s2.length ? s1 : s2;
    const shorterLeven = s1.length > s2.length ? s2 : s1;
    if (longerLeven.length === 0) return 1.0;
    const distance = levenshteinDistance(longerLeven, shorterLeven);
    return (longerLeven.length - distance) / longerLeven.length;
  }
  
  function encontrarMejorCoincidencia(mensaje, opciones, umbral = 0.5) {
   
    let mejorCoincidencia = null;
    let mejorSimilitud = 0;
    for (const opcion of opciones) {
      const similitud = calcularSimilitud(mensaje, opcion);
      
      if (similitud > mejorSimilitud && similitud >= umbral) {
        mejorSimilitud = similitud;
        mejorCoincidencia = opcion;
      }
    }
    return mejorCoincidencia;
  }
  
  module.exports = {
    normalizarTexto,
    levenshteinDistance,
    calcularSimilitud,
    encontrarMejorCoincidencia,
  };
  