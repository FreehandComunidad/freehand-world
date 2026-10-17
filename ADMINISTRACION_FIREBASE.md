# Administración del ranking y jugadores — FREEHANDWORLD

Proyecto Firebase: `freehand-world`

## Dónde está el ranking

La colección de ranking es **`publicScores`**. El código la usa para publicar el alias, el puntaje, el modo y la semana. No guarda el nombre real en esa colección.

Ruta: Firebase Console → Firestore Database → Data → `publicScores`.

**Firestore solo muestra una colección después de que exista al menos un documento.** Si todavía no aparece, completá una partida de prueba y tocá “Guardar resultado”. Después actualizá la vista Data.

## Cómo resetear el ranking

1. Abrí Firebase Console y elegí el proyecto `freehand-world`.
2. Entrá a Firestore Database → Data → `publicScores`.
3. Eliminá los documentos dentro de `publicScores` para vaciar el ranking.
4. Para permitir que los mismos jugadores vuelvan a jugar en los mismos modos y semana, también eliminá los documentos de la colección **`attempts`**. Si borrás solo `publicScores`, el historial de intentos seguirá bloqueando otra partida.
5. No borres `privateProfiles` ni `game_progress` si querés conservar los perfiles reales y el progreso del juego anterior.

Hacé el borrado únicamente desde la consola de Firebase con acceso de administrador. No agregues un botón público de “resetear ranking” al `index.html`, porque cualquier visitante podría borrar resultados.

## Dónde ver los nombres reales

Los nombres reales se guardan en **`privateProfiles/{uid}`**, en el campo `realName`. El ranking público (`publicScores`) utiliza el alias público. Desde Firebase Console, con acceso al proyecto, el administrador puede abrir `privateProfiles` y ver los documentos guardados.

Ruta: Firestore Database → Data → `privateProfiles` → documento del jugador → campo `realName`.

Si `privateProfiles` no aparece, el jugador todavía no guardó el perfil correctamente o Firestore rechazó la escritura. Revisá la consola del navegador y las reglas de Firestore. No hagas pública la lectura de `privateProfiles`.

## Colecciones y qué hacen

- `publicScores`: ranking visible por alias y puntaje.
- `attempts`: controla que cada UID tenga un intento por modo y semana.
- `privateProfiles`: nombre real, código y alias; perfil privado.
- `game_progress`: datos del juego anterior; conservar.

## Importante

El modo de prueba permite jugar cualquier día. Las reglas de Firestore que ya publicaste deben seguir vigentes para `publicScores`, `attempts` y `privateProfiles`. Esta versión no agrega una función administrativa dentro del sitio y no elimina datos automáticamente.
