(() => {
  const $ = id => document.getElementById(id);
  const state = { user:null, startedAt:0, stageStartedAt:0, totalInterval:null, stageInterval:null, stage:0, index:0, score:0, correct:0, answered:0, totalQuestions:35, questions:[], memoryPattern:[], memoryInput:[], memoryShow:false, truthIndex:0, done:false, week:"" };
  const stages = [
    {title:"Cultura argentina", kicker:"ETAPA 01 / 03"},
    {title:"Memoria visual", kicker:"ETAPA 02 / 03"},
    {title:"Verdadero o falso", kicker:"ETAPA 03 / 03"}
  ];
  const quiz = [
    {q:"¿Cuál es la capital de la provincia de Mendoza?",a:["San Rafael","Mendoza","Godoy Cruz","Tunuyán"],ok:1},
    {q:"¿En qué año se declaró la Independencia argentina?",a:["1810","1812","1816","1820"],ok:2},
    {q:"¿Qué río forma gran parte del límite entre Argentina y Uruguay?",a:["Río Negro","Río Paraná","Río Uruguay","Río Colorado"],ok:2},
    {q:"¿Quién escribió el Martín Fierro?",a:["Domingo F. Sarmiento","José Hernández","Jorge L. Borges","Julio Cortázar"],ok:1},
    {q:"¿Cuál es la montaña más alta de América?",a:["Lanín","Aconcagua","Fitz Roy","Ojos del Salado"],ok:1},
    {q:"¿Qué instrumento se asocia tradicionalmente al tango?",a:["Charango","Bandoneón","Siku","Acordeón diatónico"],ok:1},
    {q:"¿En qué provincia está el Parque Nacional Talampaya?",a:["San Juan","San Luis","La Rioja","Catamarca"],ok:2},
    {q:"¿Qué selección ganó el Mundial de fútbol de 1986?",a:["Brasil","Argentina","Italia","Alemania"],ok:1},
    {q:"¿Cuál es la moneda oficial de Argentina?",a:["Peso argentino","Real","Sol","Guaraní"],ok:0},
    {q:"¿Qué océano baña la costa argentina?",a:["Pacífico","Índico","Atlántico","Ártico"],ok:2},
    {q:"¿En qué ciudad está el Monumento a la Bandera?",a:["Córdoba","Rosario","Santa Fe","Paraná"],ok:1},
    {q:"¿Qué científico argentino recibió el Nobel de Medicina en 1947?",a:["Luis F. Leloir","César Milstein","Bernardo Houssay","René Favaloro"],ok:2},
    {q:"¿Cuál de estos animales es autóctono de la Patagonia?",a:["Yaguareté","Guanaco","Carpincho","Yacaré"],ok:1},
    {q:"¿Qué provincia es conocida por su producción vitivinícola y el Aconcagua?",a:["Mendoza","Chaco","Formosa","Corrientes"],ok:0},
    {q:"¿Qué baile tradicional argentino se baila en pareja y con pañuelos?",a:["Chamamé","Malambo","Zamba","Chacarera del monte"],ok:2}
  ];
  const truths = [
    {q:"La Argentina tiene costa sobre el océano Atlántico.",ok:true},
    {q:"La capital de Córdoba es Rosario.",ok:false},
    {q:"El hornero es el ave nacional argentina.",ok:true},
    {q:"La cordillera de los Andes está al este de Argentina.",ok:false},
    {q:"El mate se prepara tradicionalmente con yerba mate.",ok:true},
    {q:"La provincia de Tierra del Fuego está en el norte argentino.",ok:false},
    {q:"El Obelisco está en la ciudad de Buenos Aires.",ok:true},
    {q:"El río Paraná desemboca en el océano Pacífico.",ok:false},
    {q:"San Martín es una figura central de la independencia sudamericana.",ok:true},
    {q:"La Patagonia se encuentra principalmente en el norte del país.",ok:false}
  ];
  const icons = ["🧉","⚽","🦅","🌵","🎸","🏔️","🚂","⭐","🐧","🌞","🍇","🦊","🎭","🧉","🏆","🌊"];
  const msg = (id, text, type="") => { const el=$(id); el.textContent=text; el.className="message "+type; };
  const fmt = n => { n=Math.max(0,Math.floor(n)); return `${String(Math.floor(n/60)).padStart(2,"0")}:${String(n%60).padStart(2,"0")}`; };
  const showScreen = id => { ["screen-start","screen-game","screen-result"].forEach(s=>$(s).classList.toggle("hidden",s!==id)); window.scrollTo({top:0,behavior:"smooth"}); };
  const shuffle = arr => arr.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
  function weekKey(date=new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));
    const day = d.getUTCDay() || 7; d.setUTCDate(d.getUTCDate()+4-day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const week = Math.ceil((((d-yearStart)/86400000)+1)/7);
    return `${d.getUTCFullYear()}-W${String(week).padStart(2,"0")}`;
  }
  function setStatus(text, good=true) { $("connection").textContent=text; $("connection").style.color=good?"var(--green)":"var(--red)"; }
  async function init() {
    try {
      if(!window.fhFirebaseReady) throw window.fhFirebaseError || new Error("Firebase no inicializó");
      const credential=await window.fhAuth.signInAnonymously();
      state.user=credential.user;
      setStatus("Firebase conectado");
      const attemptKey = `fh_continuous_attempt_${state.user.uid}_${weekKey()}`;
      if (localStorage.getItem(attemptKey) === "used") {
        $("start").disabled = true;
        msg("start-message","Ya jugaste tu desafío de esta semana. Podrás volver a jugar cuando comience la próxima semana.");
      } else {
        $("start").disabled=false;
        msg("start-message","Listo. El desafío tiene tres etapas consecutivas.","success");
      }
      await renderRanking("ranking-home");
    } catch(e) {
      console.error("Inicialización:",e); setStatus("Error de conexión",false);
      msg("start-message",friendlyError(e),"error");
    }
  }
  function friendlyError(e) {
    if(e?.code==="permission-denied" || e?.code==="firestore/permission-denied") return "Firebase rechazó el acceso. Revisá las reglas de publicScores.";
    if(e?.code==="auth/operation-not-allowed") return "La autenticación anónima no está habilitada.";
    if(e?.code==="unavailable") return "Firebase no está disponible. Revisá tu conexión.";
    return `No se pudo completar la operación${e?.code?` (${e.code})`:""}. Revisá la consola del navegador.`;
  }
  async function renderRanking(target) {
    const list=$(target);
    try {
      const snap=await window.fhDb.collection("publicScores").where("week","==",weekKey()).get();
      const rows=snap.docs.map(doc=>doc.data()).sort((a,b)=>(Number(b.score)||0)-(Number(a.score)||0)).slice(0,10);
      list.replaceChildren();
      if(!rows.length){const li=document.createElement("li");li.className="empty";li.textContent="Todavía no hay resultados esta semana.";list.appendChild(li);return;}
      rows.forEach((r,i)=>{const li=document.createElement("li");const rank=document.createElement("span");rank.className="rank";rank.textContent=String(i+1).padStart(2,"0");const name=document.createElement("span");name.className="player";name.textContent=r.alias||"Jugador";const score=document.createElement("span");score.className="score";score.textContent=`${Number(r.score)||0} pts`;li.append(rank,name,score);list.appendChild(li);});
    } catch(e) { console.error("Lectura ranking:",e); list.innerHTML='<li class="empty">No se pudo cargar el ranking. Revisá la consola.</li>'; throw e; }
  }
  function startGame() {
    const alias=$("alias").value.trim();
    if(alias.length<2||alias.length>40){msg("start-message","El alias debe tener entre 2 y 40 caracteres.","error");return;}
    if(!state.user){msg("start-message","Todavía no hay conexión con Firebase.","error");return;}
    const attemptKey = `fh_continuous_attempt_${state.user.uid}_${weekKey()}`;
    if (localStorage.getItem(attemptKey) === "used") {
      msg("start-message","Ya jugaste tu desafío de esta semana. Podrás volver a jugar cuando comience la próxima semana.","error");
      $("start").disabled = true;
      return;
    }
    if(state.totalInterval) clearInterval(state.totalInterval);
    state.startedAt=Date.now();state.score=0;state.correct=0;state.answered=0;state.stage=0;state.index=0;state.done=false;state.week=weekKey();state.questions=shuffle(quiz);state.truths=shuffle(truths);state.memoryPattern=shuffle([...icons]).slice(0,8);state.memoryInput=[];state.truthIndex=0;
    // Bloqueo práctico en este navegador: una partida por usuario autenticado y semana.
    // No es una barrera contra borrado de datos del navegador o uso de otro dispositivo.
    localStorage.setItem(`fh_continuous_attempt_${state.user.uid}_${state.week}`, "used");
    $("start").disabled = true;
    $("live-score").textContent="0 PTS";showScreen("screen-game");beginStage(0);
    state.totalInterval=setInterval(()=>$("total-timer").textContent=fmt((Date.now()-state.startedAt)/1000),250);
  }
  function clearStageTimer(){if(state.stageInterval){clearInterval(state.stageInterval);state.stageInterval=null;}}
  function beginStage(n) {
    clearStageTimer();state.stage=n;state.stageStartedAt=Date.now();
    $("stage-kicker").textContent=stages[n].kicker;$("stage-title").textContent=stages[n].title;
    $("progress-bar").style.width=`${n/3*100}%`;
    if(n===0){state.index=0;renderQuiz();}
    else if(n===1){startMemory();}
    else {state.truthIndex=0;renderTruth();}
  }
  function startCountdown(seconds,onTick,onDone) {
    clearStageTimer();let left=seconds;onTick(left);
    state.stageInterval=setInterval(()=>{left--;onTick(Math.max(0,left));if(left<=0){clearStageTimer();onDone();}},1000);
  }
  function renderQuiz() {
    if(state.index>=state.questions.length){beginStage(1);return;}
    const item=state.questions[state.index];let left=15;
    $("stage-progress").textContent=`Pregunta ${state.index+1} de ${state.questions.length}`;
    $("progress-bar").style.width=`${(state.index/state.questions.length)/3*100}%`;
    $("play-area").innerHTML=`<div class="question-card"><div class="category">CULTURA ARGENTINA · ${String(state.index+1).padStart(2,"0")}</div><h3>${escapeHtml(item.q)}</h3><div class="answers">${item.a.map((a,i)=>`<button class="answer" data-answer="${i}">${String.fromCharCode(65+i)}. ${escapeHtml(a)}</button>`).join("")}</div></div>`;
    const buttons=[...document.querySelectorAll("[data-answer]")];let locked=false;
    const answer=chosen=>{if(locked)return;locked=true;clearStageTimer();state.answered++;if(chosen===item.ok){state.correct++;state.score+=100;buttons[chosen].classList.add("correct");}else if(chosen!==null){buttons[chosen].classList.add("wrong");buttons[item.ok].classList.add("correct");}state.index++;$("live-score").textContent=`${state.score} PTS`;setTimeout(renderQuiz,450);};
    buttons.forEach(b=>b.addEventListener("click",()=>answer(Number(b.dataset.answer))));
    startCountdown(15,s=>{$("stage-timer").textContent=fmt(s);},()=>answer(null));
  }
  function startMemory() {
    $("stage-progress").textContent="Memorizá las posiciones y después encontrá las parejas";
    $("progress-bar").style.width="33%";
    $("play-area").innerHTML=`<div class="question-card"><div class="category">MEMORIA VISUAL</div><h3>Memorizá los símbolos</h3><p class="lead">Vas a ver 8 símbolos por 5 segundos. Después, tocá las parejas iguales.</p><div id="memory-grid" class="memory-grid"></div></div>`;
    const grid=$("memory-grid"), pairValues=shuffle([...state.memoryPattern,...state.memoryPattern]);state.memoryCards=pairValues;state.memoryMatched=[];state.memoryOpen=[];state.memoryMoves=0;state.memoryShowing=true;
    grid.innerHTML=pairValues.map((v,i)=>`<button class="memory-tile" data-tile="${i}" aria-label="Carta ${i+1}">${v}</button>`).join("");
    [...grid.children].forEach(b=>b.disabled=true);
    $("stage-timer").textContent="00:05";
    let show=5;clearStageTimer();state.stageInterval=setInterval(()=>{show--;$("stage-timer").textContent=fmt(show);if(show<=0){clearStageTimer();state.memoryShowing=false;[...grid.children].forEach((b,i)=>{b.textContent="✦";b.disabled=false;b.dataset.value=state.memoryCards[i];});$("play-area").querySelector("h3").textContent="Encontrá las parejas";startMemoryRound();}},1000);
  }
  function startMemoryRound() {
    let left=60;$("stage-progress").textContent="Memoria · encontrá las 8 parejas";
    state.stageInterval=setInterval(()=>{left--;$("stage-timer").textContent=fmt(left);if(left<=0){clearStageTimer();finishMemory(false);}},1000);
    $("memory-grid").addEventListener("click",e=>{
      const b=e.target.closest("[data-tile]");if(!b||b.disabled||state.memoryShowing)return;
      const i=Number(b.dataset.tile);if(state.memoryMatched.includes(i)||state.memoryOpen.includes(i))return;
      b.textContent=b.dataset.value;b.classList.add("selected");state.memoryOpen.push(i);
      if(state.memoryOpen.length===2){
        state.memoryMoves++;const [a,c]=state.memoryOpen;
        if(state.memoryCards[a]===state.memoryCards[c]){state.memoryMatched.push(a,c);state.score+=75;state.correct++;state.answered++;state.memoryOpen=[];$("live-score").textContent=`${state.score} PTS`;if(state.memoryMatched.length===16)finishMemory(true);}
        else {const open=[a,c];setTimeout(()=>{open.forEach(j=>{const tile=$(`[data-tile="${j}"]`);if(tile&&!state.memoryMatched.includes(j)){tile.textContent="✦";tile.classList.remove("selected");}});state.memoryOpen=[];},500);}
      }
    });
  }
  function finishMemory(won) {
    clearStageTimer();if(state.done)return;
    if(won)msg("game-message","¡Memoria completada! Seguimos con la última etapa.","success");
    else msg("game-message","Se terminó el tiempo de memoria. Seguimos con verdadero o falso.");
    [...document.querySelectorAll(".memory-tile")].forEach(b=>b.disabled=true);
    setTimeout(()=>beginStage(2),650);
  }
  function renderTruth() {
    if(state.truthIndex>=state.truths.length){finishGame();return;}
    const item=state.truths[state.truthIndex];
    $("stage-progress").textContent=`Afirmación ${state.truthIndex+1} de ${state.truths.length}`;
    $("progress-bar").style.width=`${66+(state.truthIndex/state.truths.length)*34}%`;
    $("play-area").innerHTML=`<div class="question-card"><div class="category">VERDADERO O FALSO · ${String(state.truthIndex+1).padStart(2,"0")}</div><h3>${escapeHtml(item.q)}</h3><div class="truth-actions"><button class="truth-true" id="truth-true">✓ VERDADERO</button><button class="truth-false" id="truth-false">✕ FALSO</button></div></div>`;
    let locked=false;
    const answer=chosen=>{if(locked)return;locked=true;clearStageTimer();state.answered++;if(chosen===item.ok){state.correct++;state.score+=100;$("live-score").textContent=`${state.score} PTS`;}state.truthIndex++;setTimeout(renderTruth,350);};
    $("truth-true").addEventListener("click",()=>answer(true));$("truth-false").addEventListener("click",()=>answer(false));
    startCountdown(8,s=>$("stage-timer").textContent=fmt(s),()=>answer(null));
  }
  function finishGame() {
    if(state.done)return;state.done=true;clearStageTimer();if(state.totalInterval){clearInterval(state.totalInterval);state.totalInterval=null;}
    const elapsed=Math.floor((Date.now()-state.startedAt)/1000);
    const accuracy=state.answered?Math.round(state.correct/state.answered*100):0;
    // Bonus de rapidez acotado para que el puntaje no supere 5000.
    const speedBonus=Math.max(0,Math.min(500,Math.round((420-elapsed)*1.2)));
    state.score=Math.min(5000,state.score+speedBonus);
    $("final-score").textContent=state.score;$("accuracy").textContent=`${accuracy}%`;$("final-time").textContent=fmt(elapsed);$("answers-count").textContent=`${state.correct}/${state.answered}`;
    $("progress-bar").style.width="100%";showScreen("screen-result");msg("save-message","Guardando tu resultado…");
    saveScore(state.score,elapsed,accuracy).then(async()=>{
      msg("save-message","Puntaje guardado en el ranking semanal.","success");
      await renderRanking("ranking");await renderRanking("ranking-home");
    }).catch(e=>{console.error("Guardar resultado:",e);msg("save-message",friendlyError(e),"error");});
  }
  async function saveScore(score,elapsed,accuracy) {
    const alias=$("alias").value.trim();
    const doc={uid:state.user.uid,week:state.week,mode:"quiz",score:Math.round(score),alias,createdAt:firebase.firestore.FieldValue.serverTimestamp(),elapsedSeconds:elapsed,accuracy};
    // Las reglas publicadas limitan los campos permitidos de publicScores. Mantener el esquema aceptado.
    delete doc.elapsedSeconds;delete doc.accuracy;
    await window.fhDb.collection("publicScores").add(doc);
  }
  function escapeHtml(value){return String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
  $("start").addEventListener("click",startGame);
  $("refresh").addEventListener("click",()=>renderRanking("ranking").catch(e=>msg("save-message",friendlyError(e),"error")));
  $("refresh-home").addEventListener("click",()=>renderRanking("ranking-home").catch(e=>msg("start-message",friendlyError(e),"error")));
  $("back-home").addEventListener("click",()=>{clearStageTimer();if(state.totalInterval)clearInterval(state.totalInterval);showScreen("screen-start");});
  init();
})();
