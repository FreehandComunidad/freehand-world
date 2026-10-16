// Configuración del PROYECTO FIREBASE NUEVO de FREEHAND WORLD.
// Reemplazá estos valores por los de la app web creada en el nuevo proyecto.
// La configuración web identifica el proyecto; la seguridad real depende de Auth,
// reglas de Firestore y validación confiable del lado servidor.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getFirestore, doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyB3F7hhqnnV8kzoNoeLM0OkUzS7_bZ9Gww',
  authDomain: 'freehand-world.firebaseapp.com',
  projectId: 'freehand-world',
  storageBucket: 'freehand-world.firebasestorage.app',
  messagingSenderId: '925818750680',
  appId: '1:925818750680:web:af7212206d3a14565df9ad'
};

const configured = !Object.values(firebaseConfig).some(value => String(value).includes('REEMPLAZAR'));
let auth = null;
let db = null;
let firebaseReady = false;
let currentUser = null;

if (configured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  firebaseReady = true;
}

export async function startFirebaseSession() {
  if (!firebaseReady) return { ready: false, user: null };
  await signInAnonymously(auth);
  return new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      currentUser = user;
      unsubscribe();
      resolve({ ready: true, user });
    });
  });
}

export async function saveProgress(progress) {
  if (!firebaseReady || !currentUser) return { saved: false, reason: 'firebase-not-configured' };
  await setDoc(doc(db, 'game_progress', currentUser.uid), {
    crystals: progress.crystals ?? 0,
    memoryPassed: Boolean(progress.memoryPassed),
    quizPassed: Boolean(progress.quizPassed),
    missionCompleted: Boolean(progress.missionCompleted),
    updatedAt: serverTimestamp()
  }, { merge: true });
  return { saved: true };
}

export function firebaseStatus() {
  return { ready: firebaseReady, user: currentUser };
}
