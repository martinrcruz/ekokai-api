const { SessionsClient } = require('@google-cloud/dialogflow-cx');
const fs = require('fs');

// Configuración
const projectId = 'ekokai-chat-sxgd';
const location = 'us-central1';
const agentId = 'your-agent-id'; // Reemplazar con tu Agent ID
const sessionId = 'training-session';

const client = new SessionsClient({
  keyFilename: './google-credentials.json' // Asegúrate de tener las credenciales
});

// Datos de entrenamiento masivo
const trainingData = {
  'Default Welcome Intent': [
    'hola', 'hols', 'ola', 'ola k tal', 'ola que tal', 'hey', 'hi', 'hello',
    'buenas', 'buenos días', 'buenos dias', 'buenas tardes', 'buenas noches',
    'buen día', 'buen dia', 'saludos', 'saludo', 'holaa', 'olaa', 'ke tal',
    'komo estas', 'todo bien', 'que tal', 'como estas', 'como estás'
  ],
  'OpcionUno': [
    'mis tokens', 'cuantos tokens tengo', 'tokens acumulados', 'balance de tokens',
    'che decime mis tokens', 'dime mis tokens', 'cuantos tokens tengo acumulados',
    'mi balance', 'ver mis tokens', 'tokens disponibles', 'ke tokens tengo',
    'kantos tokens tengo', 'mis puntitos', 'mis puntos', 'tengo tokens',
    'cuantos puntos tengo', 'kantos puntos tengo', 'mi saldo', 'mi saldo de tokens'
  ],
  'OpcionDos': [
    'premios', 'cupones', 'ke premios hay', 'que premios hay', 'que premios disponibles',
    'premios disponibles', 'cupones disponibles', 'catalogo', 'catálogo',
    'que puedo canjear', 'que puedo cambiar', 'beneficios', 'katalogo',
    'kupones', 'ke hay', 'ke ai', 'que hay disponible', 'ke hay disponible',
    'que puedo cambiar', 'ke puedo cambiar', 'catalogo de premios', 'katalogo de premios'
  ],
  'OpcionTres': [
    'ecopuntos', 'donde hay ecopuntos', 'donde están los ecopuntos', 'ubicación ecopuntos',
    'donde puedo reciclar', 'puntos de reciclaje', 'donde llevar residuos',
    'donde reciclar', 'ekopuntos', 'donde ai', 'donde hay', 'decime donde',
    'dime donde', 'donde puedo llevar', 'donde puedo ir', 'donde queda',
    'donde keda', 'ubicacion', 'ubikasion', 'donde estan', 'donde estan los ecopuntos'
  ],
  'OpcionCinco': [
    'como funciona', 'como funciona ekokai', 'decime como funciona', 'explicame como funciona',
    'que es ekokai', 'como reciclar', 'ayuda', 'información', 'komo funciona',
    'ke es ekokai', 'decime ke es', 'explicame', 'como funciona esto',
    'ke es esto', 'que es esto', 'como funciona el sistema', 'komo funciona el sistema',
    'ayuda ekokai', 'ayuda ekokai', 'informacion', 'informasion'
  ]
};

async function entrenarIntent(intentName, phrases) {
  console.log(`🔄 Entrenando intent: ${intentName}`);
  
  for (const phrase of phrases) {
    try {
      const request = {
        session: `projects/${projectId}/locations/${location}/agents/${agentId}/sessions/${sessionId}`,
        queryInput: {
          text: {
            text: phrase
          }
        }
      };

      const [response] = await client.detectIntent(request);
      console.log(`✅ "${phrase}" → ${response.queryResult.intent.displayName}`);
      
      // Pequeña pausa para no sobrecargar la API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error con "${phrase}":`, error.message);
    }
  }
}

async function entrenarBot() {
  console.log('🚀 Iniciando entrenamiento masivo del bot...');
  
  for (const [intentName, phrases] of Object.entries(trainingData)) {
    await entrenarIntent(intentName, phrases);
    console.log(`✅ Intent ${intentName} completado\n`);
  }
  
  console.log('🎉 Entrenamiento completado!');
}

// Ejecutar entrenamiento
entrenarBot().catch(console.error); 