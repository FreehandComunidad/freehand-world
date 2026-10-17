/* Firebase integration for FREEHANDWORLD Quiz.
   Uses the existing Firebase project. Do not paste service-account keys here. */
(() => {
  const firebaseConfig = {
    apiKey: "AIzaSyB3F7hhqnnV8kzoNoeLM0OkUzS7_bZ9Gww",
    authDomain: "freehand-world.firebaseapp.com",
    projectId: "freehand-world",
    storageBucket: "freehand-world.firebasestorage.app",
    messagingSenderId: "925818750680",
    appId: "1:925818750680:web:af7212206d3a14565df9ad"
  };

  const api = {
    ready: false,
    uid: null,
    db: null,
    auth: null,
    async init() {
      if (this.ready) return true;
      if (!window.firebase) throw new Error("No se pudo cargar Firebase.");
      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      this.auth = firebase.auth();
      this.db = firebase.firestore();
      await this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      const credential = await this.auth.signInAnonymously();
      this.uid = credential.user.uid;
      this.ready = true;
      this.listenLeaderboard();
      return true;
    },
    weekKey(date = new Date()) {
      // ISO week, based on local date. Server rules still gate writes by Saturday.
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const day = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - day);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return `${d.getUTCFullYear()}-${String(week).padStart(2,"0")}`;
    },
    async savePrivateProfile(profile) {
      await this.init();
      const payload = {
        realName: String(profile.realName || "").slice(0, 50),
        playerCode: String(profile.code || "").slice(0, 24),
        publicAlias: String(profile.alias || "").slice(0, 40),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      await this.db.collection("privateProfiles").doc(this.uid).set(payload, {merge:true});
    },
    async submitScore(result) {
      await this.init();
      const now = new Date();
      if (now.getDay() !== 6) throw new Error("La arena solo acepta resultados los sábados.");
      const week = this.weekKey(now);
      const mode = String(result.mode);
      const score = Math.max(0, Math.min(5000, Math.floor(Number(result.score) || 0)));
      const attemptId = `${this.uid}_${week}_${mode}`;
      const scoreRef = this.db.collection("publicScores").doc(attemptId);
      const attemptRef = this.db.collection("attempts").doc(attemptId);
      const privateRef = this.db.collection("privateProfiles").doc(this.uid);
      const publicProfile = JSON.parse(localStorage.getItem("fhw_profile") || "null");
      const alias = String(publicProfile?.alias || "Jugador").slice(0, 40);
      await this.db.runTransaction(async tx => {
        const existing = await tx.get(attemptRef);
        if (existing.exists) throw new Error("Ya usaste tu intento de este modo esta semana.");
        tx.set(attemptRef, {
          uid: this.uid, week, mode, score,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        tx.set(scoreRef, {
          uid: this.uid, week, mode, score, alias,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
      return {week, score};
    },
    listenLeaderboard() {
      if (!this.db) return;
      const week = this.weekKey();
      this.db.collection("publicScores")
        .where("week", "==", week)
        .orderBy("score", "desc")
        .limit(25)
        .onSnapshot(snapshot => {
          const rows = snapshot.docs.map(doc => doc.data());
          localStorage.setItem("fhw_remote_scores", JSON.stringify(rows));
          window.dispatchEvent(new CustomEvent("fhw-leaderboard", {detail: rows}));
        }, error => {
          console.warn("Ranking remoto no disponible:", error.message);
          window.dispatchEvent(new CustomEvent("fhw-firebase-error", {detail:error.message}));
        });
    }
  };
  window.FHW = api;
  window.addEventListener("DOMContentLoaded", () => {
    api.init().then(() => {
      document.documentElement.dataset.firebase = "connected";
      window.dispatchEvent(new CustomEvent("fhw-firebase-ready"));
    }).catch(err => {
      console.error(err);
      document.documentElement.dataset.firebase = "offline";
      window.dispatchEvent(new CustomEvent("fhw-firebase-error", {detail:err.message}));
    });
  });
})();