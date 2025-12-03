// CRUD de planos de assinatura (frontend-only)
(function () {
  const STORAGE_KEY = "tarefando_planos";
  const currentUser = typeof window.getCurrentUser === "function" ? window.getCurrentUser() : null;
  const isAdmin = currentUser && currentUser.role === "admin";

  const planosGrid = document.getElementById("planosGrid");
  const btnNovo = document.getElementById("btnNovoPlano");
  const drawer = document.getElementById("drawerPlano");
  const drawerTitulo = document.getElementById("drawerTitulo");
  const btnFechar = document.getElementById("btnFecharDrawer");
  const btnCancelar = document.getElementById("btnCancelar");
  const form = document.getElementById("formPlano");
  const formErro = document.getElementById("formErro");
  const campoId = document.getElementById("planoId");
  const campoNome = document.getElementById("planoNome");
  const campoDesc = document.getElementById("planoDescricao");
  const campoPreco = document.getElementById("planoPreco");

  function moeda(valor) {
    const n = Number(valor || 0);
    if (n === 0) return "Gratuito";
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function cardDescription(nome) {
    if (nome.toLowerCase().includes("gratuito")) {
      return "Acesso ilimitado aos conteúdos públicos. Pode postar cadernos e atividades, responder chats e participar de grupos e monitorias. Não cria monitorias.";
    }
    if (nome.toLowerCase().includes("essencial")) {
      return "Ideal para monitores: crie e venda monitorias definindo seu preço. Acesso completo a conteúdos e suporte básico.";
    }
    if (nome.toLowerCase().includes("equipe")) {
      return "Para centros acadêmicos e ligas: venda materiais premium e monitorias com gestão colaborativa entre membros.";
    }
    return null;
  }

  function render(planos) {
    if (!planosGrid) return;
    if (!Array.isArray(planos) || planos.length === 0) {
      planosGrid.innerHTML = `<p class="section-desc">Nenhum plano cadastrado.</p>`;
      return;
    }
    planosGrid.innerHTML = planos.map(p => `
      <article class="card plano-card" style="display:flex;flex-direction:column;gap:.5rem;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem;">
          <h3 style="margin:0">${p.nome || "Plano"}</h3>
          <span class="tag" style="background:rgba(179,76,72,.12);color:var(--brand);padding:.25rem .7rem;border-radius:999px;font-weight:700;">${moeda(p.preco)}</span>
        </div>
        <p class="section-desc plano-desc">${p.descricao || cardDescription(p.nome) || "Plano disponível para assinatura."}</p>
        ${isAdmin ? `
          <div class="form-actions" style="justify-content:flex-end;gap:.5rem;">
            <button class="btn btn-admin-only" data-edit="${p.id}">Editar</button>
            <button class="btn btn--ghost btn-admin-only" data-delete="${p.id}">Excluir</button>
          </div>` : ``}
      </article>
    `).join("");

    if (isAdmin) {
      planosGrid.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => editPlano(btn.dataset.edit)));
      planosGrid.querySelectorAll("[data-delete]").forEach(btn => btn.addEventListener("click", () => deletePlano(btn.dataset.delete)));
    }
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

  async function loadInitial() {
    const storage = loadFromStorage();
    if (storage) return storage;
    try {
      const resp = await fetch("/codigo/db/planos.json");
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const data = await resp.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Erro ao carregar planos iniciais", err);
      return [];
    }
  }

  function save(planos) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(planos || []));
    } catch (_) {}
  }

  let state = [];

  function openDrawer(editing = null) {
    if (!isAdmin) return;
    if (!drawer) return;
    drawer.style.display = "block";
    drawerTitulo.textContent = editing ? "Editar plano" : "Novo plano";
    formErro.textContent = "";
    if (editing) {
      campoId.value = editing.id;
      campoNome.value = editing.nome || "";
      campoDesc.value = editing.descricao || "";
      campoPreco.value = editing.preco != null ? editing.preco : "";
    } else {
      campoId.value = "";
      campoNome.value = "";
      campoDesc.value = "";
      campoPreco.value = "";
    }
    campoNome.focus();
  }

  function closeDrawer() {
    if (drawer) drawer.style.display = "none";
    formErro.textContent = "";
  }

  function editPlano(id) {
    if (!isAdmin) return;
    const plano = state.find(p => String(p.id) === String(id));
    if (!plano) return;
    openDrawer(plano);
  }

  function deletePlano(id) {
    if (!isAdmin) return;
    if (!confirm("Deseja excluir este plano?")) return;
    state = state.filter(p => String(p.id) !== String(id));
    save(state);
    render(state);
  }

  function hideAdminButtonsForVisitors() {
    if (isAdmin) return;
    document.querySelectorAll(".btn-admin-only").forEach(btn => {
      btn.style.display = "none";
      btn.setAttribute("aria-hidden", "true");
      if ("disabled" in btn) btn.disabled = true;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!isAdmin) return;
    formErro.textContent = "";
    const nome = campoNome.value.trim();
    const descricao = campoDesc.value.trim();
    const preco = Number(campoPreco.value);

    if (!nome || !descricao || isNaN(preco) || preco < 0) {
      formErro.textContent = "Preencha nome, descrição e preço (>= 0).";
      return;
    }

    const idEdit = campoId.value;
    if (idEdit) {
      state = state.map(p => String(p.id) === String(idEdit) ? { ...p, nome, descricao, preco } : p);
    } else {
      const newId = state.length ? Math.max(...state.map(p => Number(p.id) || 0)) + 1 : 1;
      state.push({ id: newId, nome, descricao, preco });
    }
    save(state);
    render(state);
    closeDrawer();
  }

  async function init() {
    if (!planosGrid) return;
    hideAdminButtonsForVisitors();
    state = await loadInitial();
    render(state);
    if (btnNovo) {
      if (isAdmin) {
        btnNovo.style.display = "";
        btnNovo.addEventListener("click", () => openDrawer(null));
      } else {
        btnNovo.style.display = "none";
      }
    }
    if (btnFechar) btnFechar.addEventListener("click", closeDrawer);
    if (btnCancelar) btnCancelar.addEventListener("click", closeDrawer);
    if (form) form.addEventListener("submit", handleSubmit);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
