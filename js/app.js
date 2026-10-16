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

const canvas = $('world-canvas');
const ctx = canvas.getContext('2d');
const worldOverlay = $('world-overlay');
const worldHint = $('world-hint');
const world = {
  width: 960, height: 540, running: false, frame: 0, lastTime: 0,
  player: { x: 110, y: 270, r: 16, speed: 220, facing: 1, walk: 0 },
  keys: new Set(),
  crystals: [
    { id: 0, x: 280, y: 115, color: '#d9fbff', glow: '#d9fbff', name: 'Claro' },
    { id: 1, x: 700, y: 190, color: '#60d9ff', glow: '#42baff', name: 'Azul' },
    { id: 2, x: 500, y: 425, color: '#c5a0ff', glow: '#a78bfa', name: 'Violeta' }
  ],
  trees: [[80,90,28],[160,145,24],[210,70,25],[355,85,31],[440,155,25],[545,85,28],[625,110,22],[810,90,30],[875,160,25],[90,390,30],[180,455,25],[300,370,27],[375,470,30],[620,380,26],[755,445,30],[860,370,28],[900,480,23],[400,270,22],[590,285,22],[245,285,20],[770,285,23]],
  rocks: [[345,210],[835,250],[130,315],[675,485],[460,65]]
};
const heldDirections = { ArrowUp:'up', w:'up', W:'up', ArrowDown:'down', s:'down', S:'down', ArrowLeft:'left', a:'left', A:'left', ArrowRight:'right', d:'right', D:'right' };
const directionVector = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };


function render() {
  $('crystal-count').textContent = `Cristales: ${state.crystals.length} de 3`;
  $('crystal-progress').style.width = `${state.crystals.length / 3 * 100}%`;
  $('inventory-value').textContent = `${state.crystals.length} / 3`;
  $('xp-value').textContent = `${state.xp} XP`;
  $('badge-value').textContent = String(state.badges.length);
  world.crystals.forEach(crystal => {
    const legend = $('legend-crystal-' + crystal.id);
    if (legend) {
      const found = state.crystals.includes(crystal.id);
      legend.classList.toggle('collected', found);
      legend.textContent = `${found ? '✓' : '◇'} ${crystal.name}`;
    }
  });
  if (state.crystals.length === 3) worldOverlay.hidden = false;
  $('mission-status').textContent = state.missionCompleted ? 'Completada' : 'En progreso';
  saveInventory(state);
}

async function syncProgress() {
  try { await saveProgress({ ...state, crystals: state.crystals.length }); }
  catch (error) { console.warn('No se pudo sincronizar el progreso:', error); }
}

startButton.addEventListener('click', () => {
  gamePanel.hidden = false;
  world.running = true;
  world.lastTime = 0;
  requestAnimationFrame(worldLoop);
  gamePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
function drawTree(x,y,r){
  ctx.fillStyle='#081a25';ctx.beginPath();ctx.ellipse(x+5,y+r*.68,r*.9,r*.35,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#624c52';ctx.fillRect(x-r*.17,y+r*.18,r*.34,r*.85);
  const g=ctx.createRadialGradient(x-r*.35,y-r*.45,2,x,y,r*1.2);g.addColorStop(0,'#56b99b');g.addColorStop(.55,'#287d76');g.addColorStop(1,'#174c58');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8ce7c2';ctx.globalAlpha=.25;ctx.beginPath();ctx.arc(x-r*.25,y-r*.35,r*.38,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
}
function drawCrystal(c,found){
  if(found)return;const pulse=1+Math.sin(world.frame*.06+c.id)*.12;ctx.save();ctx.translate(c.x,c.y);ctx.scale(pulse,pulse);ctx.shadowColor=c.glow;ctx.shadowBlur=24;ctx.fillStyle=c.color;ctx.beginPath();ctx.moveTo(0,-17);ctx.lineTo(12,-3);ctx.lineTo(7,14);ctx.lineTo(-7,14);ctx.lineTo(-12,-3);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#fff';ctx.globalAlpha=.7;ctx.lineWidth=2;ctx.stroke();ctx.restore();ctx.globalAlpha=1;
}
function drawWorld(){
 const w=world.width,h=world.height;const bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#153e4a');bg.addColorStop(.52,'#174e4b');bg.addColorStop(1,'#102f42');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 ctx.fillStyle='#23665b';ctx.globalAlpha=.65;[[280,115,110],[700,190,125],[500,425,125],[110,270,105]].forEach(([x,y,r])=>{ctx.beginPath();ctx.ellipse(x,y,r,r*.68,0,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
 ctx.strokeStyle='#b5a77b';ctx.lineWidth=50;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(80,270);ctx.bezierCurveTo(240,230,280,330,420,270);ctx.bezierCurveTo(550,210,630,270,730,310);ctx.bezierCurveTo(800,345,810,430,890,450);ctx.stroke();ctx.strokeStyle='#d8c99a';ctx.lineWidth=2;ctx.globalAlpha=.35;ctx.stroke();ctx.globalAlpha=1;
 ctx.strokeStyle='#3abbd0';ctx.lineWidth=14;ctx.globalAlpha=.45;ctx.beginPath();ctx.moveTo(0,180);ctx.bezierCurveTo(160,205,180,355,330,340);ctx.bezierCurveTo(470,325,520,120,650,140);ctx.bezierCurveTo(790,160,820,230,960,205);ctx.stroke();ctx.globalAlpha=1;
 for(let i=0;i<45;i++){const x=(i*137+43)%w,y=(i*83+31)%h;ctx.fillStyle=i%3===0?'#b6f3ca':'#8ce4c8';ctx.globalAlpha=.16;ctx.beginPath();ctx.arc(x,y,1.5+(i%3),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
 world.trees.forEach(t=>drawTree(...t));world.rocks.forEach(([x,y])=>{ctx.fillStyle='#6e9b91';ctx.beginPath();ctx.ellipse(x,y,10,6,-.2,0,Math.PI*2);ctx.fill();});
 ctx.save();ctx.translate(885,270);ctx.strokeStyle=state.crystals.length===3?'#c8a5ff':'#6487a3';ctx.lineWidth=7;ctx.shadowColor=state.crystals.length===3?'#a78bfa':'transparent';ctx.shadowBlur=state.crystals.length===3?25:0;ctx.beginPath();ctx.ellipse(0,0,28,48,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#17263d';ctx.globalAlpha=.6;ctx.beginPath();ctx.ellipse(0,0,22,40,0,0,Math.PI*2);ctx.fill();ctx.restore();ctx.globalAlpha=1;
 world.crystals.forEach(c=>drawCrystal(c,state.crystals.includes(c.id)));
 const p=world.player;ctx.fillStyle='#071722';ctx.globalAlpha=.55;ctx.beginPath();ctx.ellipse(p.x,p.y+13,16,7,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.save();ctx.translate(p.x,p.y);if(p.facing<0)ctx.scale(-1,1);const bounce=Math.sin(p.walk)*2;ctx.fillStyle='#6b55d8';ctx.beginPath();ctx.ellipse(0,2+bounce,13,15,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b8a2ff';ctx.beginPath();ctx.arc(0,-7+bounce,11,0,Math.PI*2);ctx.fill();ctx.fillStyle='#20234b';ctx.beginPath();ctx.arc(3,-7+bounce,1.8,0,Math.PI*2);ctx.arc(-3,-7+bounce,1.8,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e9e3ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-6,15+bounce);ctx.lineTo(-8,20+bounce);ctx.moveTo(6,15+bounce);ctx.lineTo(8,20+bounce);ctx.stroke();ctx.restore();
 ctx.fillStyle='#e7fff7';ctx.font='bold 13px sans-serif';ctx.fillText('BOSQUE BRILLANTE',20,28);ctx.fillStyle='#ffffffb0';ctx.font='12px sans-serif';ctx.fillText('Encontrá los 3 cristales',20,47);if(state.crystals.length===3){ctx.fillStyle='#ddceff';ctx.font='bold 14px sans-serif';ctx.fillText('PORTAL ACTIVADO →',760,210);}
}
function worldLoop(time){
 if(!world.running||gamePanel.hidden)return;const dt=world.lastTime?Math.min((time-world.lastTime)/1000,.04):0;world.lastTime=time;world.frame++;const p=world.player;let dx=0,dy=0;world.keys.forEach(k=>{const v=directionVector[k];if(v){dx+=v[0];dy+=v[1];}});const len=Math.hypot(dx,dy)||1;if(dx||dy){dx/=len;dy/=len;p.walk+=dt*13;if(dx)p.facing=dx<0?-1:1;}
 const nx=clamp(p.x+dx*p.speed*dt,p.r+8,world.width-p.r-8),ny=clamp(p.y+dy*p.speed*dt,p.r+45,world.height-p.r-10);if(!world.trees.some(([x,y,r])=>Math.hypot(nx-x,ny-y)<r+p.r*.72)){p.x=nx;p.y=ny;}
 world.crystals.forEach(c=>{if(!state.crystals.includes(c.id)&&Math.hypot(p.x-c.x,p.y-c.y)<34&&!state.missionCompleted){state.crystals.push(c.id);render();syncProgress();worldHint.textContent=`¡Cristal ${c.name} recogido! ${state.crystals.length} de 3.`;if(state.crystals.length===3){worldOverlay.hidden=false;worldHint.textContent='¡Encontraste los tres! Ahora superá los desafíos para abrir el cofre.';openChallenges();}}});
 drawWorld();requestAnimationFrame(worldLoop);
}
function setDirection(d,active){if(active)world.keys.add(d);else world.keys.delete(d);}
window.addEventListener('keydown',e=>{const d=heldDirections[e.key];if(d&&!gamePanel.hidden){e.preventDefault();setDirection(d,true);}});
window.addEventListener('keyup',e=>{const d=heldDirections[e.key];if(d)setDirection(d,false);});window.addEventListener('blur',()=>world.keys.clear());
document.querySelectorAll('[data-move]').forEach(b=>{const d=b.dataset.move;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture?.(e.pointerId);setDirection(d,true);});['pointerup','pointercancel','lostpointercapture'].forEach(t=>b.addEventListener(t,()=>setDirection(d,false)));});

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
