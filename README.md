# FREEHAND WORLD — Cinematic Prototype v1

Prototipo jugable de aventura 2D: historia original, bosque procedural con capas de profundidad, movimiento y cámara suave, joystick táctil, controles de teclado/clic, cristales, partículas, diálogo, mapa y cierre cinematográfico.

## Prueba
Subí el contenido de esta carpeta a una rama de prueba del repositorio `freehand-world` y activá GitHub Pages desde `main` / `/(root)` cuando decidas publicarlo. URL esperada: https://freehandcomunidad.github.io/freehand-world/

## Controles
- Móvil: joystick inferior izquierdo; botón ✦ para interactuar; botón de correr.
- PC: WASD/flechas para moverte, E o Enter para interactuar; clic en el suelo para caminar.
- Mapa: botón ⌖. Sonido: botón ♫.

## Qué incluye
- Capítulo I: *Cuando la luz se quebró*.
- Misión de tres cristales, +50 XP por cristal y +150 XP al completar.
- Cámara con easing, movimiento acelerado/desacelerado, partículas y luciérnagas.
- La XP se guarda solo en la sesión del navegador en esta versión.

## Seguridad económica
La XP de esta versión es demostrativa y NO representa dinero ni saldo canjeable. No activar canjes hasta implementar Cloud Functions, validación de misiones del lado servidor, libro mayor transaccional, límites, auditoría, reglas Firestore y revisión legal/contable. Nunca confiar en XP enviada por el navegador.

## Siguiente fase
1. Crear arte original optimizado (fondos, sprites y atlas) para reemplazar formas procedurales.
2. Agregar ciclos de caminar/idle/recoger y secuencias de cámara.
3. Guardar progreso en el Firebase exclusivo de FREEHAND WORLD, sin tocar el proyecto anterior.
4. Backend seguro para recompensas.
5. Medir FPS y memoria en iOS/Android reales.
