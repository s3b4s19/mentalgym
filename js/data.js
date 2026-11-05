/**
 * Content banks for Mentalgym.
 * Everything here is static, offline and dependency-free.
 * Constraint pools are kept independent so the session composer can generate
 * combinations instead of replaying a fixed list.
 */

export const LETTERS = ['A', 'C', 'D', 'E', 'F', 'G', 'L', 'M', 'P', 'R', 'S', 'T', 'V'];

export const CATEGORIES = {
  1: ['animales', 'frutas', 'colores', 'ropa', 'muebles', 'instrumentos', 'cosas de cocina', 'partes del cuerpo'],
  2: ['ciudades', 'oficios', 'deportes', 'herramientas', 'bebidas', 'árboles', 'países', 'animales marinos'],
  3: ['emociones', 'palabras abstractas', 'conceptos de física', 'palabras que empiezan por vocal', 'términos legales', 'verbos de movimiento', 'palabras agudas'],
};

export const ATTRIBUTES = {
  1: ['algo que cabe en una mano', 'algo que rueda', 'algo frío', 'algo blando', 'algo que se come', 'algo que brilla'],
  2: ['algo que se rompe fácil', 'algo que hace ruido', 'algo que se compra en una farmacia', 'algo que se guarda en un cajón', 'algo que huele fuerte', 'algo que se presta'],
  3: ['algo que no tiene forma', 'algo que no se puede tocar', 'algo que caduca', 'algo que solo existe en plural', 'algo invisible', 'algo que se mide en segundos'],
};

/**
 * Remote association triads.
 * Each entry accepts several valid bridges, because free association admits
 * synonyms. `answers` is used for the optional review pass only.
 */
export const RAT = [
  { level: 1, cue: ['pan', 'mantequilla', 'cuchillo'], answers: ['untar'] },
  { level: 1, cue: ['sol', 'playa', 'vacaciones'], answers: ['verano'] },
  { level: 1, cue: ['café', 'taza', 'mañana'], answers: ['desayuno'] },
  { level: 1, cue: ['cama', 'almohada', 'sueño'], answers: ['dormir'] },
  { level: 1, cue: ['mar', 'ola', 'arena'], answers: ['playa'] },
  { level: 1, cue: ['fuego', 'humo', 'rojo'], answers: ['llama'] },
  { level: 1, cue: ['nieve', 'frío', 'blanco'], answers: ['invierno'] },
  { level: 1, cue: ['libro', 'hoja', 'biblioteca'], answers: ['página'] },
  { level: 1, cue: ['reloj', 'aguja', 'tiempo'], answers: ['hora'] },
  { level: 1, cue: ['escuela', 'pizarra', 'profesor'], answers: ['clase'] },
  { level: 1, cue: ['agua', 'jabón', 'espuma'], answers: ['lavar'] },
  { level: 1, cue: ['coche', 'rueda', 'carretera'], answers: ['conducir', 'viaje'] },
  { level: 2, cue: ['árbol', 'hoja', 'otoño'], answers: ['caer', 'rama'] },
  { level: 2, cue: ['sangre', 'corazón', 'rojo'], answers: ['latido', 'bombear'] },
  { level: 2, cue: ['viento', 'nube', 'gris'], answers: ['tormenta'] },
  { level: 2, cue: ['llave', 'puerta', 'cerradura'], answers: ['abrir'] },
  { level: 2, cue: ['zapato', 'cordón', 'pie'], answers: ['atarse', 'anudar'] },
  { level: 2, cue: ['moneda', 'bolsillo', 'comprar'], answers: ['dinero'] },
  { level: 2, cue: ['abeja', 'miel', 'flor'], answers: ['polen'] },
  { level: 2, cue: ['diente', 'cepillo', 'pasta'], answers: ['limpiar'] },
  { level: 2, cue: ['cuerda', 'nudo', 'atar'], answers: ['lazo'] },
  { level: 2, cue: ['botella', 'agua', 'sed'], answers: ['beber'] },
  { level: 2, cue: ['mapa', 'brújula', 'viaje'], answers: ['norte'] },
  { level: 2, cue: ['semilla', 'tierra', 'agua'], answers: ['crecer', 'brotar'] },
  { level: 2, cue: ['voz', 'canción', 'micrófono'], answers: ['cantar'] },
  { level: 2, cue: ['ventana', 'cristal', 'luz'], answers: ['transparente'] },
  { level: 3, cue: ['pluma', 'peso', 'papel'], answers: ['ligero'] },
  { level: 3, cue: ['cuerda', 'flojo', 'dinero'], answers: ['suelto'] },
  { level: 3, cue: ['huracán', 'aguja', 'cerradura'], answers: ['ojo'] },
  { level: 3, cue: ['cara', 'reloj', 'moneda'], answers: ['dos'] },
  { level: 3, cue: ['diente', 'montaña', 'árbol'], answers: ['raíz'] },
  { level: 3, cue: ['puerto', 'clave', 'ratón'], answers: ['usb', 'conexión'] },
  { level: 3, cue: ['peso', 'corona', 'silla'], answers: ['real'] },
  { level: 3, cue: ['blanco', 'negro', 'gris'], answers: ['color'] },
  { level: 3, cue: ['pelo', 'gato', 'suerte'], answers: ['negro'] },
  { level: 3, cue: ['tiempo', 'dinero', 'gasolina'], answers: ['gastar', 'perder'] },
];

/**
 * Anti-cliche bank. `banned` holds the three most automatic associations.
 */
export const INHIBIT = [
  { level: 1, word: 'playa', banned: ['arena', 'mar', 'sol'] },
  { level: 1, word: 'noche', banned: ['luna', 'estrellas', 'oscuro'] },
  { level: 1, word: 'perro', banned: ['ladrido', 'hueso', 'fiel'] },
  { level: 1, word: 'café', banned: ['negro', 'amargo', 'mañana'] },
  { level: 1, word: 'lluvia', banned: ['paraguas', 'mojado', 'agua'] },
  { level: 1, word: 'escuela', banned: ['profesor', 'alumnos', 'clase'] },
  { level: 1, word: 'cine', banned: ['película', 'palomitas', 'pantalla'] },
  { level: 1, word: 'invierno', banned: ['frío', 'nieve', 'abrigo'] },
  { level: 1, word: 'verano', banned: ['calor', 'playa', 'vacaciones'] },
  { level: 1, word: 'libro', banned: ['páginas', 'leer', 'historia'] },
  { level: 2, word: 'rojo', banned: ['sangre', 'pasión', 'peligro'] },
  { level: 2, word: 'muerte', banned: ['negro', 'triste', 'final'] },
  { level: 2, word: 'dinero', banned: ['rico', 'billetes', 'banco'] },
  { level: 2, word: 'amor', banned: ['corazón', 'pareja', 'beso'] },
  { level: 2, word: 'casa', banned: ['hogar', 'familia', 'techo'] },
  { level: 2, word: 'agua', banned: ['transparente', 'beber', 'río'] },
  { level: 2, word: 'fuego', banned: ['calor', 'rojo', 'quemar'] },
  { level: 2, word: 'coche', banned: ['ruedas', 'motor', 'conducir'] },
  { level: 2, word: 'lunes', banned: ['trabajo', 'pereza', 'semana'] },
  { level: 2, word: 'cumpleaños', banned: ['tarta', 'regalos', 'velas'] },
  { level: 3, word: 'médico', banned: ['bata', 'hospital', 'enfermo'] },
  { level: 3, word: 'música', banned: ['notas', 'ritmo', 'canción'] },
  { level: 3, word: 'mariposa', banned: ['alas', 'colores', 'volar'] },
  { level: 3, word: 'montaña', banned: ['alta', 'nieve', 'escalar'] },
  { level: 3, word: 'silencio', banned: ['callado', 'ruido', 'nada'] },
  { level: 3, word: 'espejo', banned: ['reflejo', 'cristal', 'imagen'] },
  { level: 3, word: 'zapatos', banned: ['pies', 'cordones', 'caminar'] },
  { level: 3, word: 'ventana', banned: ['cristal', 'luz', 'abrir'] },
  { level: 3, word: 'tiempo', banned: ['reloj', 'rápido', 'dinero'] },
  { level: 3, word: 'trabajo', banned: ['dinero', 'jefe', 'oficina'] },
];

/**
 * Membership pools for the verification exercise.
 * A No-Go trial always draws its word from a different category, so every
 * trial has one unambiguous correct answer.
 */
export const GONOGO = {
  animales: ['perro', 'gato', 'caballo', 'tigre', 'ballena', 'águila', 'ratón', 'serpiente', 'vaca', 'delfín'],
  frutas: ['manzana', 'pera', 'plátano', 'naranja', 'uva', 'sandía', 'melón', 'cereza', 'piña', 'mango'],
  muebles: ['silla', 'mesa', 'cama', 'sofá', 'armario', 'estantería', 'cómoda', 'escritorio', 'taburete', 'butaca'],
  instrumentos: ['guitarra', 'piano', 'violín', 'tambor', 'flauta', 'trompeta', 'arpa', 'saxofón', 'chelo', 'clarinete'],
  herramientas: ['martillo', 'destornillador', 'sierra', 'taladro', 'alicate', 'cincel', 'nivel', 'lijadora', 'formón', 'mazo'],
  deportes: ['fútbol', 'tenis', 'natación', 'baloncesto', 'ciclismo', 'boxeo', 'atletismo', 'golf', 'voleibol', 'esquí'],
  colores: ['rojo', 'azul', 'verde', 'amarillo', 'negro', 'blanco', 'violeta', 'naranja', 'gris', 'marrón'],
  vehículos: ['coche', 'bicicleta', 'moto', 'tren', 'avión', 'barco', 'autobús', 'camión', 'helicóptero', 'tranvía'],
  oficios: ['médico', 'profesor', 'carpintero', 'abogado', 'bombero', 'panadero', 'fontanero', 'periodista', 'arquitecto', 'enfermero'],
};

/** Neutral single words for the working-memory sequence. */
export const NBACK_WORDS = [
  'perro', 'mesa', 'río', 'luna', 'tren', 'pan', 'luz', 'mar', 'sol', 'casa',
  'mano', 'flor', 'puerta', 'silla', 'vino', 'cielo', 'piedra', 'libro', 'agua',
  'fuego', 'nube', 'tierra', 'voz', 'reloj',
];

/** Antonym pairs used by the alternating-rules exercise. */
export const ANTONYMS = [
  { word: 'frío', answers: ['caliente', 'calor'] },
  { word: 'caliente', answers: ['frío'] },
  { word: 'alto', answers: ['bajo'] },
  { word: 'grande', answers: ['pequeño'] },
  { word: 'rápido', answers: ['lento'] },
  { word: 'día', answers: ['noche'] },
  { word: 'luz', answers: ['oscuridad', 'sombra'] },
  { word: 'amor', answers: ['odio'] },
  { word: 'abrir', answers: ['cerrar'] },
  { word: 'subir', answers: ['bajar'] },
  { word: 'entrar', answers: ['salir'] },
  { word: 'blanco', answers: ['negro'] },
  { word: 'rico', answers: ['pobre'] },
  { word: 'fuerte', answers: ['débil'] },
  { word: 'joven', answers: ['viejo'] },
  { word: 'dentro', answers: ['fuera'] },
  { word: 'antes', answers: ['después'] },
  { word: 'lleno', answers: ['vacío'] },
  { word: 'fácil', answers: ['difícil'] },
  { word: 'cerca', answers: ['lejos'] },
  { word: 'ganar', answers: ['perder'] },
  { word: 'comprar', answers: ['vender'] },
  { word: 'recordar', answers: ['olvidar'] },
  { word: 'dormir', answers: ['despertar'] },
  { word: 'reír', answers: ['llorar'] },
  { word: 'paz', answers: ['guerra'] },
  { word: 'vida', answers: ['muerte'] },
  { word: 'principio', answers: ['final'] },
  { word: 'barato', answers: ['caro'] },
  { word: 'temprano', answers: ['tarde'] },
];

/** Words used as anchors. Filtered at runtime by a readable last letter. */
export const SWITCH_WORDS = [
  'casa', 'perro', 'mesa', 'libro', 'noche', 'coche', 'motor', 'color', 'canción',
  'ventana', 'zapato', 'cuchara', 'tenedor', 'sillón', 'jardín', 'pastel', 'bigote',
  'camión', 'iguana', 'sombrero', 'pared', 'coral', 'tambor', 'canal', 'reloj',
];

/** Objects with a clear use, for the attribute rule. */
export const SWITCH_OBJECTS = [
  'martillo', 'tijera', 'cuchillo', 'ventilador', 'almohada', 'escalera', 'paraguas',
  'linterna', 'cuchara', 'cepillo', 'botella', 'silla', 'espejo', 'reloj', 'llave',
  'libro', 'zapato', 'gafas', 'mochila', 'vela',
];

export const SWITCH_RULES = ['phonetic', 'antonym', 'attribute'];
