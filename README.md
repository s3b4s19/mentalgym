# Mentalgym

Entrenador de agilidad verbal, velocidad de procesamiento y flexibilidad
cognitiva. PWA sin dependencias, sin audio y sin permisos: funciona offline
desde el primer arranque.

## Despliegue en GitHub Pages

La app debe publicarse en un repositorio llamado `mentalgym` para que la URL
quede en `https://<usuario>.github.io/mentalgym/`.

1. Crea el repositorio con ese nombre exacto.
2. Sube el contenido de este directorio a la raíz de la rama principal. Los
   archivos van en la raíz, no dentro de una subcarpeta.
3. En Settings, Pages, elige Deploy from a branch, rama principal, carpeta `/`.
4. Abre `https://<usuario>.github.io/mentalgym/` en Chrome Android e instala
   desde el menú.

Todas las rutas del proyecto son relativas (`./`), así que el mismo código
funciona en la raíz del dominio o en cualquier subcarpeta. No hay ninguna ruta
absoluta que atar al nombre del repositorio.

## Desarrollo local

Los módulos ES no cargan desde `file://`. Sirve el directorio por HTTP:

```
python -m http.server 4180
```

Y abre `http://localhost:4180/`.

Para probar en una subcarpeta, sirve el directorio bajo `/mentalgym/`. El
Service Worker solo se registra en contextos seguros: `https` o `localhost`.

## Ejercicios

Seis modos, agrupados por el tipo de demanda:

- **Fluidez dual.** Una palabra que empiece por una letra y cumpla una segunda condición.
- **Asociaciones remotas.** La palabra que conecta tres estímulos.
- **Anti-cliché.** Asociar evitando las respuestas automáticas marcadas.
- **Alternancia.** La regla cambia entre fonética, antónimo y uso del objeto.
- **Verificación.** Tocar solo cuando la palabra pertenece a la categoría. Primer modo con acierto verificable.
- **Memoria de trabajo.** Tocar cuando la palabra repite una anterior: 1-back en fácil, 2-back en normal y difícil.

La sesión mixta arma tres bloques de siete ítems eligiendo los modos menos entrenados, de forma que los seis se cubren de forma rotativa. Cada sesión de un solo modo es de veinte ítems.

## Estructura

```
index.html      Shell de la app: cinco vistas, deck táctil, ajustes
manifest.json   Metadatos PWA, rutas relativas
sw.js           Cache-first con revalidación del documento
css/styles.css  Tokens OLED, componentes BEM, animaciones del temporizador
js/app.js       Máquina de estados, motor de sesión, persistencia, métricas
js/data.js      Pools combinatorios y bancos curados
js/haptics.js   Vibration y Wake Lock con detección de capacidad
icons/          Iconos 192, 512 y maskable
```

## Datos

Todo se guarda en `localStorage` del dispositivo. Detalle de los últimos 90
días, agregados diarios permanentes y repetición espaciada a 7, 30, 90 y 180
días para los bancos curados. El progreso compara cada modo contra sí mismo,
nunca contra otro ejercicio, porque el tiempo de un modo no es comparable con
el de otro. La exportación en JSON desde Ajustes es el respaldo: cúbrelo antes
de cambiar de teléfono.

## Actualizaciones

El Service Worker sirve los archivos desde caché y no los revalida en cada
carga, así que cada despliegue con archivos nuevos exige **subir el número de
`CACHE` en `sw.js`** (`mentalgym-v2`, `mentalgym-v3`...). Sin ese cambio el
navegador no detecta un Service Worker nuevo y los usuarios instalados siguen
viendo la versión anterior.

Con el número subido, el Service Worker no toma el control a mitad de sesión:
abre Ajustes y usa Buscar actualización para aplicarlo.
