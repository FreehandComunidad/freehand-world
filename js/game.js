(() => {
"use strict";
const $=id=>document.getElementById(id);
const screens=["homeScreen","profileScreen","gameScreen","resultScreen"];
const modes={quiz:"ARGENTINA EN 10",memory:"MEMORIA VISUAL",truth:"VERDAD O CHAMUYO"};
const questions=[
{q:"¿En qué provincia está el Parque Nacional Talampaya?",a:["San Juan","La Rioja","Mendoza","San Luis"],c:1,d:1,why:"Talampaya está en La Rioja."},
{q:"¿Qué instrumento es emblemático del tango?",a:["Bandoneón","Siku","Charango","Bombo legüero"],c:0,d:0,why:"El bandoneón es uno de los sonidos más reconocibles del tango."},
{q:"¿Cuántas provincias tiene Argentina?",a:["21","22","23","24"],c:2,d:0,why:"Son 23 provincias y la Ciudad Autónoma de Buenos Aires."},
{q:"¿Qué pueblo originario tiene una fuerte presencia histórica en la región andina del noroeste argentino?",a:["Yámana","Diaguita-Calchaquí","Guaraní solamente","Selk'nam"],c:1,d:1,why:"Los pueblos diaguita-calchaquíes habitaron parte del noroeste."},
{q:"¿En qué año se sancionó la Constitución Nacional argentina?",a:["1816","1853","1880","1912"],c:1,d:1,why:"La Constitución fue sancionada en 1853."},
{q:"¿Cuál es el punto más alto de América?",a:["Monte Pissis","Cerro Mercedario","Aconcagua","Lanín"],c:2,d:0,why:"El Aconcagua, en Mendoza, es el punto más alto de América."},
{q:"¿Qué batalla de 1813 es conocida como el Combate de San Lorenzo?",a:["Una victoria de San Martín","Una batalla naval","La defensa de Buenos Aires","Una batalla en el Alto Perú"],c:0,d:1,why:"Fue el combate en el que las fuerzas de San Martín enfrentaron a realistas."},
{q:"¿Qué científico argentino recibió el Nobel por sus trabajos sobre la enfermedad de Chagas?",a:["Luis Federico Leloir","César Milstein","Bernardo Houssay","No hubo Nobel por ese tema"],c:3,d:2,why:"No se otorgó un Nobel por la enfermedad de Chagas. Houssay y Leloir ganaron Nobel por otros trabajos."},
{q:"¿Qué provincia es famosa por la Fiesta Nacional de la Vendimia?",a:["San Juan","Mendoza","La Rioja","Río Negro"],c:1,d:0,why:"La Fiesta Nacional de la Vendimia se celebra en Mendoza."},
{q:"¿Cuál de estos géneros musicales está especialmente asociado a Santiago del Estero?",a:["Chamamé","Chacarera","Candombe montevideano","Milonga surera exclusivamente"],c:1,d:1,why:"La chacarera es uno de los géneros más ligados a Santiago del Estero."},
{q:"¿Qué tratado puso fin a la Guerra de la Triple Alianza?",a:["Tratado de Pilar","No hubo un único tratado de paz general de ese tipo","Pacto Federal","Tratado de Tordesillas"],c:1,d:2,why:"El final del conflicto se dio mediante acuerdos y tratados separados, no un único tratado general con ese nombre."},
{q:"¿En qué provincia se encuentra Ischigualasto, conocido como Valle de la Luna?",a:["La Rioja","San Juan","Catamarca","San Luis"],c:1,d:0,why:"Ischigualasto está en San Juan."},
{q:"¿Qué ley estableció el voto secreto, obligatorio y universal masculino en 1912?",a:["Ley Sáenz Peña","Ley Avellaneda","Ley de Residencia","Ley de Educación Común"],c:0,d:2,why:"La Ley Sáenz Peña reformó el sistema electoral en 1912."},
{q:"¿Cuál es el nombre del glaciar más conocido del Parque Nacional Los Glaciares?",a:["Viedma solamente","Perito Moreno","Upsala no existe","Martial"],c:1,d:1,why:"El glaciar Perito Moreno es uno de los más famosos del parque."},
{q:"¿Qué poeta escribió el poema narrativo Martín Fierro?",a:["José Hernández","Leopoldo Lugones","Alfonsina Storni","Oliverio Girondo"],c:0,d:1,why:"Martín Fierro fue escrito por José Hernández."},
{q:"¿Qué provincia argentina limita con Chile y Paraguay?",a:["Salta","Chaco","Santa Fe","Entre Ríos"],c:0,d:2,why:"Salta limita con Chile y Paraguay, además de Bolivia."},
{q:"¿Qué científica argentina fue pionera en la investigación de la estructura de los virus y fue reconocida internacionalmente?",a:["Sandra Díaz","Andrea Gamarnik","Cecilia Grierson","Rebeca Gerschman"],c:1,d:2,why:"Andrea Gamarnik es reconocida por sus investigaciones sobre virus, incluido el dengue."},
{q:"¿Qué ciudad fue sede de la Reforma Universitaria de 1918?",a:["La Plata","Córdoba","Rosario","Buenos Aires"],c:1,d:1,why:"La Reforma Universitaria comenzó en la Universidad de Córdoba."}
];
const truths=[
{q:"Argentina tiene territorio en la Antártida.",t:true,why:"Argentina mantiene un reclamo territorial antártico y presencia científica."},
{q:"El Aconcagua está en San Juan.",t:false,why:"Está en Mendoza, cerca de la frontera con Chile."},
{q:"La Ley Sáenz Peña se sancionó en 1912.",t:true,why:"La ley electoral fue sancionada en 1912."},
{q:"Ushuaia queda en el norte argentino.",t:false,why:"Ushuaia está en Tierra del Fuego, en el extremo sur."},
{q:"El chamamé tiene una fuerte tradición en Corrientes.",t:true,why:"El chamamé es una expresión cultural central de Corrientes y la región."},
{q:"La Constitución Nacional fue sancionada en 1816.",t:false,why:"La Constitución Nacional fue sancionada en 1853."}
];
// Custom SVG illustrations: matched pairs use the same icon and never rely on emoji.
const svgIcons=[
'<path d="M20 18c-7 0-12-5-12-12 7 0 12 5 12 12Z"/><path d="M8 6c8 3 10 8 12 12"/><path d="M12 21h8"/>',
'<path d="M12 3 21 8v8l-9 5-9-5V8l9-5Z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
'<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9 7 7m10 10 2.1 2.1m0-14.2L17 7M7 17l-2.1 2.1"/>',
'<path d="M4 9c0-3 3-5 8-5s8 2 8 5v8c0 2-3 3-8 3s-8-1-8-3V9Z"/><path d="M4 9c0 2 3 3 8 3s8-1 8-3M8 5l8 14"/>',
'<path d="M5 20V9l7-5 7 5v11"/><path d="M9 20v-6h6v6M3 20h18"/>',
'<path d="m3 18 5-8 4 5 3-4 6 7H3Z"/><path d="m8 10 3-5 4 6"/>',
'<path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h5M8 16h7"/>',
'<circle cx="12" cy="12" r="8"/><path d="M12 7v5l4 2"/>'
];
const iconNames=["HOJA","GEOMETRÍA","SOL","MATE","CASA","MONTAÑA","LIBRO","RELOJ"];
let mode="quiz",queue=[],index=0,score=0,correct=0,streak=0,bestStreak=0,answered=false;
let memoryCards=[],firstCard=null,lockBoard=false,lives=3,matches=0,soundOn=false,runTimer=null,truthQueue=[];
let pendingResult=null;
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
// MODO PRUEBA: permite jugar cualquier día mientras verificamos Firebase.
// Para volver al modo público de sábados, cambiar TEST_MODE a false.
const TEST_MODE = true;
function isSaturday(){return TEST_MODE || new Date().getDay()===6}
function show(id){screens.forEach(x=>$(x).classList.toggle("active",x===id));window.scrollTo({top:0,behavior:"smooth"})}
function profile(){return read("fhw_profile",null)}
function aliasFor(name,code){const adj=["Ámbar","Cóndor","Criollo","Pampa","Tango","Andino","Mate","Zonda","Fénix","Gaucho","Sur","Dorado"];const nouns=["Secreto","Veloz","Bravo","Solar","Oculto","Firme","Astuto","Libre","Centella","Nómada"];const seed=(name+code).split("").reduce((n,c)=>n+c.charCodeAt(0),0);return `${adj[seed%adj.length]} ${nouns[(seed*7+3)%nouns.length]}`;}
function ensureProfile(){const p=profile();if(!p){show("profileScreen");$("realName").value="";$("playerTag").value="";return false}return true}
function renderHome(){
 const p=profile(), saturday=isSaturday();
 $("dayStatus").textContent=TEST_MODE?"MODO PRUEBA":saturday?"ARENA ABIERTA":"ARENA CERRADA";
 $("closedNotice").classList.toggle("hidden",saturday);
 document.querySelectorAll("[data-mode]").forEach(b=>{const used=attempts().includes(b.dataset.mode);b.disabled=!saturday||used;const cta=b.querySelector(".mode-cta");cta.textContent=!saturday?"ABRE EL SÁBADO":used?"INTENTO UTILIZADO":TEST_MODE?"PROBAR AHORA ↗":"ENTRAR ↗";});
 $("publicAlias").textContent=p?p.alias:"Todavía sin registrar";$("avatarGlyph").textContent=p?p.alias[0]:"?";$("profileHint").textContent=p?`Código ${p.code} · identidad privada`:"Ingresá tus datos antes de jugar";
 const remote=read("fhw_remote_scores",[]);
 const scores=remote;
 $("leaderboard").innerHTML=scores.length?scores.slice(0,5).map((x,i)=>`<div class="leader-row"><span class="leader-rank">${String(i+1).padStart(2,"0")}</span><span>${escapeHtml(x.alias || "Jugador")}</span><span class="leader-score">${Number(x.score||0).toLocaleString("es-AR")} pts</span></div>`).join(""):'<div class="leader-row"><span class="leader-rank">—</span><span>Esperando los primeros resultados</span><span class="leader-score">—</span></div>';
}
function attempts(){return read("fhw_attempts",[])}
function hasPlayed(m){return attempts().includes(m)}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function start(nextMode){
 if(!isSaturday()){renderHome();return}
 if(!ensureProfile())return;
 if(hasPlayed(nextMode)){alert("Ya usaste tu intento de este modo esta semana.");renderHome();return}
 mode=nextMode;index=0;score=0;correct=0;streak=0;bestStreak=0;answered=false;pendingResult=null;
 $("feedback").textContent="";$("feedback").className="feedback";
 $("gameModeLabel").textContent=modes[mode];show("gameScreen");
 if(mode==="quiz"){queue=shuffle(questions).slice(0,10);renderQuiz()}
 if(mode==="truth"){truthQueue=shuffle(truths);renderTruth()}
 if(mode==="memory"){startMemory()}
}
function progress(total){$("questionCounter").textContent=`${String(Math.min(index+1,total)).padStart(2,"0")} / ${String(total).padStart(2,"0")}`;$("progressFill").style.width=`${Math.min(index,total)/total*100}%`}
function renderQuiz(){
 if(index>=queue.length){finish();return}
 answered=false;const q=queue[index];progress(queue.length);
 const difficulty=q.d===0?"CALENTAMIENTO":q.d===1?"NIVEL MEDIO":"NIVEL EXPERTO";
 $("gameContent").innerHTML=`<div class="timer-row"><span>${difficulty} · PREGUNTA ${String(index+1).padStart(2,"0")}</span><span class="timer" id="timerValue">10s</span></div><div class="question-kicker">CULTURA ARGENTINA / ${difficulty}</div><h2 class="question-title">${q.q}</h2><div class="answers">${q.a.map((a,i)=>`<button class="answer" data-answer="${i}"><span class="answer-letter">${"ABCD"[i]}</span>${a}</button>`).join("")}</div>`;
 let time=10;clearInterval(runTimer);runTimer=setInterval(()=>{time--;const e=$("timerValue");if(e)e.textContent=`${time}s`;if(time<=0){clearInterval(runTimer);if(!answered)answerQuiz(-1,0)}},1000);
 document.querySelectorAll("[data-answer]").forEach(b=>b.addEventListener("click",()=>answerQuiz(+b.dataset.answer,time)));
}
function answerQuiz(choice,time){
 if(answered)return;answered=true;clearInterval(runTimer);const q=queue[index],good=choice===q.c;
 document.querySelectorAll("[data-answer]").forEach(b=>{b.disabled=true;let n=+b.dataset.answer;if(n===q.c)b.classList.add("correct");else if(n===choice)b.classList.add("wrong")});
 if(good){correct++;streak++;bestStreak=Math.max(bestStreak,streak);score+=(q.d===2?180:q.d===1?130:100)+Math.max(0,time)*5;$("feedback").className="feedback good";$("feedback").textContent=`¡Correcto! ${q.why}`;tone(true)}
 else{streak=0;$("feedback").className="feedback bad";$("feedback").textContent=`${choice<0?"Se terminó el tiempo.":"No era esa."} ${q.why}`;tone(false)}
 index++;$("progressFill").style.width=`${index/queue.length*100}%`;setTimeout(renderQuiz,1100)
}
function renderTruth(){
 if(index>=truthQueue.length){finish();return}
 answered=false;const q=truthQueue[index];progress(truthQueue.length);
 $("gameContent").innerHTML=`<div class="question-kicker">VERDAD O CHAMUYO · ${String(index+1).padStart(2,"0")}</div><h2 class="question-title">${q.q}</h2><div class="truth-actions"><button data-truth="true">✓ ES VERDAD</button><button data-truth="false">✕ ES CHAMUYO</button></div>`;
 document.querySelectorAll("[data-truth]").forEach(b=>b.addEventListener("click",()=>{if(answered)return;answered=true;const good=(b.dataset.truth==="true")===q.t;if(good){score+=100;correct++;streak++;bestStreak=Math.max(bestStreak,streak);$("feedback").className="feedback good";$("feedback").textContent=`¡Bien! ${q.why}`;tone(true)}else{streak=0;$("feedback").className="feedback bad";$("feedback").textContent=`No exactamente. ${q.why}`;tone(false)}index++;setTimeout(renderTruth,1100)}))
}
function svgFor(i){return `<svg class="card-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-label="${iconNames[i]}">${svgIcons[i]}</svg>`}
function startMemory(){
 lives=3;matches=0;firstCard=null;lockBoard=false;
 const pairs=shuffle([0,1,2,3,4,5,6,7]).flatMap((v)=>[{v,id:Math.random().toString(36).slice(2)},{v,id:Math.random().toString(36).slice(2)}]);
 memoryCards=shuffle(pairs);renderMemoryBoard(true);
}
function renderMemoryBoard(showAll){
 $("questionCounter").textContent=`${matches}/8 PARES`; $("progressFill").style.width=`${matches/8*100}%`;
 $("gameContent").innerHTML=`<div class="memory-meta"><span class="question-kicker">MEMORIA VISUAL / EMPAREJÁ</span><span class="lives" id="lifeDisplay">♥ ♥ ♥</span></div><h2 class="question-title">Encontrá los 8 pares.</h2><p class="memory-instruction" id="memoryInstruction">${showAll?"Memorizá las figuras durante 3 segundos.":"Tocá dos cartas para encontrar sus pares."}</p><div class="memory-board">${memoryCards.map((c,i)=>`<button class="memory-card ${showAll?"flipped":""}" data-card="${i}" ${showAll?"disabled":""}>${showAll?svgFor(c.v):'<span class="card-back">F</span>'}</button>`).join("")}</div><div class="memory-instruction">Vidas restantes: <strong id="lifeText">3</strong> · Parejas: <strong id="pairText">0/8</strong></div>`;
 if(showAll){clearTimeout(runTimer);runTimer=setTimeout(()=>{document.querySelectorAll(".memory-card").forEach(b=>{b.classList.remove("flipped");b.innerHTML='<span class="card-back">F</span>';b.disabled=false});$("memoryInstruction").textContent="Encontrá los pares. Tenés solo 3 vidas.";bindMemory()},3000)}else bindMemory()
}
function bindMemory(){
 document.querySelectorAll(".memory-card").forEach(btn=>btn.addEventListener("click",()=>flipCard(+btn.dataset.card,btn)))
}
function flipCard(i,btn){
 if(lockBoard||btn.disabled||btn.classList.contains("matched")||btn.classList.contains("flipped"))return;
 const c=memoryCards[i];btn.classList.add("flipped");btn.innerHTML=svgFor(c.v);
 if(!firstCard){firstCard={i,btn,v:c.v};return}
 lockBoard=true;const first=firstCard;firstCard=null;
 if(first.v===c.v){first.btn.classList.add("matched");btn.classList.add("matched");first.btn.disabled=true;btn.disabled=true;matches++;score+=100;correct++;$("pairText").textContent=`${matches}/8`;$("questionCounter").textContent=`${matches}/8 PARES`;$("progressFill").style.width=`${matches/8*100}%`;tone(true);lockBoard=false;if(matches===8){score+=250;$("feedback").className="feedback good";$("feedback").textContent="¡Memoria perfecta! Encontraste todos los pares.";setTimeout(finish,850)}}
 else{lives--;$("lifeDisplay").textContent=Array.from({length:3},(_,n)=>n<lives?"♥":"♡").join(" ");$("lifeText").textContent=lives;tone(false);if(lives<=0){document.querySelectorAll(".memory-card").forEach(b=>b.disabled=true);$("feedback").className="feedback bad";$("feedback").textContent="Te quedaste sin vidas. ¡Podés volver la próxima semana!";setTimeout(finish,1000)}else{setTimeout(()=>{first.btn.classList.remove("flipped");first.btn.innerHTML='<span class="card-back">F</span>';btn.classList.remove("flipped");btn.innerHTML='<span class="card-back">F</span>';lockBoard=false},850)}}
}
function finish(){
 clearInterval(runTimer);const total=mode==="quiz"?queue.length:mode==="truth"?truthQueue.length:8;const xp=Math.floor(score/10)+correct*5;
 const p=profile();pendingResult={mode,score,correct,total,bestStreak,xp,alias:p?.alias||"Jugador",code:p?.code||"—",date:new Date().toISOString()};
 $("resultTitle").textContent=score>=800?"¡Nivel de leyenda!":score>=450?"¡Muy buen juego!":"La próxima es tuya.";
 $("resultSubtitle").textContent=mode==="memory"?(matches===8?"Completaste todos los pares.":"Cada intento te entrena."):`Completaste ${modes[mode].toLowerCase()}.`;
 $("finalScore").textContent=score.toLocaleString("es-AR");$("finalCorrect").textContent=`${correct}/${total}`;$("finalStreak").textContent=bestStreak;$("finalXp").textContent=xp;
 $("resultAlias").textContent=p?.alias||"Jugador";$("resultCode").textContent=p?.code||"";$("saveScore").textContent="ENVIAR RESULTADO AL RANKING";show("resultScreen")
}
async function saveResult(){
 if(!pendingResult)return;
 $("saveScore").disabled=true;$("saveScore").textContent="ENVIANDO…";
 try{
   if(!window.FHW)throw new Error("Firebase no está disponible.");
   await window.FHW.submitScore(pendingResult);
   const played=attempts();if(!played.includes(mode)){played.push(mode);write("fhw_attempts",played)}
   $("saveScore").textContent="RESULTADO ENVIADO ✓";
   $("saveScore").disabled=true;
   renderHome();
 }catch(err){
   console.error(err);
   $("saveScore").disabled=false;$("saveScore").textContent="REINTENTAR ENVÍO";
   alert(err.message||"No se pudo enviar el resultado. Revisá la configuración y las reglas de Firestore.");
 }
}
function tone(ok){if(!soundOn)return;try{const C=window.AudioContext||window.webkitAudioContext,c=new C(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=ok?720:210;g.gain.value=.035;o.start();o.stop(c.currentTime+.09);o.onended=()=>c.close()}catch{}}
document.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>{if(!isSaturday()){renderHome();return}if(hasPlayed(b.dataset.mode)){alert("Ya usaste tu intento de este modo esta semana.");renderHome();return}start(b.dataset.mode)}));
$("profileForm").addEventListener("submit",async e=>{e.preventDefault();const realName=$("realName").value.trim(),provided=$("playerTag").value.trim();if(realName.length<2)return;const code=provided||"FH-"+Math.floor(1000+Math.random()*9000);const p={realName,code,alias:aliasFor(realName,code)};write("fhw_profile",p);try{if(window.FHW)await window.FHW.savePrivateProfile(p)}catch(err){console.error("No se pudo guardar el perfil privado:",err);alert("El perfil quedó guardado en este dispositivo, pero Firebase no pudo guardarlo. Revisá las reglas de Firestore.")}renderHome();show("homeScreen")});
$("editProfile").addEventListener("click",()=>{const p=profile();$("realName").value=p?.realName||"";$("playerTag").value=p?.code||"";show("profileScreen")});
$("profileBack").addEventListener("click",()=>{show("homeScreen");renderHome()});
$("backHome").addEventListener("click",()=>{clearInterval(runTimer);renderHome();show("homeScreen")});
$("goHome").addEventListener("click",()=>{renderHome();show("homeScreen")});
$("saveScore").addEventListener("click",saveResult);
$("soundToggle").addEventListener("click",()=>{soundOn=!soundOn;$("soundState").textContent=soundOn?"ON":"OFF";tone(true)});
window.addEventListener("fhw-leaderboard", e=>{
 const rows=e.detail||[];
 $("leaderboard").innerHTML=rows.length?rows.slice(0,5).map((x,i)=>`<div class="leader-row"><span class="leader-rank">${String(i+1).padStart(2,"0")}</span><span>${escapeHtml(x.alias||"Jugador")}</span><span class="leader-score">${Number(x.score||0).toLocaleString("es-AR")} pts</span></div>`).join(""):'<div class="leader-row"><span class="leader-rank">—</span><span>Esperando los primeros resultados</span><span class="leader-score">—</span></div>';
});
window.addEventListener("fhw-firebase-ready",()=>{const d=$("dayStatus");if(d && !TEST_MODE)d.textContent=isSaturday()?"ARENA ABIERTA":"ARENA CERRADA";});
window.addEventListener("fhw-firebase-error", e=>{console.warn("Firebase:",e.detail);const d=$("dayStatus");if(d)d.textContent="SIN CONEXIÓN";});
renderHome();
})();