# FREEHAND WORLD — prototipo v0.1

Juego web independiente de la marca FREEHAND. Este repositorio no debe mezclarse con `preguntados-argentina`.

## Qué incluye
- Landing y pantalla de misión responsive.
- Misión «La llave del Bosque»: recolectar tres cristales, superar memoria y responder una pregunta.
- Recompensa virtual de prueba: 100 XP + insignia.
- Progreso local en el navegador para que el prototipo funcione sin Firebase.
- Adaptador Firebase modular listo para completar con un proyecto nuevo.

## Estructura
- `index.html`: pantalla principal y componentes del juego.
- `css/style.css`: estilos responsive.
- `js/app.js`: flujo y lógica de la misión.
- `js/firebase.js`: conexión Firebase aislada.
- `js/world.js`: metadatos de misión.
- `js/minigames.js`: contenido de desafíos.
- `js/inventory.js`: inventario y guardado local.
- `js/rewards.js`: recompensas virtuales.
- `assets/`: carpeta para arte, personajes, objetos y audio.

## Probar localmente
Los módulos ES y Firebase requieren servir los archivos por HTTP(S), no abrir `index.html` como `file://`.

1. Abrí una terminal dentro de esta carpeta.
2. Ejecutá `python -m http.server 8000`.
3. Visitá `http://localhost:8000`.

Sin configurar Firebase, la misión funciona en modo local.

## Crear Firebase independiente
1. Entrá a Firebase Console y creá un proyecto nuevo llamado, por ejemplo, `freehand-world`.
2. Registrá una aplicación web nueva dentro de ese proyecto.
3. En **Authentication → Sign-in method**, habilitá **Anonymous**.
4. En **Firestore Database**, creá la base de datos.
5. Copiá la configuración de la app web y reemplazá los valores `REEMPLAZAR...` de `js/firebase.js`.
6. Publicá reglas de Firestore antes de abrir el juego a otras personas.

### Colección inicial
`game_progress/{uid}` guarda únicamente el progreso de misión del usuario autenticado: cantidad de cristales, estado de desafíos, finalización y fecha de actualización.

### Reglas de inicio (solo para desarrollo)
No uses reglas abiertas como `allow read, write: if true;`. Antes de producción, definí reglas que limiten cada usuario a su propio documento. El prototipo cliente todavía no debe considerarse autoridad para otorgar recompensas: en una versión pública, la finalización y los premios deben validarse en una Cloud Function o backend confiable para evitar manipulación desde el navegador.

## Publicar en GitHub Pages
1. Creá un repositorio nuevo e independiente, por ejemplo `freehand-world`.
2. Subí el contenido de esta carpeta a la raíz del repositorio.
3. En **Settings → Pages**, elegí publicar desde la rama principal y la carpeta raíz (`/`).
4. La URL esperada será `https://TU-USUARIO.github.io/freehand-world/`.
5. Confirmá que la URL de Firebase esté configurada y que los módulos se carguen desde rutas relativas (`./css/...`, `./js/...`).

## Plan de prototipo
1. **Base técnica:** repositorio separado, Firebase separado y deploy de prueba.
2. **Bucle jugable:** explorar → 3 cristales → memoria → pregunta → cofre.
3. **Persistencia:** sesión anónima y progreso en Firestore; mantener fallback local.
4. **Seguridad:** reglas por UID y validación del premio en backend antes de recompensas reales o competitivas.
5. **Prueba móvil:** controles táctiles, pantallas pequeñas, carga, reconexión y prevención de doble reclamo.
6. **Iteración visual:** arte original, animaciones ligeras, sonido opcional y mapa expandible.

## Importante: aislamiento
No edites el repositorio `preguntados-argentina`, su GitHub Pages ni el Firebase `preguntados-argentina`. No reutilices su configuración, colecciones ni reglas en FREEHAND WORLD.


## Exploración 2D (v0.2)
- Movimiento con WASD o flechas del teclado.
- Controles táctiles en pantallas móviles.
- Mapa Canvas con bosque, senderos, río, árboles, cristales y portal.
- Los cristales se recogen al acercarse; al encontrar los tres se desbloquean los desafíos.
- Conserva la progresión local y la sincronización con el Firebase independiente configurado en `js/firebase.js`.
