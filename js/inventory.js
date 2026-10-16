const KEY = 'freehand-world-prototype-v1';
const initialState = { crystals: [], memoryPassed: false, quizPassed: false, missionCompleted: false, xp: 0, badges: [] };
export function loadInventory() {
  try { return { ...initialState, ...(JSON.parse(localStorage.getItem(KEY)) || {}) }; }
  catch { return { ...initialState }; }
}
export function saveInventory(state) { localStorage.setItem(KEY, JSON.stringify(state)); }
export function resetInventory() { localStorage.removeItem(KEY); return { ...initialState }; }
