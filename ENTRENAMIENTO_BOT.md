# 🤖 Guía de Entrenamiento del Bot EKOKAI

## ✅ Mejoras Implementadas

### 1. **Sistema Inteligente Local Mejorado**
- ✅ Agregadas variaciones con faltas de ortografía comunes
- ✅ Reconocimiento de "ke" en lugar de "que"
- ✅ Reconocimiento de "k" en lugar de "c"
- ✅ Reconocimiento de "hols" en lugar de "hola"
- ✅ Reconocimiento de "decime" y "dime"
- ✅ Reconocimiento de "ke hay" en lugar de "que hay"

### 2. **Detección de Saludos Mejorada**
- ✅ Agregadas más variaciones: "hols", "holaa", "olaa"
- ✅ Reconocimiento de "ke tal" en lugar de "que tal"
- ✅ Reconocimiento de "komo estas" en lugar de "como estás"

### 3. **Algoritmo de Puntuación Mejorado**
- ✅ Peso alto para variaciones (2.5 puntos)
- ✅ Peso alto para palabras exactas (3 puntos)
- ✅ Peso medio para sinónimos (2 puntos)
- ✅ Peso bajo para contexto (1 punto)

## 🎯 Cómo Entrenar Dialogflow CX

### 1. **Acceder a Dialogflow**
- Ve a: https://dialogflow.cloud.google.com/
- Selecciona tu proyecto: `ekokai-chat-sxgd`

### 2. **Entrenar Intents**

#### **Default Welcome Intent (Saludos)**
Agrega estas frases de entrenamiento:
```
hola
hols
ola
ola k tal
ola que tal
hey
hi
hello
buenas
buenos días
buenos dias
buenas tardes
buenas noches
buen día
buen dia
saludos
saludo
holaa
olaa
ke tal
komo estas
todo bien
```

#### **OpcionUno (Consulta de Tokens)**
Agrega estas frases:
```
mis tokens
cuantos tokens tengo
tokens acumulados
balance de tokens
che decime mis tokens
dime mis tokens
cuantos tokens tengo acumulados
mi balance
ver mis tokens
tokens disponibles
ke tokens tengo
kantos tokens tengo
mis puntitos
mis puntos
```

#### **OpcionDos (Consulta de Premios)**
Agrega estas frases:
```
premios
cupones
ke premios hay
que premios hay
que premios disponibles
premios disponibles
cupones disponibles
catalogo
catálogo
que puedo canjear
que puedo cambiar
beneficios
katalogo
kupones
ke hay
ke ai
```

#### **OpcionTres (Consulta de Ecopuntos)**
Agrega estas frases:
```
ecopuntos
donde hay ecopuntos
donde están los ecopuntos
ubicación ecopuntos
donde puedo reciclar
puntos de reciclaje
donde llevar residuos
donde reciclar
ekopuntos
donde ai
donde hay
decime donde
dime donde
```

#### **OpcionCinco (Información del Sistema)**
Agrega estas frases:
```
como funciona
como funciona ekokai
decime como funciona
explicame como funciona
que es ekokai
como reciclar
ayuda
información
komo funciona
ke es ekokai
decime ke es
explicame
```

### 3. **Entrenar el Modelo**
- Después de agregar las frases, haz clic en "Train" en la parte superior
- Espera a que termine el entrenamiento
- Prueba con frases nuevas

## 🔧 Mejoras Adicionales Recomendadas

### 1. **Agregar Más Intents Específicos**
- Intent para "Gracias"
- Intent para "Adiós"
- Intent para "No entiendo"
- Intent para "Repetir"

### 2. **Configurar Webhook Responses**
- Configurar respuestas personalizadas para cada intent
- Agregar fulfillment tags para respuestas específicas

### 3. **Entrenar con Datos Reales**
- Revisar los logs del bot para ver qué frases no reconoce
- Agregar esas frases a los intents correspondientes
- Entrenar regularmente con nuevas variaciones

## 📊 Monitoreo y Mejora Continua

### 1. **Revisar Logs**
- Monitorear qué frases caen en "Default Fallback Intent"
- Identificar patrones de frases no reconocidas
- Agregar esas frases a los intents apropiados

### 2. **Análisis de Usuarios**
- Revisar qué opciones del menú se usan más
- Optimizar respuestas basadas en el comportamiento real
- Agregar funcionalidades solicitadas frecuentemente

### 3. **Pruebas Regulares**
- Probar el bot con diferentes tipos de usuarios
- Simular conversaciones reales
- Identificar puntos de mejora

## 🚀 Comandos Útiles

### Reiniciar el servidor después de cambios:
```bash
cd ekokai-api
npm run start
```

### Ver logs en tiempo real:
```bash
tail -f logs/bot.log
```

### Probar el webhook:
```bash
curl -X POST http://localhost:8080/webhook/whatsapp \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp:+56944596955&Body=hola"
```

## 📝 Notas Importantes

- **Dialogflow CX** es la herramienta principal para el entrenamiento
- **El sistema local** es un respaldo para frases no reconocidas
- **Las variaciones con faltas de ortografía** están implementadas en el código
- **El entrenamiento debe ser continuo** basado en el uso real

## 🎯 Próximos Pasos

1. Entrenar Dialogflow CX con las frases sugeridas
2. Probar el bot con diferentes tipos de usuarios
3. Revisar logs y agregar frases no reconocidas
4. Implementar intents adicionales según necesidad
5. Optimizar respuestas basadas en feedback de usuarios 