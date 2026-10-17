(() => {
  const $ = (id) => document.getElementById(id);
  const status = $("connection"), message = $("message"), play = $("play");
  let currentUser = null;
  const setMessage = (text, type = "") => { message.textContent = text; message.className = "message " + type; };

  function friendlyError(err) {
    console.error("[FREEHANDWORLD]", err);
    if (err?.code === "permission-denied" || err?.code === "firestore/permission-denied") {
      return "Firebase rechazó la escritura (permission-denied). Revisá las reglas de Firestore.";
    }
    if (err?.code === "auth/operation-not-allowed") return "La autenticación anónima no está habilitada en Firebase.";
    if (err?.code === "unavailable") return "Firebase no está disponible. Revisá tu conexión e intentá otra vez.";
    return `No se pudo completar la operación${err?.code ? " (" + err.code + ")" : ""}. Mirá la consola del navegador para el detalle.`;
  }

  async function start() {
    if (!window.fhFirebaseReady) throw window.fhFirebaseError || new Error("Firebase no inicializó");
    const credential = await window.fhAuth.signInAnonymously();
    currentUser = credential.user;
    status.textContent = "Firebase conectado";
    status.style.color = "var(--green)";
  }

  async function loadRanking() {
    const list = $("ranking");
    try {
      const snap = await window.fhDb.collection("publicScores")
        .orderBy("createdAt", "desc").limit(20).get();
      if (snap.empty) {
        list.innerHTML = '<li class="empty">Todavía no hay puntajes guardados.</li>';
        return;
      }
      const rows = snap.docs.map(d => d.data()).sort((a,b) => (b.score || 0) - (a.score || 0));
      list.innerHTML = "";
      rows.forEach((row, i) => {
        const li = document.createElement("li");
        const rank = document.createElement("span"); rank.className = "rank"; rank.textContent = String(i + 1).padStart(2, "0");
        const name = document.createElement("span"); name.className = "player"; name.textContent = row.alias || "Jugador";
        const score = document.createElement("span"); score.className = "score"; score.textContent = `${Number(row.score) || 0} pts`;
        li.append(rank, name, score); list.appendChild(li);
      });
    } catch (err) {
      $("ranking").innerHTML = '<li class="empty">No se pudo leer el ranking. Revisá la consola.</li>';
      throw err;
    }
  }

  async function testGame() {
    play.disabled = true;
    try {
      if (!currentUser) await start();
      const alias = $("alias").value.trim();
      if (alias.length < 2 || alias.length > 40) throw new Error("El alias debe tener entre 2 y 40 caracteres.");
      // Partida de prueba determinista para validar escritura/lectura; no es aún un modo de juego real.
      const score = 100;
      await window.fhDb.collection("publicScores").add({
        uid: currentUser.uid,
        week: new Date().toISOString().slice(0, 10),
        mode: "quiz",
        score,
        alias,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      setMessage("Puntaje de prueba guardado. Actualizando el ranking…", "success");
      await loadRanking();
      setMessage("¡Guardado y visible! La conexión de ranking está funcionando.", "success");
    } catch (err) {
      setMessage(err.message && !err.code ? err.message : friendlyError(err), "error");
      console.error("Error al guardar puntaje de prueba:", err);
    } finally {
      play.disabled = false;
    }
  }

  play.addEventListener("click", testGame);
  $("refresh").addEventListener("click", async () => {
    try { await loadRanking(); setMessage("Ranking actualizado.", "success"); }
    catch (err) { setMessage(friendlyError(err), "error"); }
  });

  (async () => {
    try {
      await start();
      await loadRanking();
      setMessage("Conexión lista. El botón guarda un puntaje de prueba de 100 puntos.");
    } catch (err) {
      status.textContent = "Error de conexión";
      status.style.color = "#ff8f8f";
      setMessage(friendlyError(err), "error");
    }
  })();
})();
