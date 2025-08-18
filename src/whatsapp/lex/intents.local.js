// whatsapp/lex/intents.local.js
const LOCAL_LEX = {
    // Cuponera
    canjear_cupon: [
      'canjear cupón','canjear cupon','canjear','quiero canjear','canje directo','canjear ahora',
      'premio','regalo','canjear premio'
    ],
    ver_cupon: [
      'ver','ver cupon','ver cupones','mis cupones','cupones activos','cupones vigentes','vigentes',
      'activos','vigentes fecha','ver mis cupones','ver mis cupones activos'
    ],
    ver_catalogo: [
      'catalogo','catálogo','ver catalogo','ver catálogo','lista','listado','premios','catálogo completo',
      'todos los cupones','todos los premios','ver todos los premios','ver todos los cupones'
    ],
    como_canjear: [
      'como se canjea','cómo se canjea','que tengo que hacer','qué tengo que hacer','enseñame','enséñame',
      'me decis como se canjea','me decís cómo se canjea','paso a paso','que pasos seguir','qué pasos seguir',
      'instrucciones','como hago','cómo hago','me guias','me guías','proceso de canje','como canjear','cómo canjear'
    ],
    problema_cupon: [
      'falla','no funciona','problema','drama','no reconoce','error','no sirve','no valido','no válido',
      'vencido','no acepta','no aplica','no reconoce el qr','no funciona el qr','no me llegó','no me llego'
    ],
  
    // Ecopuntos
    ubicacion_ecopunto: [
      'ubicacion','ubicación','donde','dónde','quedan','queda','esta','está','ubicados',
      'encuentro','encontrar','mapa','dirección','direccion','punto verde','puntos verdes'
    ],
    horario_ecopunto: [
      'horario','horarios','materiales','material','reciclar','reciclaje','qué reciben','que reciben',
      'aceptan','qué aceptan','que aceptan','basura','residuos','qué se puede llevar','que se puede llevar'
    ],
    materiales_ecopunto: [
      'materiales','material','reciclar','reciclaje','qué reciben','que reciben','aceptan','qué aceptan',
      'que aceptan','basura','residuos','qué no reciben','no reciben','qué se puede llevar','que se puede llevar'
    ],
    problema_ecopunto: [
      'problema','conflicto','inconveniente','queja','reclamo','reporte','reportar',
      'me atendieron mal','estaba cerrado','mal estado','no funcionaba','malo',
      'hablar con alguien','asistente','agente'
    ],
  
    // Huella
    menu_huella: [
      'mi huella','huella verde','huellita','mi impacto','mi reciclaje',
      'cuanto recicle','cuánto reciclé','che cuanto recicle','cuanto llevo','cuánto llevo',
      'cuanta basura junte','cuánta basura junté','estadisticas huella','estadísticas huella'
    ],
    huella_mensual: [
      'huella mensual','este mes','de este mes','kg este mes','kilos este mes',
      'cuanto recicle este mes','cuánto reciclé este mes','cuanto junte este mes','cuánta basura junté este mes'
    ],
    huella_acumulada: [
      'huella total','total acumulada','acumulada','suma total','mi total','cuanto llevo en total',
      'todo lo reciclado','cuánto reciclé en total','kg acumulados','kilos acumulados'
    ],
    huella_verde: [
      'que es la huella','qué es la huella','que significa la huella','qué significa la huella',
      'que es la huella verde','qué es la huella verde','significado huella','definicion huella',
      'definición huella','explicame huella','explicame la huella','explicación huella'
    ],
    huella_mejorar: [
      'como mejorar mi huella','cómo mejorar mi huella','consejos huella','tips huella',
      'mejorar huella','como la mejoro','cómo la mejoro','que hacer para mejorar la huella',
      'qué hacer para mejorar la huella','recomendaciones huella'
    ],
  
    // Funcionamiento / separar
    menu_funcionamiento: ['como funciona', 'que es ekokai','significado'],
    como_participo: ['como puedo participar', 'como puedo ayudar', 'como puedo ayudar a ekokai', 'como ganar cupones','como se calculan los cupones'],
    que_gano: ['que gano','que premios','que puedo ganar','que puedo ganar con ekokai'],
    calculo_cupones: ['como calcuan los cupones','cuanto vale un cupon', 'cuanto acumulo', 'cuanto puedo acumular'],
   
    menu_separar: ['como separar', 'como limpiar','que residuos'],
    que_residuos: ['que residuos aceptan', 'aceptan','correctos'],
    como_limpio: ['como limpio', 'como limpiar'],
    que_prohibidos: ['que residuos no aceptan', 'prohibidos','incorrectos'],
  
    // Problemas
    problema: ['problema','reclamo','queja','tuve un problema','no puedo ver','no veo','no aparecen mis cupones','no veo mi huella'],
    menu_problema: ['problemas','reportar problema','necesito ayuda','no veo mis datos','no veo mis cupones','no veo mi huella'],
    no_ver: ['no veo','no puedo ver','no aparecen','no aparecen mis cupones','no veo mis cupones','no veo mi huella','no veo mis datos'],
    otro_problema: ['otro problema','ninguna de las opciones','algo diferente','algo distinto']
  };
  
  module.exports = { LOCAL_LEX };
  