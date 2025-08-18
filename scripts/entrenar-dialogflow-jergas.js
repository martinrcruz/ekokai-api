/**
 * 🇦🇷 Script simple para entrenar Dialogflow CX con jergas argentinas
 * 
 * @author Kamila - EKOKAI Team
 * @version 1.0
 */

// Cargar variables de entorno
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const jergaService = require('../src/services/jerga-argentina.service');
const dialogflow = require('@google-cloud/dialogflow-cx');

async function entrenarDialogflowConJergas() {
  console.log('🇦🇷 Entrenando Dialogflow CX con jergas argentinas...\n');
  
  try {
    // 1. Cargar jergas argentinas
    console.log('📚 Cargando jergas argentinas...');
    await jergaService.cargarJergas();
    
    const stats = jergaService.obtenerEstadisticas();
    console.log(`✅ Jergas cargadas: ${stats.totalSaludos + stats.totalConsultaPuntos + stats.totalConsultaPremios + stats.totalConsultaUbicaciones + stats.totalConsultaFuncionamiento} frases\n`);
    
    // 2. Configuración de Dialogflow CX
    const projectId = process.env.GC_PROJECT_ID;
    const agentId = process.env.DIALOGFLOW_AGENT_ID;
    const location = 'us-central1'; // Ubicación correcta según la URL
    
    if (agentId === 'tu-agent-id') {
      console.log('❌ Necesitas configurar el DIALOGFLOW_AGENT_ID en tu archivo .env');
      console.log('💡 Ve a https://dialogflow.cloud.google.com y copia el ID de tu agente');
      return;
    }
    
    console.log(`📋 Configuración:`);
    console.log(`   Proyecto: ${projectId}`);
    console.log(`   Agente: ${agentId}`);
    console.log(`   Ubicación: ${location}\n`);
    
    // 3. Crear cliente de Dialogflow CX con endpoint correcto
    const credentials = {
      private_key: process.env.GC_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GC_CLIENT_EMAIL
    };
    
    const client = new dialogflow.IntentsClient({
      credentials: credentials,
      apiEndpoint: 'us-central1-dialogflow.googleapis.com'
    });
    
    // 4. Preparar intents con jergas argentinas
    console.log('🎯 Preparando intents...');
    
    const intents = [
      {
        displayName: 'saludos',
        trainingPhrases: jergaService.jergas.saludos.slice(0, 20).map(phrase => ({
          parts: [{ text: phrase }],
          repeatCount: 1
        })),
        messages: [{
          text: {
            text: ['¡Hola! ¿Cómo estás? 🌱']
          }
        }]
      },
      {
        displayName: 'consulta_puntos_argentino',
        trainingPhrases: jergaService.jergas.consultaPuntos.slice(0, 20).map(phrase => ({
          parts: [{ text: phrase }],
          repeatCount: 1
        })),
        messages: [{
          text: {
            text: ['Te ayudo a consultar tus tokens acumulados 🪙']
          }
        }]
      },
      {
        displayName: 'consulta_premios_argentino',
        trainingPhrases: jergaService.jergas.consultaPremios.slice(0, 20).map(phrase => ({
          parts: [{ text: phrase }],
          repeatCount: 1
        })),
        messages: [{
          text: {
            text: ['Te muestro los premios disponibles para canjear 🎁']
          }
        }]
      },
      {
        displayName: 'consulta_ubicaciones_argentino',
        trainingPhrases: jergaService.jergas.consultaUbicaciones.slice(0, 20).map(phrase => ({
          parts: [{ text: phrase }],
          repeatCount: 1
        })),
        messages: [{
          text: {
            text: ['Te ayudo a encontrar los ecopuntos más cercanos 🗺️']
          }
        }]
      },
      {
        displayName: 'consulta_funcionamiento_argentino',
        trainingPhrases: jergaService.jergas.consultaFuncionamiento.slice(0, 20).map(phrase => ({
          parts: [{ text: phrase }],
          repeatCount: 1
        })),
        messages: [{
          text: {
            text: ['Te explico cómo funciona EKOKAI ♻️']
          }
        }]
      }
    ];
    
    console.log(`📊 Preparados ${intents.length} intents con ${intents.reduce((total, intent) => total + intent.trainingPhrases.length, 0)} frases\n`);
    
    // 5. Crear intents en Dialogflow CX
    console.log('🚀 Creando intents en Dialogflow CX...');
    
    for (const intent of intents) {
      try {
        console.log(`   Creando: ${intent.displayName}...`);
        
        const request = {
          parent: `projects/${projectId}/locations/${location}/agents/${agentId}`,
          intent: {
            displayName: intent.displayName,
            trainingPhrases: intent.trainingPhrases,
            messages: intent.messages
          }
        };
        
        const [response] = await client.createIntent(request);
        console.log(`   ✅ Creado: ${response.name}`);
        
      } catch (error) {
        if (error.code === 6) { // ALREADY_EXISTS
          console.log(`   ⚠️ Ya existe: ${intent.displayName}`);
        } else {
          console.error(`   ❌ Error: ${error.message}`);
        }
      }
    }
    
    // 6. Entrenar el agente
    console.log('\n🎓 Entrenando el agente...');
    
    try {
      const agentsClient = new dialogflow.AgentsClient({
        credentials: credentials,
        apiEndpoint: 'us-central1-dialogflow.googleapis.com'
      });
      
      const trainRequest = {
        parent: `projects/${projectId}/locations/${location}/agents/${agentId}`
      };
      
      const [operation] = await agentsClient.trainAgent(trainRequest);
      console.log('   ⏳ Entrenamiento iniciado...');
      
      const [result] = await operation.promise();
      console.log('   ✅ Entrenamiento completado');
      
    } catch (error) {
      console.error('   ❌ Error durante el entrenamiento:', error.message);
      console.log('   💡 Los intents ya están creados. Puedes entrenar manualmente desde la consola de Dialogflow CX');
    }
    
    console.log('\n✅ Entrenamiento completado!');
    console.log('🇦🇷 ¡Tu bot ahora entiende jergas argentinas!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar
entrenarDialogflowConJergas(); 