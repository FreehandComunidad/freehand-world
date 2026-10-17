// Configuración del proyecto Firebase existente: freehand-world
const firebaseConfig = {
  apiKey: "AIzaSyB3F7hhqnnV8kzoNoeLM0OkUzS7_bZ9Gww",
  authDomain: "freehand-world.firebaseapp.com",
  projectId: "freehand-world",
  storageBucket: "freehand-world.firebasestorage.app",
  messagingSenderId: "925818750680",
  appId: "1:925818750680:web:af7212206d3a14565df9ad"
};

try {
  firebase.initializeApp(firebaseConfig);
  window.fhAuth = firebase.auth();
  window.fhDb = firebase.firestore();
  window.fhFirebaseReady = true;
} catch (error) {
  console.error("No se pudo inicializar Firebase:", error);
  window.fhFirebaseError = error;
  window.fhFirebaseReady = false;
}
