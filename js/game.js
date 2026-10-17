(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const screens = ["homeScreen", "gameScreen", "resultScreen"];
  const QUESTIONS = [
    {q:"¿Cuál es la capital de la provincia de Mendoza?",a:["San Rafael","Mendoza","Godoy Cruz","Tunuyán"],correct:1,why:"La ciudad de Mendoza es la capital provincial."},
    {q:"¿Qué instrumento es protagonista del tango?",a:["Charango","Bandoneón","Bombo legüero","Siku"],correct:1,why:"El bandoneón se volvió un sonido emblemático del tango."},
    {q:"¿Cuántas provincias tiene Argentina?",a:["21","22","23","24"],correct:2,why:"Argentina tiene 23 provincias y la Ciudad Autónoma de Buenos Aires."},
    {q:"¿Qué ingrediente suele llevar el mate?",a:["Yerba mate","Té negro","Café molido","Cacao"],correct:0,why:"La infusión tradicional se prepara con yerba mate."},
    {q:"¿En qué provincia están las Cataratas del Iguazú?",a:["Salta","Misiones","Corrientes","Formosa"],correct:1,why:"Las Cataratas del Iguazú están en Misiones."},
    {q:"¿Qué deporte se juega en una cancha llamada potrero?",a:["Rugby","Hockey","Fútbol","Polo"],correct:2,why:"El potrero es un espacio muy asociado al fútbol barrial."},
    {q:"¿Cuál de estos ritmos nació en Argentina?",a:["Tango","Reggae","Flamenco","Samba"],correct:0,why:"El tango se desarrolló en la región del Río de la Plata."},
    {q:"¿Qué se celebra el 25 de Mayo en Argentina?",a:["Día de la Bandera","Revolución de Mayo","Día de la Independencia","Vuelta a la Democracia"],correct:1,why:"El 25 de mayo recuerda la Revolución de Mayo de 1810."},
    {q:"¿Cuál es la moneda argentina?",a:["Peso argentino","Real","Guaraní","Sol"],correct:0,why:"La moneda oficial es el peso argentino."},
    {q:"¿En qué provincia está el Valle de la Luna (Ischigualasto)?",a:["La Rioja","San Juan","San Luis","Catamarca"],correct:1,why:"El Parque Provincial Ischigualasto está en San Juan."},
    {q:"¿Qué comida se cocina tradicionalmente a la parrilla?",a:["Locro","Asado","Humita","Pastelitos"],correct:1,why:"El asado es una tradición gastronómica argentina."},
    {q:"¿Qué colores tiene la bandera argentina?",a:["Rojo y blanco","Azul y amarillo","Celeste y blanco","Verde y blanco"],correct:2,why:"La bandera tiene franjas celestes y blanca, con el Sol en su versión oficial."}
  ];
  const TRUTHS = [
    {q:"Argentina tiene costa sobre el océano Atlántico.",truth:true,why:"Sí: el litoral marítimo argentino da al Atlántico Sur."},
    {q:"El dulce de leche se hace principalmente con papa.",truth:false,why:"Se prepara principalmente con leche y azúcar."},
    {q:"El Aconcagua está en la provincia de Mendoza.",truth:true,why:"El Aconcagua se encuentra en la cordillera de los Andes, en Mendoza."},
    {q:"Ushuaia está en el norte argentino.",truth:false,why:"Ushuaia está en Tierra del Fuego, en el extremo sur."},
    {q:"El chamamé es una expresión musical muy ligada a Corrientes.",truth:true,why:"El chamamé es parte central de la identidad cultural correntina."},
    {q:"La bandera argentina tiene una franja roja en el medio.",truth:false,why:"Sus franjas son celestes y blanca."}
  ];
  const icons = ["🧉","⚽","☀️","🥟","🎸","🦕","🏔️","🚕","🍮","🎭","🏆","🧉"];
  let mode = "quiz", queue = [], index = 0, score = 0, correctCount = 0, streak = 0, bestRun = 0;
  let answered = false, memoryOrder = [], memoryChosen = [], memoryTimeout = null, soundOn = false, lastMode = "quiz";
  let currentTruth = null, dailySeed = new Date().toISOString().slice(0,10);
  const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };
  const shuffle = arr => [...arr].sort(() => Math.random() - .5);
  function showScreen(id) { screens.forEach(s => $(s).classList.toggle("active", s === id)); window.scrollTo({top:0,behavior:"smooth"}); }
  function updateHome() {
    const stats = load("fhw_stats",{best:0,streak:0,xp:0});
    $("bestScore").textContent = stats.best || 0;
    $("bestStreak").innerHTML = `${stats.streak || 0} <small>seguidas</small>`;
    $("levelValue").textContent = String(Math.floor((stats.xp || 0)/250)+1).padStart(2,"0");
    const scores = load("fhw_scores",[]);
    $("leaderboard").innerHTML = scores.length ? scores.slice(0,5).map((x,i)=>`<div class="leader-row"><span class="leader-rank">${String(i+1).padStart(2,"0")}</span><span>${escapeHtml(x.name)}</span><span class="leader-score">${x.score} pts</span></div>`).join("") : `<div class="leader-row"><span class="leader-rank">—</span><span>Tu nombre puede aparecer acá</span><span class="leader-score">0 pts</span></div>`;
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function startGame(nextMode, daily=false) {
    mode = nextMode; lastMode = nextMode; index=0; score=0; correctCount=0; streak=0; bestRun=0; answered=false; memoryChosen=[];
    $("feedback").textContent=""; $("feedback").className="feedback";
    $("gameModeLabel").textContent = daily ? "DESAFÍO DEL DÍA" : ({quiz:"ARGENTINA EN 10",memory:"MEMORIA VISUAL",truth:"VERDAD O CHAMUYO"})[mode];
    showScreen("gameScreen");
    if(mode==="quiz"){queue=shuffle(QUESTIONS).slice(0,10);renderQuiz();}
    else if(mode==="truth"){queue=shuffle(TRUTHS);renderTruth();}
    else renderMemory();
  }
  function updateProgress(total){$("questionCounter").textContent=`${String(Math.min(index+1,total)).padStart(2,"0")} / ${String(total).padStart(2,"0")}`;$("progressFill").style.width=`${Math.min(index,total)/total*100}%`;}
  function renderQuiz(){
    if(index>=queue.length){finish();return;}
    answered=false; const item=queue[index]; updateProgress(queue.length);
    $("gameContent").innerHTML=`<div class="timer-row"><span>RESPONDÉ ANTES DE QUE TERMINE</span><span class="timer" id="timerValue">10s</span></div><div class="question-kicker">PREGUNTA ${String(index+1).padStart(2,"0")}</div><h2 class="question-title">${item.q}</h2><div class="answers">${item.a.map((a,i)=>`<button class="answer" data-answer="${i}"><span class="answer-letter">${"ABCD"[i]}</span>${a}</button>`).join("")}</div>`;
    let time=10; clearInterval(window.fhwTimer); window.fhwTimer=setInterval(()=>{time--; const el=$("timerValue");if(el)el.textContent=`${time}s`;if(time<=0){clearInterval(window.fhwTimer);if(!answered)chooseAnswer(-1);}},1000);
    document.querySelectorAll("[data-answer]").forEach(b=>b.addEventListener("click",()=>chooseAnswer(Number(b.dataset.answer))));
  }
  function chooseAnswer(choice){
    if(answered)return; answered=true;clearInterval(window.fhwTimer);
    const item=queue[index], good=choice===item.correct;
    document.querySelectorAll("[data-answer]").forEach(b=>{b.disabled=true;const n=Number(b.dataset.answer);if(n===item.correct)b.classList.add("correct");else if(n===choice)b.classList.add("wrong");});
    if(good){correctCount++;streak++;bestRun=Math.max(bestRun,streak);score+=100+Math.max(0,10-Number($("timerValue").textContent.replace("s","")))*5;$("feedback").className="feedback good";$("feedback").textContent=`¡Correcto! ${item.why}`;tone(true);}
    else{streak=0;$("feedback").className="feedback bad";$("feedback").textContent=`${choice<0?"Se terminó el tiempo.":"No era esa."} ${item.why}`;tone(false);}
    index++;$("progressFill").style.width=`${index/queue.length*100}%`;setTimeout(renderQuiz,1050);
  }
  function renderTruth(){
    if(index>=queue.length){finish();return;}
    answered=false;const item=queue[index];updateProgress(queue.length);
    $("gameContent").innerHTML=`<div class="question-kicker">¿VERDAD O CHAMUYO? · ${String(index+1).padStart(2,"0")}</div><h2 class="question-title">${item.q}</h2><div class="truth-actions"><button data-truth="true">✓ ES VERDAD</button><button data-truth="false">✕ ES CHAMUYO</button></div>`;
    document.querySelectorAll("[data-truth]").forEach(b=>b.addEventListener("click",()=>{if(answered)return;answered=true;const good=(b.dataset.truth==="true")===item.truth;if(good){score+=100;correctCount++;streak++;bestRun=Math.max(bestRun,streak);$("feedback").className="feedback good";$("feedback").textContent=`¡Bien! ${item.why}`;tone(true);}else{streak=0;$("feedback").className="feedback bad";$("feedback").textContent=`No exactamente. ${item.why}`;tone(false);}index++;setTimeout(renderTruth,1150);}));
  }
  function renderMemory(){
    $("questionCounter").textContent="MEMORIA";$("progressFill").style.width="0%";
    memoryOrder=shuffle(icons).slice(0,9);memoryChosen=[];
    $("gameContent").innerHTML=`<div class="question-kicker">MEMORIA VISUAL</div><h2 class="question-title">Memorizá los símbolos.</h2><p class="lead">Tenés 4 segundos para observarlos. Después, encontrá el símbolo indicado.</p><div class="memory-board" id="memoryBoard">${memoryOrder.map((x,i)=>`<div class="memory-card revealed" data-cell="${i}">${x}</div>`).join("")}</div><p class="fine-print" id="memoryInstruction">Mirá bien. El tablero se va a ocultar…</p>`;
    clearTimeout(memoryTimeout);memoryTimeout=setTimeout(()=>{document.querySelectorAll(".memory-card").forEach(c=>{c.classList.remove("revealed");c.textContent="✦";});askMemoryTarget();},4000);
  }
  function askMemoryTarget(){
    const targetIndex=Math.floor(Math.random()*memoryOrder.length);const target=memoryOrder[targetIndex];
    $("memoryInstruction").textContent=`Encontrá: ${target}`;
    document.querySelectorAll(".memory-card").forEach(c=>c.addEventListener("click",()=>{if(c.dataset.done)return;const good=Number(c.dataset.cell)===targetIndex;c.dataset.done="1";c.classList.add("revealed");c.textContent=memoryOrder[Number(c.dataset.cell)];if(good){score+=150;correctCount=1;bestRun=1;$("feedback").className="feedback good";$("feedback").textContent="¡Buena memoria! +150 puntos";tone(true);}else{$("feedback").className="feedback bad";$("feedback").textContent="Casi. La próxima sale.";tone(false);}document.querySelectorAll(".memory-card").forEach(x=>x.style.pointerEvents="none");$("progressFill").style.width="100%";setTimeout(finish,1000);}));
  }
  function finish(){
    clearInterval(window.fhwTimer);clearTimeout(memoryTimeout);
    const total=mode==="quiz"?queue.length:mode==="truth"?queue.length:1;
    const xp=Math.floor(score/10)+correctCount*5;
    const stats=load("fhw_stats",{best:0,streak:0,xp:0});stats.best=Math.max(stats.best,score);stats.streak=Math.max(stats.streak,bestRun);stats.xp=(stats.xp||0)+xp;save("fhw_stats",stats);
    $("resultTitle").textContent=score>=700?"¡Imparable!":score>=400?"¡Buen juego!":"Seguí practicando.";
    $("resultSubtitle").textContent=mode==="memory"?"Tu memoria está en entrenamiento.":`Completaste el desafío ${mode==="quiz"?"Argentina en 10":mode==="truth"?"Verdad o chamuyo":"visual"}.`;
    $("finalScore").textContent=score;$("finalCorrect").textContent=`${correctCount}/${total}`;$("finalStreak").textContent=bestRun;$("finalXp").textContent=xp;
    $("playerName").value=load("fhw_name","Jugador");$("saveScore").textContent="GUARDAR";showScreen("resultScreen");updateHome();
  }
  function saveScore(){
    const name=$("playerName").value.trim().slice(0,16)||"Jugador";save("fhw_name",name);
    const scores=load("fhw_scores",[]);scores.push({name,score,when:new Date().toISOString(),mode});scores.sort((a,b)=>b.score-a.score);save("fhw_scores",scores.slice(0,10));
    $("saveScore").textContent="GUARDADO ✓";updateHome();
  }
  function tone(correct){if(!soundOn)return;try{const C=window.AudioContext||window.webkitAudioContext;const ctx=new C();const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=correct?720:220;g.gain.value=.045;o.start();o.stop(ctx.currentTime+.09);o.onended=()=>ctx.close();}catch{}}
  document.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>startGame(b.dataset.mode)));
  $("dailyBtn").addEventListener("click",()=>startGame("quiz",true));
  $("backHome").addEventListener("click",()=>{clearInterval(window.fhwTimer);clearTimeout(memoryTimeout);showScreen("homeScreen");updateHome();});
  $("goHome").addEventListener("click",()=>{showScreen("homeScreen");updateHome();});
  $("playAgain").addEventListener("click",()=>startGame(lastMode));
  $("saveScore").addEventListener("click",saveScore);
  $("soundToggle").addEventListener("click",()=>{soundOn=!soundOn;$("soundState").textContent=soundOn?"ON":"OFF";tone(true);});
  updateHome();
})();