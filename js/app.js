import { loadInventory, saveInventory } from './inventory.js';
import { MEMORY_SEQUENCE, QUIZ } from './minigames.js';
import { MISSION_REWARD } from './rewards.js';
import { startFirebaseSession, saveProgress } from './firebase.js';

let state = loadInventory();
let memoryInput = [];
let challenge = 'memory';
const $ = id => document.getElementById(id);
const startButton = $('start-button');
const gamePanel = $('game-panel');
const crystalButtons = [...document.querySelectorAll('[data-crystal]')];

function render() {
  $('crystal-count').textContent = `Cristales: ${state.crystals.length} de 3`;
  $('crystal-progress').style.width = `${state.crystals.length / 3 * 100}%`;
  $('inventory-value').textContent = `${state.crystals.length} / 3`;
  $('xp-value').textContent = `${state.xp} XP`;
  $('badge-value').textContent = String(state.badges.length);
  crystalButtons.forEach(button => {
    const found = state.crystals.includes(Number(button.dataset.crystal));
    button.classList.toggle('found', found);
    button.querySelector('span').textContent = found ? '✦' : '✧';
    button.disabled = found || state.missionCompleted;
  });
  $('mission-status').textContent = state.missionCompleted ? 'Completada' : 'En progreso';
  saveInventory(state);
}

async function syncProgress() {
  try { await saveProgress({ ...state, crystals: state.crystals.length }); }
  catch (error) { console.warn('No se pudo sincronizar el progreso:', error); }
}

startButton.addEventListener('click', () => {
  gamePanel.hidden = false;
  gamePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

crystalButtons.forEach(button => button.addEventListener('click', async () => {
  if (state.crystals.length >= 3 || state.missionCompleted) return;
  const id = Number(button.dataset.crystal);
  if (!state.crystals.includes(id)) state.crystals.push(id);
  render();
  await syncProgress();
  if (state.crystals.length === 3) openChallenges();
}));

function openChallenges() {
  $('challenge-area').hidden = false;
  $('challenge-title').textContent = 'Desafío de memoria';
  $('challenge-instructions').textContent = 'Memorizá la secuencia de colores y después repetila en el mismo orden.';
  $('memory-buttons').hidden = false;
  $('memory-sequence').innerHTML = MEMORY_SEQUENCE.map(n => `<span>${['🔴','🔵','🟢','🟡'][n]}</span>`).join('');
  $('challenge-feedback').textContent = '';
  challenge = 'memory'; memoryInput = [];
  $('next-challenge').hidden = true;
}

document.querySelectorAll('.memory-button').forEach(button => button.addEventListener('click', () => {
  if (challenge !== 'memory' || state.memoryPassed) return;
  memoryInput.push(Number(button.dataset.color));
  $('challenge-feedback').textContent = `Secuencia: ${memoryInput.length} de ${MEMORY_SEQUENCE.length}`;
  if (memoryInput.length === MEMORY_SEQUENCE.length) {
    const success = memoryInput.every((n, i) => n === MEMORY_SEQUENCE[i]);
    if (success) {
      state.memoryPassed = true;
      $('challenge-feedback').textContent = '¡Perfecto! Memoria superada.';
      $('next-challenge').hidden = false;
      $('memory-buttons').hidden = true;
      syncProgress();
    } else {
      memoryInput = [];
      $('challenge-feedback').textContent = 'No coincide. Probá otra vez desde el principio.';
    }
  }
}));

$('next-challenge').addEventListener('click', () => {
  challenge = 'quiz';
  $('challenge-title').textContent = 'Pregunta relámpago';
  $('challenge-instructions').textContent = 'Respondé correctamente para desbloquear el cofre.';
  $('memory-sequence').innerHTML = '';
  $('memory-buttons').hidden = true;
  $('next-challenge').hidden = true;
  $('quiz-area').hidden = false;
  $('quiz-question').textContent = QUIZ.question;
  $('quiz-options').innerHTML = '';
  QUIZ.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'quiz-option'; button.textContent = option;
    button.addEventListener('click', async () => {
      if (state.quizPassed) return;
      if (index === QUIZ.correctIndex) {
        state.quizPassed = true;
        $('challenge-feedback').textContent = '¡Correcto! El cofre ya está disponible.';
        $('quiz-options').querySelectorAll('button').forEach(b => b.disabled = true);
        $('reward-area').hidden = false;
        await syncProgress();
      } else {
        $('challenge-feedback').textContent = 'Todavía no. Elegí otra respuesta.';
      }
    });
    $('quiz-options').append(button);
  });
});

$('claim-reward').addEventListener('click', async () => {
  if (!state.quizPassed || state.missionCompleted) return;
  state.missionCompleted = true;
  state.xp += MISSION_REWARD.xp;
  if (!state.badges.includes(MISSION_REWARD.badge)) state.badges.push(MISSION_REWARD.badge);
  $('reward-area').innerHTML = `<div class="reward-icon">✨</div><h3>¡Cofre abierto!</h3><p>Sumaste <b>${MISSION_REWARD.xp} XP</b> y desbloqueaste <b>${MISSION_REWARD.badge}</b>.</p><p class="muted">Recompensa virtual de prueba.</p>`;
  render(); await syncProgress();
});

render();
startFirebaseSession().then(({ ready, user }) => {
  $('player-status').textContent = ready && user ? `Invitado · ${user.uid.slice(0, 6)}` : 'Modo prueba local';
}).catch(error => {
  console.warn('Firebase no disponible; el juego sigue en modo local.', error);
  $('player-status').textContent = 'Modo prueba local';
});
