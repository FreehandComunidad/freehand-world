# FREEHANDWORLD Quiz — Firebase Test Mode v5

Usa el proyecto Firebase existente `freehand-world` y deja activo el modo de prueba para jugar cualquier día.

## Integración
- Firebase Authentication anónima.
- Perfil privado en `privateProfiles/{uid}` con el campo `realName`.
- Ranking en tiempo real en `publicScores` con alias público, puntaje, modo y semana.
- Intentos en `attempts/{uid}_{week}_{mode}`.
- Conserva `game_progress` del juego anterior.

## Antes de subir
1. Descomprimí este ZIP.
2. Reemplazá `index.html`, `css/` y `js/` en el repositorio GitHub.
3. No borres ni cambies `game_progress`, `privateProfiles`, `publicScores` ni `attempts`.
4. Las reglas publicadas deben permitir las escrituras de estas colecciones según el archivo `firestore.rules.recommended.txt` que acompaña esta versión. No las reemplaces sin compararlas con las reglas actuales.
5. Después del commit, esperá GitHub Pages y probá con Ctrl+F5.

## Administrar el ranking y ver nombres reales
Leé **`ADMINISTRACION_FIREBASE.md`**. Explica dónde aparecen las colecciones, cómo resetear ranking e intentos desde Firebase Console y dónde ver `realName` sin exponerlo al público.

## Limitaciones de seguridad
- El puntaje se calcula en el navegador y no está validado en servidor; no usar para premios de valor hasta agregar validación de servidor/Cloud Functions.
- El acceso anónimo identifica una instalación/navegador, no una identidad verificada.
- El modo de prueba permite enviar resultados cualquier día; antes del lanzamiento público habrá que reactivar el bloqueo de sábado y probarlo.
- No se agregó ningún botón público para borrar el ranking.
