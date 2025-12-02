document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formulario-de-disciplinas");
  const lista = document.getElementById("lista-de-disciplinas");
  const selectFaculdade = document.getElementById("faculdade");
  const campoId = document.getElementById("disciplinas-id");
  const campoNome = document.getElementById("nome");
  const campoDesc = document.getElementById("descricao");
  const campoProf = document.getElementById("professor");
  const btnEnviar = document.getElementById("botao-enviar");
  const scrollContainer = document.getElementById("lista-de-disciplinas");
  const btnEsq = document.getElementById("btn-esquerda");
  const btnDir = document.getElementById("btn-direita");

  if (!form || !lista || !selectFaculdade) return;

  const STORAGE_KEY = "tarefando_disciplinas";
  const FACULDADES_URL = "/codigo/db/faculdades.json";
  const DISCIPLINAS_URL = "/codigo/db/disciplinas.json";

  let disciplinas = [];
  let mapFaculdades = {}; // id -> nome

  function normalizarLista(json) {
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.disciplinas)) return json.disciplinas;
    if (Array.isArray(json?.data)) return json.data;
    if (json && typeof json === "object") {
      // se for um objeto único com campos de disciplina, embrulha em array
      if ("id" in json && ("name" in json || "descricao" in json)) return [json];
      return Object.values(json);
    }
    return [];
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : null;
    } catch (_) {
      return null;
    }
  }
  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(disciplinas || []));
    } catch (_) {}
  }

  async function carregarFaculdades() {
    try {
      const resp = await fetch(FACULDADES_URL, { cache: "no-store" });
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const data = await resp.json();
      const faculdades = normalizarLista(data);

      selectFaculdade.innerHTML = '<option value="">-- Selecione uma Faculdade --</option>';
      mapFaculdades = {};
      faculdades.forEach((f) => {
        const id = f?.id;
        const nome = f?.name || f?.nome || "Sem nome";
        if (id == null) return;
        mapFaculdades[String(id)] = nome;
        const opt = document.createElement("option");
        opt.value = String(id);
        opt.textContent = nome;
        selectFaculdade.appendChild(opt);
      });
    } catch (err) {
      console.error("Erro ao carregar faculdades", err);
      selectFaculdade.innerHTML = '<option value="">Erro ao carregar faculdades</option>';
    }
  }

  async function carregarDisciplinas() {
    const stored = loadFromStorage();
    if (stored) {
      disciplinas = stored;
      render();
      return;
    }
    try {
      const resp = await fetch(DISCIPLINAS_URL, { cache: "no-store" });
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const data = await resp.json();
      disciplinas = normalizarLista(data);
      saveToStorage();
      render();
    } catch (err) {
      console.error("Erro ao buscar disciplinas", err);
      lista.innerHTML = `<h2 class="warning">Erro ao buscar disciplinas</h2>`;
    }
  }

  function render() {
    lista.innerHTML = "";
    if (!Array.isArray(disciplinas) || disciplinas.length === 0) {
      lista.innerHTML = '<h5 class="text-muted">Nenhuma disciplina cadastrada.</h5>';
      return;
    }

    disciplinas.forEach((disc) => {
      const nomeFac = mapFaculdades[String(disc.faculdade_id)] || "Faculdade desconhecida";
      const card = document.createElement("div");
      card.className = "card card-disciplina";
      const seed = disc.id || disc.name || "disciplina";
      const imageUrl = `https://picsum.photos/seed/disciplina-${encodeURIComponent(seed)}/400/240`;
      card.innerHTML = `
        <div class="card-thumb" style="background-image:url('${imageUrl}')"></div>
        <div class="card-body">
          <h5 class="card-title">Disciplina:</h5>
          <p>${disc.name || "Sem nome"}</p>

          <h6 class="card-subtitle mb-2 text-muted">Descrição:</h6>
          <p>${disc.descricao || "Sem descrição"}</p>

          <h6 class="card-subtitle mb-2 text-muted">Professor:</h6>
          <p>${disc.professor || "Sem professor"}</p>

          <h6 class="card-subtitle mb-2 text-muted">Faculdade:</h6>
          <p>${nomeFac}</p>

          <div class="mt-2" style="display:flex;gap:.5rem;flex-wrap:wrap">
            <button class="botao-editar btnE btn-sm" data-id="${disc.id}">Editar</button>
            <button class="botao-excluir btnX btn-sm" data-id="${disc.id}">Excluir</button>
          </div>
        </div>
      `;
      lista.appendChild(card);
    });
  }

  function limparFormulario() {
    form.reset();
    campoId.value = "";
    if (btnEnviar) btnEnviar.textContent = "Adicionar Disciplina";
  }

  async function criarDisciplina(disc) {
    const nextId = disciplinas.length ? Math.max(...disciplinas.map(d => Number(d.id) || 0)) + 1 : 1;
    disciplinas.push({ ...disc, id: nextId });
    saveToStorage();
  }

  async function atualizarDisciplina(id, disc) {
    disciplinas = disciplinas.map(d => String(d.id) === String(id) ? { ...d, ...disc, id: d.id } : d);
    saveToStorage();
  }

  async function excluirDisciplina(id) {
    disciplinas = disciplinas.filter(d => String(d.id) !== String(id));
    saveToStorage();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = campoId.value;
    const name = campoNome.value.trim();
    const descricao = campoDesc.value.trim();
    const professor = campoProf.value.trim();
    const faculdade_id = selectFaculdade.value;

    if (!faculdade_id) {
      alert("Por favor, selecione uma faculdade.");
      return;
    }

    const disc = { name, descricao, professor, faculdade_id: Number(faculdade_id) };
    if (id) {
      await atualizarDisciplina(id, disc);
    } else {
      await criarDisciplina(disc);
    }
    render();
    limparFormulario();
  });

  lista.addEventListener("click", async (e) => {
    const alvo = e.target;
    const id = alvo.dataset.id;
    if (!id) return;

    if (alvo.classList.contains("botao-editar")) {
      const encontrada = disciplinas.find((d) => String(d.id) === String(id));
      if (encontrada) {
        campoId.value = encontrada.id;
        campoNome.value = encontrada.name || "";
        campoDesc.value = encontrada.descricao || "";
        campoProf.value = encontrada.professor || "";
        selectFaculdade.value = encontrada.faculdade_id || "";
        if (btnEnviar) btnEnviar.textContent = "Atualizar Disciplina";
      }
    }

    if (alvo.classList.contains("botao-excluir")) {
      if (confirm("Tem certeza que deseja excluir esta disciplina?")) {
        await excluirDisciplina(id);
        render();
      }
    }
  });

  if (btnEsq && btnDir && scrollContainer) {
    const scroll = (delta) => { scrollContainer.scrollLeft += delta; };
    btnEsq.addEventListener("click", () => scroll(-200));
    btnDir.addEventListener("click", () => scroll(200));
  }

  carregarFaculdades();
  carregarDisciplinas();
});
