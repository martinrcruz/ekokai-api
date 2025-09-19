#!/usr/bin/env node

/**
 * Script para probar directamente el endpoint de validación
 */

const express = require('express');
const recompensaCtrl = require('./src/controllers/recompensa.controller');

async function testEndpointDirect() {
  try {
    console.log('🧪 Probando endpoint de validación directamente...');
    
    // Crear una aplicación Express temporal
    const app = express();
    app.use(express.json());
    
    // Simular request y response
    const mockReq = {
      params: {
        codigo: '2a63bf00-d318-4190-a037-c85e2d90ba3c'
      }
    };
    
    const mockRes = {
      json: (data) => {
        console.log('✅ Respuesta JSON:', JSON.stringify(data, null, 2));
      },
      status: (code) => {
        console.log(`📊 Status code: ${code}`);
        return {
          json: (data) => {
            console.log('❌ Respuesta de error:', JSON.stringify(data, null, 2));
          }
        };
      }
    };
    
    console.log(`🎯 Probando validación con código: ${mockReq.params.codigo}`);
    
    // Llamar directamente al controlador
    await recompensaCtrl.validarCodigoRecompensa(mockReq, mockRes);
    
    console.log('\n🎉 Prueba completada');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testEndpointDirect()
    .then(() => {
      console.log('✅ Script de prueba completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script de prueba falló:', error);
      process.exit(1);
    });
}

module.exports = { testEndpointDirect };
