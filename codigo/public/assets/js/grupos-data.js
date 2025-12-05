// Fonte de dados local dos grupos
// Lê de /codigo/db/grupos.json, salva em localStorage e oferece uma API simples
(function () {
  const JSON_URL = "/codigo/db/grupos.json";
  const STORAGE_KEY = "grupos_db_v1";

  function safeParseArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function readStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return safeParseArray(parsed);
    } catch (error) {
      console.error("Erro ao ler grupos do localStorage:", error);
      return [];
    }
  }

  function writeStorage(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list || []));
    } catch (error) {
      console.error("Erro ao salvar grupos no localStorage:", error);
    }
  }

  async function loadFromJson() {
    const response = await fetch(JSON_URL, { method: "GET", cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    if (!text.trim()) throw new Error("JSON vazio");
    const parsed = JSON.parse(text);
    const list = safeParseArray(parsed);
    if (!list.length && !Array.isArray(parsed)) {
      throw new Error("Formato de grupos inválido");
    }
    return list;
  }

  async function getAll() {
    try {
      const list = await loadFromJson();
      writeStorage(list);
      return list;
    } catch (error) {
      console.warn("Falha ao carregar /codigo/db/grupos.json. Usando localStorage.", error);
      return readStorage();
    }
  }

  function getFromStorage() {
    return readStorage();
  }

  function saveAll(list) {
    writeStorage(list);
  }

  function generateId() {
    const list = readStorage();
    const maxId = list.reduce((max, item) => {
      const numeric = parseInt(item?.id, 10);
      return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
    }, 0);
    return String(maxId + 1);
  }

  window.GruposData = {
    getAll,
    getFromStorage,
    saveAll,
    generateId
  };
})();
