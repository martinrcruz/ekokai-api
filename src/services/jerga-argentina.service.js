/**
 * 🇦🇷 Servicio de Jerga Argentina para EKOKAI
 * 
 * Este servicio maneja la carga y gestión de las jergas argentinas
 * para mejorar la detección de intenciones en el chatbot
 * 
 * @author Kamila - EKOKAI Team
 * @version 1.0
 */

const fs = require('fs').promises;
const path = require('path');

class JergaArgentinaService {
  constructor() {
    this.jergas = {
      saludos: [],
      problema: [],
      consultaUbicaciones: [],
      consultaReciclar: [],
      consultaCupones: [],
      consultaHuella: [],
      consultaFuncionamiento: []
    };
    this.cargado = false;
  }

  /**
   * Carga todas las jergas argentinas desde los archivos CSV partidos
   */
  async cargarJergas() {
    try {
      console.log('[JERGA] 🚀 Iniciando carga de jergas argentinas...');
      
      const intentsSplitPath = path.join(__dirname, '../../intents_split');
      
      // Cargar saludos desde archivos partidos
      this.jergas.saludos = await this.cargarCSVPartidos(intentsSplitPath, 'saludos');
      this.jergas.problema = await this.cargarCSVPartidos(intentsSplitPath, 'problema');
      this.jergas.consultaUbicaciones = await this.cargarCSVPartidos(intentsSplitPath, 'consulta_ubicaciones');
      this.jergas.consultaReciclar = await this.cargarCSVPartidos(intentsSplitPath, 'consulta_reciclar');
      this.jergas.consultaCupones = await this.cargarCSVPartidos(intentsSplitPath, 'consulta_cupones');
      this.jergas.consultaHuella = await this.cargarCSVPartidos(intentsSplitPath, 'consulta_huella');
      this.jergas.consultaFuncionamiento = await this.cargarCSVPartidos(intentsSplitPath, 'consulta_funcionamiento');





      this.cargado = true;
      console.log(`[JERGA] ✅ Jergas cargadas exitosamente:
        - Saludos: ${this.jergas.saludos.length}
        - Problema: ${this.jergas.problema.length}
                - Consulta Ubicaciones: ${this.jergas.consultaUbicaciones.length}
        - Consulta Reciclar: ${this.jergas.consultaReciclar.length}
        - Consulta Huella: ${this.jergas.consultaHuella.length}
        -        - Consulta Cupones: ${this.jergas.consultaCupones.length}
        - Consulta Funcionamiento: ${this.jergas.consultaFuncionamiento.length}
      `);
      
    } catch (error) {
      console.error('[JERGA] ❌ Error al cargar jergas:', error);
      throw error;
    }
  }

  /**
   * Carga un archivo CSV y retorna las líneas
   */
  async cargarCSV(filePath) {
    try {
      const contenido = await fs.readFile(filePath, 'utf-8');
      const lineas = contenido.split('\n').filter(linea => linea.trim());
      
      // Remover la primera línea si es el header
      if (lineas.length > 0 && lineas[0].includes('saludo') || lineas[0].includes('consulta')) {
        return lineas.slice(1);
      }
      
      return lineas;
    } catch (error) {
      console.error(`[JERGA] ❌ Error al cargar ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Carga múltiples archivos CSV partidos y los combina
   */
  async cargarCSVPartidos(basePath, nombreBase) {
    try {
      const archivos = await fs.readdir(basePath);
      const archivosPartidos = archivos.filter(archivo => 
        archivo.startsWith(nombreBase) && archivo.endsWith('.csv')
      );
      
      let todasLasFrases = [];
      
      for (const archivo of archivosPartidos) {
        const filePath = path.join(basePath, archivo);
        const frases = await this.cargarCSV(filePath);
        todasLasFrases = todasLasFrases.concat(frases);
      }
      
      console.log(`[JERGA] 📚 Cargadas ${todasLasFrases.length} frases de ${archivosPartidos.length} archivos para ${nombreBase}`);
      return todasLasFrases;
      
    } catch (error) {
      console.error(`[JERGA] ❌ Error al cargar archivos partidos para ${nombreBase}:`, error);
      return [];
    }
  }

  /**
   * Normaliza texto para comparación
   */
  normalizarTexto(texto) {
    return texto.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s]/g, ' ') // Solo letras, números y espacios
      .replace(/\s+/g, ' ') // Múltiples espacios a uno
      .trim();
  }

  /**
   * Calcula similitud entre dos textos
   */
  calcularSimilitud(str1, str2) {
    const texto1 = this.normalizarTexto(str1);
    const texto2 = this.normalizarTexto(str2);
    
    if (texto1 === texto2) return 1.0;
    
    const palabras1 = texto1.split(' ');
    const palabras2 = texto2.split(' ');
    
    const palabrasComunes = palabras1.filter(p => palabras2.includes(p));
    const totalPalabras = Math.max(palabras1.length, palabras2.length);
    
    return palabrasComunes.length / totalPalabras;
  }

  /**
   * Detecta si un mensaje es un saludo argentino
   */
  detectarSaludo(mensaje) {
    if (!this.cargado) return false;
    
    const texto = this.normalizarTexto(mensaje);
    
    // Combinar todos los saludos
    const todosLosSaludos = [...this.jergas.saludos, ...this.jergas.saludosPopulares];
    
    for (const saludo of todosLosSaludos) {
      const similitud = this.calcularSimilitud(texto, saludo);
      if (similitud > 0.7) {
        return {
          esSaludo: true,
          similitud,
          saludoOriginal: saludo
        };
      }
    }
    
    return { esSaludo: false };
  }

  /**
   * Detecta la intención basada en jergas argentinas
   */
  detectarIntencion(mensaje) {
    if (!this.cargado) return null;
    
    const texto = this.normalizarTexto(mensaje);
    const intenciones = [];
   
    //Detectar
    
    // Detectar consulta de premios
    for (const consulta of this.jergas.consultaPremios) {
      const similitud = this.calcularSimilitud(texto, consulta);
      if (similitud > 0.6) {
        intenciones.push({
          tipo: 'consulta_premios',
          similitud,
          original: consulta
        });
      }
    }
    
    // Detectar consulta de ubicaciones
    for (const consulta of this.jergas.consultaUbicaciones) {
      const similitud = this.calcularSimilitud(texto, consulta);
      if (similitud > 0.6) {
        intenciones.push({
          tipo: 'consulta_ubicaciones',
          similitud,
          original: consulta
        });
      }
    }
    
    // Detectar consulta de funcionamiento
    for (const consulta of this.jergas.consultaFuncionamiento) {
      const similitud = this.calcularSimilitud(texto, consulta);
      if (similitud > 0.6) {
        intenciones.push({
          tipo: 'consulta_funcionamiento',
          similitud,
          original: consulta
        });
      }
    }
    
    // Retornar la intención con mayor similitud
    if (intenciones.length > 0) {
      const mejorIntencion = intenciones.reduce((prev, current) => 
        prev.similitud > current.similitud ? prev : current
      );
      
      return {
        intencion: mejorIntencion.tipo,
        confianza: mejorIntencion.similitud,
        original: mejorIntencion.original
      };
    }
    
    return null;
  }

  /**
   * Obtiene un saludo aleatorio argentino
   */
  obtenerSaludoAleatorio() {
    if (!this.cargado || this.jergas.saludos.length === 0) {
      return '¡Hola! ¿Cómo estás?';
    }
    
    const indice = Math.floor(Math.random() * this.jergas.saludos.length);
    return this.jergas.saludos[indice];
  }

  /**
   * Obtiene un saludo popular aleatorio
   */
  

  /**
   * Verifica si el servicio está cargado
   */
  estaCargado() {
    return this.cargado;
  }

  
}

// Exportar instancia singleton
const jergaService = new JergaArgentinaService();

module.exports = jergaService; 