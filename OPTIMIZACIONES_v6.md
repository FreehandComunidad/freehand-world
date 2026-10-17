FREEHANDWORLD Quiz — ajustes v6

Cambios incluidos:
- El guardado de una partida usa un batch atómico para crear el intento y el puntaje juntos. Evita la lectura de un documento inexistente de attempts, que podía ser rechazada por las reglas actuales y bloquear los tres modos.
- Se eliminó el ordenamiento remoto compuesto en Firestore; se consultan puntajes de la semana y se ordenan en el navegador, evitando depender de un índice compuesto.
- El ranking ya no muestra puntajes locales como si fueran globales cuando Firebase está vacío o desconectado.
- Mensajes del botón y textos de privacidad más claros.
- Ajustes CSS para foco accesible, tacto y usuarios que prefieren movimiento reducido.

Importante:
- El modo de prueba sigue habilitado para permitir verificar partidas. No publicar como lanzamiento final hasta desactivar TEST_MODE en js/game.js y js/firebase.js y definir las reglas de acceso por sábado.
- Las reglas actuales bloquean actualizar un intento ya creado, pero no validan de forma segura que el puntaje corresponda a una partida legítima. Para un ranking con premios o competitivo, la validación de puntajes debe moverse a un entorno confiable (por ejemplo, Cloud Functions).
- La identidad anónima de Firebase se conserva por navegador/dispositivo. Para mantener una cuenta entre dispositivos hace falta añadir un método de acceso permanente.
