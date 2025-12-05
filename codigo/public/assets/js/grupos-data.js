// Fonte de dados local dos grupos
// Tenta ler /codigo/db/grupos.json, mas se não conseguir usa localStorage
// e, se ainda estiver vazio, preenche com um SEED padrão.

(function () {
  // Se o servidor permitir, tenta ler daqui.
  // Se der erro de caminho, CORS, etc., a app continua funcionando.
  const JSON_URL = "/codigo/db/grupos.json";
  const STORAGE_KEY = "grupos_db_v1";

  // Seed usado apenas se:
  // 1) fetch falhar E
  // 2) não houver nada no localStorage
  const SEED_GRUPOS = [
    {
      id: "1",
      nome: "Grupo de Cálculo I",
      descricao: "Revisão de exercícios e preparação para provas de Cálculo.",
      faculdade: "Puc Minas",
      curso: "Engenharia",
      membres: 18
    },
    {
      id: "2",
      nome: "Algoritmos e Estruturas de Dados",
      descricao: "Grupo para treinar lógica, listas, árvores e grafos.",
      faculdade: "Universidade de Eletria",
      curso: "Sistemas de Informação",
      membres: 24
    },
    {
      id: "3",
      nome: "História Moderna",
      descricao: "Discussões guiadas e resumos sobre História Moderna.",
      faculdade: "Instituto de História Antiga",
      curso: "História",
      membres: 12
    }
  ];

  // ---------- helpers básicos ----------
  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function readStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return asArray(parsed);
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
    if (!response.ok) throw new Error(`HTTP ${response.status} ao ler ${JSON_URL}`);

    const text = await response.text();
    if (!text.trim()) throw new Error("JSON de grupos vazio");

    const parsed = JSON.parse(text);
    const list = asArray(parsed);

    if (!list.length && !Array.isArray(parsed)) {
      throw new Error("Formato inválido de grupos.json");
    }

    return list;
  }

  // ---------- API pública usada pelo grupos.js ----------
  async function getAll() {
    // 1) tenta ler do localStorage primeiro
    let list = readStorage();
    if (list.length > 0) {
      return list;
    }

    // 2) se ainda não tiver nada, tenta buscar o JSON do servidor
    try {
      list = await loadFromJson();
      if (list.length > 0) {
        writeStorage(list);
        return list;
      }
    } catch (error) {
      console.warn(
        "Falha ao carregar /codigo/db/grupos.json, vou tentar continuar só com localStorage:",
        error
      );
    }

    // 3) se mesmo assim estiver vazio, usa o SEED padrão
    if (!list.length) {
      console.warn("Usando SEED_GRUPOS padrão (nenhum dado encontrado).");
      list = SEED_GRUPOS.slice();
      writeStorage(list);
    }

    return list;
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
      const n = parseInt(item && item.id, 10);
      return Number.isFinite(n) ? Math.max(max, n) : max;
    }, 0);
    return String(maxId + 1);
  }

  // Exposição global para o grupos.js
  window.GruposData = {
    getAll,
    getFromStorage,
    saveAll,
    generateId
  };
})();
