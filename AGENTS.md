# AGENTS.md - Directrices de Desarrollo Frontend y PWA

Este documento define las reglas técnicas, arquitectónicas y de calidad obligatorias para el desarrollo y modificación de la interfaz PWA en este repositorio.

---

## 1. Rol y Stack Tecnológico

- **Rol:** Desarrollador Web Frontend Senior especializado en PWAs de alto rendimiento y APIs nativas del navegador.
- **Stack Permitido:** HTML5 semántico, CSS3 nativo y JavaScript Vanilla (ES6+).
- **Restricciones:** 
  * Prohibido utilizar frameworks de CSS (Tailwind, Bootstrap, etc.) o librerías/dependencias externas de JS. Todo debe construirse con código nativo limpio.
  * Prohibidos bundlers o transpiladores (Webpack, Vite, Babel). El código debe ser ejecutable directamente por el navegador.

---

## 2. Guía de Estilo Visual y Tono

- **Paleta de Colores:** Diseñado estrictamente para pantallas OLED (Fondo principal `#000000` o `#121212`, texto neutro `#E0E0E0`, acentos funcionales de alto contraste para estados de alerta y temporizadores).
- **Iconografía y Emojis:** 
  * Prohibido el uso de emojis en la interfaz, comentarios o contenido.
  * Usar exclusivamente iconos vectoriales SVG minimalistas e inline.
- **Tipografía y Layout:** Fuentes sans-serif de alta legibilidad del sistema. Layout optimizado para la zona del pulgar (Thumb Zone) en dispositivos móviles en orientación vertical (portrait).

---

## 3. Arquitectura y Estándares de Código

### HTML (Semántica y Accesibilidad)
- Usar etiquetas semánticas correctas (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`). Evitar la acumulación innecesaria de contenedores.
- Garantizar accesibilidad (atributos `aria-*` para componentes de temporizadores y controles táctiles).

### CSS (BEM y Layouts)
- Usar exclusivamente metodología BEM (`.bloque__elemento--modificador`).
- Prohibidos los estilos en línea (`style=""`).
- Usar Custom Properties (`:root`) para la gestión de variables visuales y estados de color dinámicos.
- Estrategia **Mobile-First** utilizando unidades relativas (`rem`, `vh`, `%`).
- Máximo 2 niveles de anidamiento en selectores CSS.

### JavaScript (Vanilla JS y PWA)
- Código modular en archivos de responsabilidad única (`app.js`, `audio.js`, `speech.js`, `data.js`).
- Uso estricto de Web Audio API para efectos de sonido (sin archivos audio externos para evitar latencia).
- Implementación de Service Worker (`sw.js`) con estrategia Cache-First para funcionamiento 100% offline.
- Delegación de eventos para optimización de memoria en dispositivos móviles.

---

## 4. Reglas de Preservación y Prevención de Errores

### Responsividad y Rendimiento Táctil
- Diseño adaptado a vista vertical nativa de Android (`standalone`).
- Cero desbordamiento horizontal (`overflow-x: hidden`).
- Todos los elementos interactivos deben tener un tamaño mínimo de impacto táctil de `48px x 48px`.

### Programación Defensiva en JS
- Validar siempre el soporte de APIs nativas antes de invocarlas (`'webkitSpeechRecognition' in window`, `'vibrate' in navigator`).
- Limpieza obligatoria de intervalos y timers (`clearInterval`, `clearTimeout`) para evitar fugas de memoria (*memory leaks*).

---

## 5. Criterios de Aceptación (Definition of Done)

Un cambio está completo únicamente si:
1. Cumple 100% la metodología BEM y la arquitectura de CSS nativo.
2. Es totalmente funcional en modo offline tras el primer registro del Service Worker.
3. La interfaz mantiene una tasa constante de 60 FPS durante las animaciones de conteo regresivo.
4. Pasa validación manifest PWA sin errores ni advertencias de instalación.
5. No genera errores ni advertencias en la consola del navegador.