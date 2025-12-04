// Painel do Administrador - resumo simples
(function () {
  const SESSION_KEY = "tarefando_user";
  const BASE = "/codigo/public/";

  function getCurrentUser() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function ensureAdmin() {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") {
      alert("Acesso restrito a administradores.");
      window.location.href = `${BASE}index.html`;
      return null;
    }
    return user;
  }

  function setNumber(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value == null ? "—" : value;
  }

  function setSessionInfo(user) {
    const emailEl = document.getElementById("sessaoEmail");
    const roleEl = document.getElementById("sessaoRole");
    if (emailEl) emailEl.textContent = `Logado como: ${user?.email || "—"}`;
    if (roleEl) roleEl.textContent = `Papel: ${user?.role === "admin" ? "Administrador" : (user?.role || "—")}`;
  }

  function parseStoredArray(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.items)) return data.items;
      return null;
    } catch (_) {
      return null;
    }
  }

  async function fetchJson(path) {
    const resp = await fetch(path);
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const text = await resp.text();
    if (!text) return [];
    try { return JSON.parse(text); } catch (err) { throw err; }
  }

  function lenFromData(data) {
    if (Array.isArray(data)) return data.length;
    if (data && Array.isArray(data.Caderno)) return data.Caderno.length;
    if (data && Array.isArray(data.disciplinas)) return data.disciplinas.length;
    if (data && Array.isArray(data.items)) return data.items.length;
    return null;
  }

  async function countFaculdades() {
    try {
      const data = await fetchJson("/codigo/db/faculdades.json");
      return lenFromData(data);
    } catch (_) {
      return null;
    }
  }

  async function countDisciplinas() {
    const stored = parseStoredArray("tarefando_disciplinas");
    if (stored) return stored.length;
    try {
      const data = await fetchJson("/codigo/db/disciplinas.json");
      return lenFromData(data);
    } catch (_) {
      return null;
    }
  }

  async function countGrupos() {
    try {
      const data = await fetchJson("/codigo/db/grupos.json");
      const len = lenFromData(data);
      return len != null ? len : 0;
    } catch (_) {
      return 0;
    }
  }

  async function countPlanos() {
    const stored = parseStoredArray("tarefando_planos");
    if (stored) return stored.length;
    try {
      const data = await fetchJson("/codigo/db/planos.json");
      return lenFromData(data);
    } catch (_) {
      return null;
    }
  }

  async function countCadernos() {
    try {
      const data = await fetchJson("/codigo/db/cadernos.json");
      const len = lenFromData(data);
      return len != null ? len : null;
    } catch (_) {
      return null;
    }
  }

  async function loadSummary() {
    const items = [
      ["countFaculdades", countFaculdades()],
      ["countDisciplinas", countDisciplinas()],
      ["countGrupos", countGrupos()],
      ["countPlanos", countPlanos()],
      ["countCadernos", countCadernos()]
    ];
    for (const [id, promise] of items) {
      try {
        const val = await promise;
        setNumber(id, val);
      } catch (_) {
        setNumber(id, null);
      }
    }
  }

  async function init() {
    const user = ensureAdmin();
    if (!user) return;
    setSessionInfo(user);
    loadSummary();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
