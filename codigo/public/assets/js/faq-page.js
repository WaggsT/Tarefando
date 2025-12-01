// faq-page.js
// CRUD de comentários + FAQ + formulário de contato
(function () {
  // ============================
  // 1) PERGUNTAS FREQUENTES
  // ============================
  const faqItemsEl = document.getElementById("faqItems");

  const faqs = [
    {
      id: 1,
      pergunta: "O Tarefando é gratuito?",
      resposta:
        "Sim. A versão usada neste projeto universitário é totalmente gratuita para estudantes e professores."
    },
    {
      id: 2,
      pergunta: "Preciso ter cadastro para ver os cadernos?",
      resposta:
        "Você pode visualizar alguns conteúdos públicos, mas para salvar cadernos, participar de grupos e comentar, é necessário criar uma conta."
    },
    {
      id: 3,
      pergunta: "Como funcionam os grupos de estudo?",
      resposta:
        "Os grupos são criados por alunos ou monitores, podem ser públicos ou privados e permitem centralizar materiais, avisos e links úteis."
    },
    {
      id: 4,
      pergunta: "Quais dados meus são armazenados?",
      resposta:
        "Somente dados básicos de perfil (nome, e-mail, curso) e conteúdos acadêmicos compartilhados. Não há coleta de dados sensíveis."
    },
    {
      id: 5,
      pergunta: "Posso usar o Tarefando em mais de uma faculdade?",
      resposta:
        "Sim. Você pode se vincular a múltiplas instituições e alternar entre elas conforme suas turmas e disciplinas."
    }
  ];

  function renderFaq() {
    if (!faqItemsEl) return;

    faqItemsEl.innerHTML = "";

    faqs.forEach((item) => {
      const article = document.createElement("article");
      article.className = "card faq-item";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "faq-question";
      button.setAttribute("aria-expanded", "false");
      button.innerHTML = `
        <span>${item.pergunta}</span>
        <span class="faq-icon" aria-hidden="true">+</span>
      `;

      const answer = document.createElement("div");
      answer.className = "faq-answer";
      answer.textContent = item.resposta;

      button.addEventListener("click", () => {
        const isOpen = article.classList.toggle("is-open");
        button.setAttribute("aria-expanded", String(isOpen));
        const icon = button.querySelector(".faq-icon");
        if (icon) icon.textContent = isOpen ? "−" : "+";
      });

      article.appendChild(button);
      article.appendChild(answer);
      faqItemsEl.appendChild(article);
    });
  }

  // ============================
  // 2) MURAL (CRUD via localStorage)
  // ============================
  const LS_KEY = "tarefando_mural_comentarios";

  const muralListEl = document.getElementById("muralList");
  const muralFormEl = document.getElementById("muralForm");
  const muralFormTitleEl = document.getElementById("muralFormTitle");
  const btnAddComentario = document.getElementById("btnAddComentario");
  const btnCancelarComentario = document.getElementById("btnCancelarComentario");

  const campoId = document.getElementById("comentarioId");
  const campoNome = document.getElementById("nomeComentario");
  const campoVinculo = document.getElementById("vinculoComentario");
  const campoTexto = document.getElementById("textoComentario");

  let muralItens = [];

  function loadMuralFromStorage() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        muralItens = JSON.parse(raw);
      } else {
        // valores iniciais para deixar o mural bonito
        muralItens = [
          {
            id: 1,
            nome: "Ana — Nutrição",
            vinculo: "Nutrição - 4º período",
            texto:
              "Uso o Tarefando para revisar provas antigas. Salvou minha vida em Bioquímica."
          },
          {
            id: 2,
            nome: "Lucas — Eng. Civil",
            vinculo: "Engenharia Civil - 7º período",
            texto:
              "A parte de grupos de estudo ajudou muito o pessoal da minha turma a compartilhar listas resolvidas."
          },
          {
            id: 3,
            nome: "Prof. Carla",
            vinculo: "Professora de Algoritmos",
            texto:
              "Comecei a indicar o Tarefando para centralizar monitorias e materiais extras por disciplina."
          }
        ];
        saveMuralToStorage();
      }
    } catch (e) {
      console.error("Erro ao carregar mural:", e);
      muralItens = [];
    }
  }

  function saveMuralToStorage() {
    localStorage.setItem(LS_KEY, JSON.stringify(muralItens));
  }

  function renderMural() {
    if (!muralListEl) return;
    muralListEl.innerHTML = "";

    if (!muralItens.length) {
      const empty = document.createElement("p");
      empty.className = "section-desc";
      empty.textContent = "Nenhum comentário ainda. Seja o primeiro a recomendar o Tarefando!";
      muralListEl.appendChild(empty);
      return;
    }

    muralItens.forEach((item) => {
      const card = document.createElement("article");
      card.className = "card mural-item";

      card.innerHTML = `
        <div class="mural-header">
          <strong>${item.nome}</strong>
          <span class="mural-vinculo">${item.vinculo || "Usuário do Tarefando"}</span>
        </div>
        <p class="mural-texto">${item.texto}</p>
        <div class="mural-actions-row">
          <button type="button" class="btnE btn--tiny" data-id="${item.id}">Editar</button>
          <button type="button" class="btnX btn--tiny" data-id="${item.id}">Excluir</button>
        </div>
      `;

      muralListEl.appendChild(card);
    });

    // Eventos de editar / excluir
    muralListEl.querySelectorAll(".btnE").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.getAttribute("data-id"));
        startEditComentario(id);
      });
    });

    muralListEl.querySelectorAll(".btnX").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.getAttribute("data-id"));
        deleteComentario(id);
      });
    });
  }

  function showMuralForm(isEdit) {
    if (!muralFormEl) return;
    muralFormEl.classList.remove("is-hidden");
    muralFormTitleEl.textContent = isEdit ? "Editar comentário" : "Novo comentário";
    campoNome.focus();
  }

  function hideMuralForm() {
    if (!muralFormEl) return;
    muralFormEl.classList.add("is-hidden");
    muralFormEl.reset();
    campoId.value = "";
  }

  function startNewComentario() {
    campoId.value = "";
    campoNome.value = "";
    campoVinculo.value = "";
    campoTexto.value = "";
    showMuralForm(false);
  }

  function startEditComentario(id) {
    const item = muralItens.find((m) => m.id === id);
    if (!item) return;
    campoId.value = String(item.id);
    campoNome.value = item.nome;
    campoVinculo.value = item.vinculo || "";
    campoTexto.value = item.texto;
    showMuralForm(true);
  }

  function deleteComentario(id) {
    if (!confirm("Tem certeza que deseja excluir este comentário?")) return;
    muralItens = muralItens.filter((m) => m.id !== id);
    saveMuralToStorage();
    renderMural();
  }

  function handleMuralSubmit(ev) {
    ev.preventDefault();
    const nome = (campoNome.value || "").trim();
    const vinculo = (campoVinculo.value || "").trim();
    const texto = (campoTexto.value || "").trim();

    if (!nome || !texto) {
      alert("Preencha pelo menos nome e comentário.");
      return;
    }

    const idStr = campoId.value;
    if (idStr) {
      // UPDATE
      const id = Number(idStr);
      const idx = muralItens.findIndex((m) => m.id === id);
      if (idx >= 0) {
        muralItens[idx] = { ...muralItens[idx], nome, vinculo, texto };
      }
    } else {
      // CREATE
      const novo = {
        id: Date.now(),
        nome,
        vinculo,
        texto
      };
      muralItens.unshift(novo); // adiciona no topo
    }

    saveMuralToStorage();
    renderMural();
    hideMuralForm();
  }

  // ============================
  // 3) FORMULÁRIO DE CONTATO
  // ============================
  const contatoForm = document.getElementById("contatoForm");

  function handleContatoSubmit(ev) {
    ev.preventDefault();
    // Apenas simulação
    alert("Mensagem enviada (simulação). Obrigado por entrar em contato com o Tarefando!");
    contatoForm.reset();
  }

  // ============================
  // 4) INICIALIZAÇÃO
  // ============================
  function init() {
    renderFaq();

    // Mural
    if (muralListEl) {
      loadMuralFromStorage();
      renderMural();
    }

    if (btnAddComentario) {
      btnAddComentario.addEventListener("click", startNewComentario);
    }

    if (btnCancelarComentario) {
      btnCancelarComentario.addEventListener("click", hideMuralForm);
    }

    if (muralFormEl) {
      muralFormEl.addEventListener("submit", handleMuralSubmit);
    }

    if (contatoForm) {
      contatoForm.addEventListener("submit", handleContatoSubmit);
    }

    // Ano no footer (igual à home, se quiser)
    const y = document.getElementById("y");
    if (y) y.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
