# ROADMAP — Lo que viene en Mentalgym

Documento vivo. Describe hacia dónde crece la app, con qué criterio se agregan ejercicios y qué hacer cuando el progreso se detiene.

## 1. Principio rector

Mentalgym entrena **velocidad de generación verbal bajo restricción**, no conocimiento. Cada decisión se mide contra tres reglas:

1. **Un toque por estímulo.** Si un ejercicio necesita dos decisiones, no entra tal como está.
2. **Silencio total.** Sin audio, sin micrófono, sin permisos. Es lo que permite entrenar en el metro.
3. **Sin techo de contenido.** Lo que se puede generar, se genera. Lo que se cura a mano, se espacia en el tiempo.

Toda propuesta futura se acepta o se rechaza contra estas tres.

## 2. Estado actual

| Modo | Demanda | Verificación del acierto |
|---|---|---|
| Fluidez dual | Generación con doble restricción | Auto-reportada |
| Asociaciones remotas | Generación por convergencia | Revisión opcional |
| Anti-cliché | Generación con inhibición | Auto-reportada |
| Alternancia | Generación con cambio de regla | Auto-reportada |
| Verificación | Reconocimiento semántico | **Objetiva** |
| Memoria de trabajo | Actualización en memoria | **Objetiva** |

Dos de seis tienen verdad de referencia. El resto mide velocidad, no corrección.

## 3. Los cuatro vacíos

**Rigor de medición.** Cuatro modos dependen de tu honestidad. No hay forma de distinguir "fui rápido y acerté" de "toqué sin pensar". Es el vacío más caro, porque contamina todos los demás datos.

**Alternancia sin verdad.** El coste de cambio actual se calcula sobre tiempos auto-reportados. Un número que no se puede contrastar con acierto es una anécdota.

**Inhibición sin conflicto real.** Verificación mide retener el dedo. No mide resistir una respuesta automática que compite.

**Transferencia.** Nada en la app comprueba si eres más rápido hablando. Se puede mejorar el TRM interno durante meses sin mover la habilidad real.

## 4. Ejercicios candidatos

Ordenados por relación entre valor y costo.

### 4.1 Alternancia verificable — prioridad alta

El mismo pool de categorías de Verificación, pero la regla cambia cada 1 a 3 ítems: "¿es animal?", "¿es instrumento?", "¿es fruta?". Tocas si la palabra cumple la regla activa.

- **Qué añade:** coste de cambio objetivo. Por primera vez `RT(ensayo cambiado) − RT(ensayo repetido)` se calcula sobre aciertos verificables.
- **Costo de contenido:** cero. Reutiliza `GONOGO`.
- **Riesgo:** la regla visible añade carga de lectura. Mitigación: la categoría se muestra como etiqueta fija y el cambio se marca con un destello en el borde.

### 4.2 Repaso espaciado — prioridad alta

Sesión corta compuesta solo por los ítems cuyo `due` ya venció. Sin modo nuevo de interacción: es un compositor distinto.

- **Qué añade:** resuelve el techo de contenido de Asociaciones y Anti-cliché sin escribir un solo trío nuevo. Convierte la repetición en método.
- **Costo:** bajo, la infraestructura de repetición ya existe y no se está usando.
- **Riesgo:** si no hay ítems vencidos, la sesión queda vacía. Mitigación: completar con ítems nuevos hasta un mínimo de 7.

### 4.3 Stroop semántico — prioridad media

Cada categoría tiene un color asignado. Se muestra una palabra de la categoría A dentro de un marco del color de la categoría B. Tocas solo si coinciden.

- **Qué añade:** interferencia real entre dos señales que compiten, con acierto objetivo.
- **Costo:** bajo en contenido, medio en interfaz.
- **Riesgo:** depende del color. Obligatorio añadir una forma redundante por categoría para no excluir daltonismo; la forma no elimina el conflicto en quien ve color.

### 4.4 Señuelos en memoria de trabajo — prioridad media

En vez de solo "repite la de dos atrás", se intercalan señuelos: palabras que coinciden con la de uno o tres atrás.

- **Qué añade:** es el eje de dificultad estándar del n-back real. Sin señuelos, el modo se resuelve con atención superficial.
- **Costo:** mínimo.
- **Riesgo:** ninguno relevante.

### 4.5 Selección entre tres — prioridad baja

Tres palabras en pantalla, una cumple el atributo. Tocas la correcta.

- **Qué añade:** denominación con verificación y precisión espacial.
- **Costo:** alto. Rompe la regla de un solo botón y obliga a repensar el deck.
- **Riesgo:** cambia el modelo de interacción de toda la app por un solo modo.

### Descartados

- **Validación con diccionario offline.** Pesa varios megas y convierte una app de 40 KB en una de 3 MB.
- **Cualquier forma de voz.** Rompe la promesa del modo silencioso.
- **Backend, cuentas o ranking.** Añade dependencia y elimina el offline real.
- **Puntos, medallas y niveles de juego.** La racha es el único motivador externo. Más capas convierten el entrenamiento en una tarea de mantenimiento.

## 5. Protocolo de meseta

Una meseta no es un fallo. Es la señal de que el formato ya se automatizó y el estímulo dejó de exigir.

### Señales

- TRM plano durante 6 sesiones o más.
- Acierto por encima del 90% en todos los modos.
- Sensación de piloto automático.

### Pasos, en este orden

1. **Descarta sobrecarga.** Si además de plano el TRM empeora y los fallos suben, no es meseta: es fatiga. Una semana a un nivel menos y una sola sesión diaria.
2. **Comprueba la transferencia.** Haz el benchmark externo de cinco minutos: palabras con una letra en 60 segundos, contadas a mano. Si el número externo sube y el interno no, no hay meseta real.
3. **Mueve un solo eje.** Cambia una variable por vez y mantenla tres sesiones. Si mueves todo a la vez no sabrás qué funcionó.
4. **Rota el foco.** Una semana con el modo de peor acierto como eje, bajando el peso de los demás.
5. **Si sigue plano, cambia la demanda, no la velocidad.** Acortar la ventana tiene un piso fisiológico. Añadir complejidad no.

### Ejes de dificultad por modo

| Modo | Eje 1 | Eje 2 | Eje 3 |
|---|---|---|---|
| Fluidez dual | Letra menos frecuente | Atributo más abstracto | Exigir tres condiciones |
| Asociaciones | Mayor distancia semántica | Cuarta palabra intrusa | Respuesta de dos pasos |
| Anti-cliché | Cuatro prohibidas | Prohibidas más cercanas | Prohibir la categoría entera |
| Alternancia | Menos repeticiones antes del cambio | Cuarta regla | Reglas que se solapan |
| Verificación | Subir la tasa de acierto esperada | Acortar ventana | Distractor de categoría vecina |
| Memoria | Pasar de 1-back a 2-back | Señuelos | Acortar ventana |

## 6. Variedad estructural

Más ejercicios no es la única palanca. También lo es cómo se combinan.

- **Plantillas de sesión.** Express de 7 ítems para días ocupados, estándar de 21, profunda de 42 una vez por semana.
- **Reto semanal determinista.** Una sesión con semilla fija derivada del número de semana. Mismos ítems para ti siempre, así puedes comparar tu intento de esta semana contra el de la anterior.
- **Bloques de contraste.** Alternar un bloque rápido con uno lento rompe el hábito de cronometraje interno.
- **Adaptación dentro de la sesión.** Si un bloque baja del 50% de acierto, el siguiente bloque del mismo modo abre la ventana. Se registra como sesión adaptada para no contaminar comparaciones.

## 7. Datos y progreso

- **Sesión de control semanal.** Una vez por semana, responder escribiendo en lugar de tocar. Es la única forma de medir la deriva entre lo que crees que generaste y lo que generaste.
- **Métricas nuevas:** d' en Verificación, coste de cambio objetivo en Alternancia verificable, acierto por nivel de n en Memoria.
- **Línea base móvil** por modo, en lugar de comparar siempre contra las primeras 20 respuestas.
- **Exportación automática sugerida** cada 30 sesiones, con un toque para aceptar.

## 8. Orden de implementación

| Entrega | Contenido | Por qué primero |
|---|---|---|
| 1 | Repaso espaciado | Resuelve el techo de contenido con infraestructura ya existente |
| 2 | Alternancia verificable | Primer coste de cambio con verdad de referencia |
| 3 | Señuelos en memoria | Convierte un modo fácil en uno difícil sin contenido nuevo |
| 4 | Ejes de dificultad por modo | Ataca la meseta de forma sistemática |
| 5 | Sesión de control semanal | Cierra el vacío de rigor |
| 6 | Stroop semántico | Inhibición con conflicto real |

## 9. Criterio de aceptación

Cada entrega se considera terminada cuando: funciona sin conexión tras la primera carga, mantiene 60 FPS en el temporizador, no introduce violaciones de accesibilidad, no añade dependencias externas, y no rompe la comparabilidad de las sesiones anteriores sin marcarlo como versión adaptada.
