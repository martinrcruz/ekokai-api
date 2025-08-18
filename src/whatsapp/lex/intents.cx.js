// whatsapp/lex/intents.cx.js
const INTENT_LEX = {
  // ---------------------------
  // CUPONERA
  // ---------------------------
  consulta_cupones: [
    'cupones','cuponera','canjes','canjear cupones','ver cupones','promos',
    'las promos', 'promo vigente', 'promociones', 'beneficios', 'descuentitos',
    'mis promos', 'mis promo', 'mis promo’', 'mis beneficios',
    'cuponcito', 'cuponcitos', 'vaucher', 'voucher', 'vauchers',
    'che las promos', 'ke promos hay', 'q promos hay', 'opsiones de promo',
    'ke onda las promos', 'ahi nomas las promos', 'mostrame promos'
  ],

  canjear_cupon: [
    'canjear','canjear cupón','canjear cupon','canjear premio','cangear','hacer canje',
    'promo','hacer valer','cambiazo','hacer efectivo','donde tomo el descuento',
    'como cangeo','como cobro','komo kobro','komo cobro','la promo','aplicar','aplikar',
    'chapar el voucher','regalo','retirar','bono','canjear cuponcito','activar',
    'cangear el cupon','canjiar el cupon','como lo cangeo','kiero canjear','quiero cangear',
    'hacer el cange','aplikar el kupon','meter el cupon','poner el cupon','usar el voucher',
    'validar el vauchér','hacer valer la promo','dónde hago el cange','a donde canjeo',
    'canjeo el cupon','canjear ya la promo','validar vouchercito'
  ],

  ver_cupon: [
    'mis cupones','cupones activos','ver mis cupones',
    'listar mis cupones','mostrar cupones','qué cupones tengo',
    'ver mis beneficios','mis promos disponibles','ver cupones guardados',
    'consultar cupones','mis kupones','ver mis kuponcitos',
    'che mostrame mis cupones','qué tengo en la cuponera','ver mis vouchers',
    'tengo cupones?', 'mis promos vigentes', 'ver mis promo’',
    'ke cupones tengo', 'q cupones tengo', 'apareze mis cupones',
    'ver lo ke tengo pa canjear'
  ],

  ver_catalogo: [
    'catálogo','catalogo','ver catálogo','ver premios disponibles',
    'abrir catálogo','ver el listado de premios','mostrar catálogo',
    'quiero ver el catálogo','ver opciones de canje',
    'cataloguito','katalogo','catálogo de premios','catálogo de canjes',
    'qué hay en el catálogo','vichar catálogo','vichar los premios',
    'ver el muestrario','ke opsiones hay en el catálogo'
  ],

  como_canjear: [
    'cómo canjear','como canjear','pasos para canjear','como va el cupon','hacer valer',
    'como usar','hacer efectivo','truco pa cambiar','pinchar la promo',
    'komo canjear','como se canjea','como hago pa canjear','como se usa el cupon',
    'como lo meto','como lo aplico','pasito a pasito del canje','tutorial del canje',
    'pasos del cange','che explicame el canje'
  ],

  problema_cupon: [
    'problema con cupón','cupón no funciona','no llegó cupón','qr no funciona',
    'no me toma el cupón','cupón inválido','me rechaza el cupón','no aplica el descuento',
    'no aparece el cupón','error al canjear','drama con el cupon','probema con el kupon',
    'quilombo con el cupon','el qr no lee','me tira error el cupon','no me lo valida',
    'no me lo acepta', 'se buguea al canjear','no me llegó el cupon','se me cayó el canje',
    'me dice invalido','no anda el vauchér','apareze error kupon'
  ],

  // ---------------------------
  // ECOPUNTOS
  // ---------------------------
  menu_ecopunto: [
    'ecopunto','ecopuntos','puntos verdes','punto verde',
    'info ecopunto','sobre los ecopuntos','quiero reciclar',
    'los puntitos verdes','dónde reciclo','como es lo del punto verde',
    'che ecopunto','tema ecopunto','ayuda con ecopunto','ke onda ecopunto'
  ],

  ubicacion_ecopunto: [
    'ubicación ecopunto','dónde queda ecopunto','mapa ecopunto','dirección ecopunto',
    'cómo llego al ecopunto','ecopunto más cercano','ubicación punto verde',
    'dónde está el punto verde','dónde queda el punto','por dónde andan',
    'la dire del ecopunto','pasame la ubicación','mandame la ubi',
    'ubicame el punto verde','como llegar al punto','mapita del ecopunto',
    'ubi del punto verde'
  ],

  horario_ecopunto: [
    'horario ecopunto','que reciben','qué reciben','materiales ecopunto','reciclar',
    'a qué hora atienden','cuándo abren','horarios de atención',
    'horario punto verde','a qué hora cierran','horario hoy',
    'horario fin de semana','a ke hora estan','cuando laburan',
    'horario sab y dom','estan abiertos ahora','cierran temprano?',
    'abren feriados?','qué horario manejan','hasta qué hora'
  ],

  materiales_ecopunto: [
    'materiales aceptados','qué se puede dejar','qué no reciben',
    'qué materiales van','qué reciben en el ecopunto','qué se deposita',
    'qué entra y qué no','materiales permitidos','que cosas van',
    'entra el plastico?','llevan vidrio?','se acepta carton?','latas van?',
    'qué onda con los materiales','aceptan tetra?','va telgopor?','styrofoam va?'
  ],

  problema_ecopunto: [
    'problema ecopunto','reclamo ecopunto','queja ecopunto',
    'probema en el punto verde','me atendieron mal en el ecopunto',
    'drama con el punto verde','algo no anda en el ecopunto',
    'no me pinta esa opcion del punto','ni a palos es eso—tengo problema',
    'me pasa otra cosa distinta en el ecopunto'
  ],

  // ---------------------------
  // HUELLA VERDE
  // ---------------------------
  menu_huella: [
    'mi huella','huella verde','huellita','mi impacto','mi reciclaje',
    'cuanto recicle','cuánto reciclé','che cuanto recicle','cuanto llevo','cuánto llevo',
    'cuanta basura junte','cuánta basura junté','estadisticas huella','estadísticas huella',
    'mi huellita eco','mi data de reciclaje','qué tan verde voy',
    'mi progreso eco','mi historial eco'
  ],

  huella_mensual: [
    'huella mensual','este mes','de este mes','kg este mes','kilos este mes',
    'cuanto recicle este mes','cuánto reciclé este mes','cuanto junte este mes','cuánta basura junté este mes',
    'este mes cómo vengo','lo del mes','lo juntado este mes','cuanto hice este mes',
    'mi total del mes','mi resumen mensual','q llevo este mes','kilos del mes'
  ],

  huella_acumulada: [
    'huella total','total acumulada','acumulada','suma total','mi total','cuanto llevo en total',
    'todo lo reciclado','cuánto reciclé en total','kg acumulados','kilos acumulados',
    'todo lo que junte','mi totalazo','acumulado general','cuanto llevo acumulado',
    'saldo eco total','global acumulado','mi total de siempre','todo mi reciclaje'
  ],

  huella_verde: [
    'que es la huella','qué es la huella','que significa la huella','qué significa la huella',
    'que es la huella verde','qué es la huella verde','significado huella','definicion huella',
    'definición huella','explicame huella','explicame la huella','explicación huella',
    'ke onda la huella','de qué va la huella','que es eso de huella verde',
    'explicame cortito la huella'
  ],

  huella_mejorar: [
    'como mejorar mi huella','cómo mejorar mi huella','consejos huella','tips huella',
    'mejorar huella','como la mejoro','cómo la mejoro','que hacer para mejorar la huella',
    'qué hacer para mejorar la huella','recomendaciones huella','como mejorar','che como es el impacto',
    'como achicar','dame tips','reducir','guella bajar','consejo pa reducir','guia pa mejorar el impacto',
    'trucos pa bajar la guella','ideas pa reducir','kiero bajar la huella que hago',
    'trucos pa reducir','recomendaciones pa bajar'
  ],

  // ---------------------------
  // FUNCIONAMIENTO / PARTICIPAR / PREMIOS / CÁLCULO
  // ---------------------------
  menu_funcionamiento: [
    'como funciona', 'que es ekokai','significado',
    'como labura ekokai','que onda ekokai','como es esto de ekokai',
    'explicame ekokai','de qué se trata ekokai'
  ],

  como_participo: [
    'como puedo participar', 'como puedo ayudar', 'como puedo ayudar a ekokai',
    'komo participo','komo participar','komo gano','komo ser parte','ser parte',
    'como puedo','como gano','pa ganar cupones','como se acumulan los puntos',
    'che ke onda pa tener premios','como obtener','como me meto','que hago pa participar',
    'como me uno','komo me uno','como me sumo','como me zumo','que onda pa anotarse',
    'como me prendo','como consigo','komo obtener premios','como me engancho',
    'quiero ser parte','como le entro','que pasos sigo pa participar',
    'che me anoto','dame info quiero participar'
  ],

  que_gano: [
    'que gano','que premios','que puedo ganar','que puedo ganar con ekokai',
    'ke dan','que dan','ke corresponde','ke beneficios','que regalo','que obtengo',
    'que me toca','ke me toka','que me llevo','ke me llevo','ke puedo llevarme'
  ],

  calculo_cupones: [
    'como calculan','komo kalkulan','komo calculan','calculo','kalculo','kalkulo',
    'cuanto ekivale','kuanto ekivale','equivale','suman','valor','balor','decime el calulo',
    'asignan','hacignan','como acumulo','akumulo','puntaje','como sacan valor','ekivale',
    'equivale', 'como suman los cupones','como lo cuentan', 'komo lo kuentan','cuanto representa'
  ],

  // ---------------------------
  // SEPARAR / LIMPIAR / PROHIBIDOS
  // ---------------------------
  menu_separar: [
    'como separar', 'como limpiar','que residuos','guía de separación',
    'cómo preparo los residuos','tips de separación','cómo lo separo','cómo lo acomodo',
    'cómo lo preparo pa llevar','pasos pa separar','consejos pa separar'
  ],

  que_residuos: [
    'que residuos aceptan', 'aceptan','correctos','q reciben','q resiven','ke materiale',
    'que materiales','ke cosas','cartones','envases','vidrios','papeles','plastikos',
    'puede','llevar','botellas','boteya','agarran','permitido','dejar','tirar',
    'que es reciclable'
  ],

  como_limpio: [
    'como limpio', 'como limpiar','como limpio envases','komo limpio envaces',
    'limpiar plastiko','limpiar plastico','limpiar basura','limpiar mugre',
    'decime como limpiar','saber como limpiar','pasos pa limpiar',
    'ke pasos sigo pa limpiar','como dejar envases limpios','komo higenizar',
    'como higenizar','como preparar el plastico','como sacar olor del envase',
    'como lavar','lavar envase','labar enbase','enjuagar','enguagar','preparan latas',
    'prepara plastico', 'kitar restos','quitar restos','limpiar los potes',
    'preparan los envases','como preparo','komo preparo'
  ],

  que_prohibidos: [
    'que residuos no aceptan', 'prohibidos','incorrectos','q no','qe no','que no','se puede',
    'que no tirar','que no va','ke no va','no aceptan','no basura','no desecho','no mugre',
    'quimicos','kimicos','ke no meter','no llevar','no aseptan','no sirven','pilas','baterias',
    'q no se resiven','que no se resibe','k no me van a resivir','q no se resikla','q no',
    'focos','corrosivo','dañino'
  ],

  // ---------------------------
  // PROBLEMAS / NO VER / OTRO PROBLEMA
  // ---------------------------
  problema: [
    'problema','reclamo','queja','no me anda','no funciona','ayuda con problema',
    'tuve un problema','algo falló','algo fallo','tengo un drama','se rompió','me falla',
    'se tilda','anda mal','no tira','no responde','me crashea','probema'
  ],

  menu_problema: [
    'problemas','tuve un problema','reportar problema','necesito ayuda',
    'no puedo ver mis cupones','no veo mi huella','no veo mis datos',
    'tengo un tema','algo no me cierra','quiero reportar','tengo un inconveniente',
    'ayudita porfa','no es eso lo mio','no me pinta esa opcion',
    'no es lo ke tengo','no me va ninguna','ni a palos es eso',
    'me pasa otra cosa distinta'
  ],

  no_ver: [
    'no veo','no puedo ver','no aparecen mis cupones','no veo mis cupones',
    'no veo mi huella','no aparece mi huella','no veo mis datos','no figuran',
    'no aparecen','no estan','no veo premios','no carga','no info','no muestra',
    'no encuentro','no sale kupones','no aparece la guella','no sale nada'
  ],

  otro_problema: [
    'otro problema','no es eso','ninguna de las opciones','algo distinto',
    'algo diferente','otra cosa','algo mas','distinto'
  ],

  // ---------------------------
  // VOLVER / PRINCIPAL
  // ---------------------------
  menu_volver: [
    'menú','menu','volver','atrás','inicio','principal',
    'volvamos','tirame para atrás','volvete','me quiero volver',
    'mandame a la anterior'
  ],

  menu_principal: [
    'menú principal','menu principal','inicio','home',
    'volver al inicio','ir al principal','vamos al inicio',
    'mandame al menú','al menú principal','volver al home',
    'arranquemos de nuevo'
  ]
};

function inferIntentFromText(text) {
  const t = String(text || '').toLowerCase();
  for (const [intent, keys] of Object.entries(INTENT_LEX)) {
    for (const k of keys) {
      if (t.includes(k.toLowerCase())) return intent;
    }
  }
  return null;
}

module.exports = { INTENT_LEX, inferIntentFromText };
