// Grupos - consumo apenas de GruposData (JSON local + localStorage)
(function () {
  const state = { grupos: [], filtro: "" };
  let tempIdCounter = null;

  const $ = (selector) => document.querySelector(selector);
  const esc = (value = "") =>
    String(value).replace(/[&<>\"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);

  const drawer = $("#grupoDrawer");
  const btnCriar = $("#btnCriarGrupo");
  const btnFechar = $("#closeDrawer");
  const btnCancelar = $("#cancelDrawer");
  const form = $("#grupoForm");
  const statusMsg = $("#formStatus");

  function nextTempId() {
    if (tempIdCounter === null) {
      const seed = parseInt(window.GruposData.generateId(), 10);
      tempIdCounter = Number.isFinite(seed) ? seed : 1;
    }
    return String(tempIdCounter++);
  }

  function toTags(value) {
    if (!value) return [];
    return value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function normalizeGroup(group) {
    const id = group?.id != null ? String(group.id) : nextTempId();
    const tags = Array.isArray(group?.tags)
      ? group.tags
      : typeof group?.tags === "string"
        ? toTags(group.tags)
        : [];
    const participa = Boolean(group?.participa || group?.ehMeu || group?.meu || group?.isMine);
    const criadoPorUsuario = Boolean(
      group?.criadoPorUsuario || group?.ehMeu || group?.meu || group?.isMine
    );

    return {
      id,
      titulo: group?.titulo || group?.name || "Sem título",
      descricao: group?.descricao || group?.descricao_curta || "Sem descrição",
      faculdade: group?.faculdade || group?.curso || "",
      curso: group?.curso || group?.faculdade || "",
      membros: Number(group?.membros ?? group?.participantes ?? 0) || 0,
      posts_semana: Number(group?.posts_semana ?? group?.postsSemana ?? 0) || 0,
      capa: group?.capa || group?.imagem || "",
      tags,
      participa,
      criadoPorUsuario
    };
  }

  function normalizeList(data) {
    if (!Array.isArray(data)) return [];
    const seen = new Set();
    const list = [];
    data.forEach((item) => {
      const normalized = normalizeGroup(item || {});
      if (seen.has(normalized.id)) return;
      seen.add(normalized.id);
      list.push(normalized);
    });
    return list;
  }

  function salvarGrupos() {
    window.GruposData.saveAll(state.grupos);
  }

  function getMeusGrupos() {
    return state.grupos.filter((g) => g.participa);
  }

  function getOutrosGrupos() {
    return state.grupos.filter((g) => !g.participa);
  }

  function aplicarFiltro(lista) {
    if (!state.filtro) return lista;
    const term = state.filtro.toLowerCase();
    return lista.filter((g) => {
      const textoBase = `${g.titulo || ""} ${g.descricao || ""} ${(g.tags || []).join(" ")}`.toLowerCase();
      return textoBase.includes(term);
    });
  }

  function cardHTML(grupo, isMeu) {
    const capa = esc(grupo.capa || `https://picsum.photos/640/360?seed=${grupo.id}`);
    const tags = grupo.tags && grupo.tags.length ? `<span>${grupo.tags.map(esc).join(", ")}</span>` : "";
    const actions = isMeu
      ? `<button class="btn btn--ghost" data-edit="${esc(grupo.id)}">Editar</button>
         <button class="btn btn--ghost" data-delete="${esc(grupo.id)}">Excluir</button>`
      : `<button class="cta" data-join="${esc(grupo.id)}">Participar</button>`;

    return `
      <article class="card group">
        <div class="card-media" style="background-image:url('${capa}')"></div>
        <div class="group-body">
          <h3>${esc(grupo.titulo)}</h3>
          <p class="group-desc">${esc(grupo.descricao)}</p>
          <div class="group-meta" style="display:flex;flex-direction:column;gap:.25rem">
            <span>${Number(grupo.membros || 0)} participantes</span>
            <span>${esc(grupo.faculdade || "Faculdade não informada")}</span>
            ${tags}
          </div>
          <div class="group-actions" style="display:flex;gap:.5rem;flex-wrap:wrap">
            ${actions}
          </div>
        </div>
      </article>
    `;
  }

  function renderSecao(lista, containerId, emptyId, emptyMsg, isMeu) {
    const container = document.getElementById(containerId);
    const empty = document.getElementById(emptyId);
    if (!container || !empty) return;

    const dados = aplicarFiltro(lista);
    if (!dados.length) {
      container.innerHTML = "";
      empty.textContent = emptyMsg;
      empty.style.display = "block";
      return;
    }

    container.innerHTML = dados.map((g) => cardHTML(g, isMeu)).join("");
    empty.style.display = "none";
  }

  function renderizar() {
    renderSecao(
      getMeusGrupos(),
      "meusGruposList",
      "meusGruposEmpty",
      "Você ainda não participa de nenhum grupo.",
      true
    );
    renderSecao(
      getOutrosGrupos(),
      "outrosGruposList",
      "outrosGruposEmpty",
      "Nenhum grupo encontrado. Ajuste a busca ou crie um novo grupo.",
      false
    );
  }

  function abrirDrawer(titulo) {
    if (!drawer) return;
    $("#drawerTitle").textContent = titulo;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
  }

  function fecharDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    form?.reset();
    if (form?.dataset) delete form.dataset.editingId;
    if (statusMsg) statusMsg.textContent = "";
  }

  function preencherFormulario(grupo) {
    if (!form || !grupo) return;
    form.dataset.editingId = grupo.id;
    $("#grupo_nome").value = grupo.titulo || "";
    $("#grupo_descricao").value = grupo.descricao || "";
    $("#grupo_faculdade").value = grupo.faculdade || "";
    $("#grupo_tags").value = (grupo.tags || []).join(", ");
    $("#grupo_capa").value = grupo.capa || "";
  }

  function criarOuAtualizar(e) {
    e.preventDefault();
    if (!form) return;
    const editId = form.dataset?.editingId;
    const nome = $("#grupo_nome")?.value.trim() || "Sem título";
    const descricao = $("#grupo_descricao")?.value.trim() || "Sem descrição";
    const faculdade = $("#grupo_faculdade")?.value.trim() || "";
    const tags = toTags($("#grupo_tags")?.value || "");
    const capa = $("#grupo_capa")?.value.trim() || "";

    if (editId) {
      const idx = state.grupos.findIndex((g) => String(g.id) === String(editId));
      if (idx !== -1) {
        state.grupos[idx] = {
          ...state.grupos[idx],
          titulo: nome,
          descricao,
          faculdade,
          curso: faculdade || state.grupos[idx].curso,
          tags,
          capa
        };
      }
      if (statusMsg) statusMsg.textContent = "Alterações salvas.";
    } else {
      const novoGrupo = {
        id: window.GruposData.generateId(),
        titulo: nome,
        descricao,
        faculdade,
        curso: faculdade,
        tags,
        capa,
        membros: 1,
        participa: true,
        criadoPorUsuario: true
      };
      state.grupos.unshift(novoGrupo);
      if (statusMsg) statusMsg.textContent = "Grupo criado!";
    }

    salvarGrupos();
    renderizar();
    setTimeout(fecharDrawer, 250);
  }

  function handleClick(e) {
    const joinBtn = e.target.closest("[data-join]");
    const editBtn = e.target.closest("[data-edit]");
    const deleteBtn = e.target.closest("[data-delete]");

    if (joinBtn) {
      const id = String(joinBtn.dataset.join);
      const grupo = state.grupos.find((g) => String(g.id) === id);
      if (grupo && !grupo.participa) {
        grupo.participa = true;
        grupo.membros = Math.max(Number(grupo.membros) || 0, 0) + 1;
        salvarGrupos();
        renderizar();
      }
      e.preventDefault();
      return;
    }

    if (editBtn) {
      const id = String(editBtn.dataset.edit);
      const grupo = state.grupos.find((g) => String(g.id) === id);
      if (!grupo) return;
      if (!grupo.criadoPorUsuario) {
        alert("Apenas grupos criados por você podem ser editados.");
        return;
      }
      preencherFormulario(grupo);
      abrirDrawer("Editar grupo");
      e.preventDefault();
      return;
    }

    if (deleteBtn) {
      const id = String(deleteBtn.dataset.delete);
      const grupo = state.grupos.find((g) => String(g.id) === id);
      if (!grupo) return;
      if (!grupo.criadoPorUsuario) {
        alert("Apenas grupos criados por você podem ser excluídos.");
        return;
      }
      if (!confirm("Excluir este grupo?")) return;
      state.grupos = state.grupos.filter((g) => String(g.id) !== id);
      salvarGrupos();
      renderizar();
      e.preventDefault();
    }
  }

  function handleFiltro(e) {
    if (e.target && e.target.id === "searchGrupos") {
      state.filtro = (e.target.value || "").trim().toLowerCase();
      renderizar();
    }
  }

  btnCriar?.addEventListener("click", () => {
    form?.reset();
    if (form?.dataset) delete form.dataset.editingId;
    abrirDrawer("Criar grupo");
    $("#grupo_nome")?.focus();
  });
  btnFechar?.addEventListener("click", fecharDrawer);
  btnCancelar?.addEventListener("click", fecharDrawer);
  drawer?.addEventListener("click", (event) => {
    if (event.target === drawer) fecharDrawer();
  });
  form?.addEventListener("submit", criarOuAtualizar);
  document.addEventListener("click", handleClick);
  document.addEventListener("input", handleFiltro);

  (async function init() {
    try {
      const carregados = await window.GruposData.getAll();
      state.grupos = normalizeList(carregados);
    } catch (error) {
      console.warn("Não foi possível carregar grupos do JSON, usando localStorage.", error);
      state.grupos = normalizeList(window.GruposData.getFromStorage());
    }
    if (!state.grupos.length) {
      state.grupos = normalizeList(window.GruposData.getFromStorage());
    }
    salvarGrupos();
    renderizar();
  })();
})();
