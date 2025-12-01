document.addEventListener('DOMContentLoaded', () => {
  // Se a página não tiver o formulário/área de lista, sai silenciosamente.
  // (Evita erro caso este JS seja incluído em outra página por engano)
  const rootForm = document.getElementById('formulario-de-disciplinas');
  const rootList = document.getElementById('lista-de-disciplinas');
  if (!rootForm || !rootList) return;

  const replit = 'https://a4f895a6-a0fd-462c-853c-0543f2aa0f9b-00-2lipl175tt1oo.janeway.replit.dev/'; // substitua pela sua URL do Replit
  const urlDisciplinas = replit + 'disciplinas';
  const urlFaculdades = replit + 'Faculdade';

  const formularioDeDisciplinas = rootForm;
  const campoIdDaDisciplinas = document.getElementById('disciplinas-id');
  const botaoEnviar = document.getElementById('botao-enviar');
  const listaDeDisciplinas = rootList;
  const selectFaculdade = document.getElementById('faculdade');

  let disciplinas = [];
  let mapFaculdades = {}; // Map id -> nome da faculdade

  // Carregar faculdades e preencher o <select>
  const carregarFaculdades = async () => {
    try {
      // ALTERAÇÃO: buscava em urlDisciplinas; deve buscar em urlFaculdades
      const res = await fetch(urlFaculdades, { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao carregar faculdades');
      const json = await res.json();

      // ALTERAÇÃO: trata formatos diferentes (array direto ou propriedade)
      const faculdades = Array.isArray(json)
        ? json
        : (json.faculdades || json.data || []);

      selectFaculdade.innerHTML = '<option value="">-- Selecione uma Faculdade --</option>';
      mapFaculdades = {};

      faculdades.forEach((f) => {
        const id = f?.id;
        const nome = f?.nome || f?.name || 'Sem nome';
        if (id == null) return;

        mapFaculdades[String(id)] = nome;

        const opt = document.createElement('option');
        opt.value = String(id);
        opt.textContent = nome;
        selectFaculdade.appendChild(opt);
      });
    } catch (err) {
      console.error('Erro ao carregar faculdades:', err);
      selectFaculdade.innerHTML = '<option value="">Erro ao carregar faculdades</option>';
    }
  };

  // Buscar disciplinas
  const buscarDisciplinas = async () => {
    try {
      const res = await fetch(urlDisciplinas, { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao buscar disciplinas');
      const json = await res.json();

      // Mantém compatibilidade com diferentes formatos
      disciplinas = Array.isArray(json) ? json : (json.disciplinas || json.data || []);
      apresentarTabela();
    } catch (error) {
      console.error(error);
      listaDeDisciplinas.innerHTML = `<h2 class="warning">Erro ao buscar disciplinas</h2>`;
    }
  };

  // Apresentar disciplinas na tela
  const apresentarTabela = () => {
    listaDeDisciplinas.innerHTML = '';

    if (!Array.isArray(disciplinas) || disciplinas.length === 0) {
      listaDeDisciplinas.innerHTML = '<h5 class="text-muted">Nenhuma disciplina cadastrada.</h5>';
      return;
    }

    disciplinas.forEach((disciplina) => {
      const nomeFaculdade = mapFaculdades[String(disciplina.faculdade_id)] || 'Faculdade desconhecida';

      const cartao = document.createElement('div');
      cartao.className = 'card';
      cartao.style.width = '18rem';

      cartao.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">Disciplina:</h5>
          <p>${disciplina.name || 'Sem nome'}</p>

          <h6 class="card-subtitle mb-2 text-muted">Descrição:</h6>
          <p>${disciplina.descricao || 'Sem descrição'}</p>

          <h6 class="card-subtitle mb-2 text-muted">Professor:</h6>
          <p>${disciplina.professor || 'Sem professor'}</p>

          <h6 class="card-subtitle mb-2 text-muted">Faculdade:</h6>
          <p>${nomeFaculdade}</p>

          <div class="mt-2" style="display:flex;gap:.5rem;flex-wrap:wrap">
            <button class="botao-editar btnE btn-sm" data-id="${disciplina.id}">✏️ Editar</button>
            <button class="botao-excluir btnX btn-sm" data-id="${disciplina.id}">🗑️ Excluir</button>
          </div>
        </div>
      `;

      listaDeDisciplinas.appendChild(cartao);
    });
  };

  // Enviar disciplina (POST)
  const enviarDisciplinas = async (disc) => {
    try {
      const res = await fetch(urlDisciplinas, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(disc),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      alert('Erro ao enviar disciplina!');
      console.error(err);
    }
  };

  // Atualizar disciplina (PUT)
  const atualizarDisciplinas = async (id, disc) => {
    try {
      const res = await fetch(`${urlDisciplinas}/${id}`, {
        method: 'PUT', // poderia ser PATCH, mantendo PUT para compatibilidade com o colega
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(disc),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      alert('Erro ao atualizar disciplina!');
      console.error(err);
    }
  };

  // Excluir disciplina (DELETE)
  const excluirDisciplinas = async (id) => {
    try {
      const res = await fetch(`${urlDisciplinas}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      alert('Erro ao excluir disciplina!');
      console.error(err);
    }
  };

  // Limpar formulário
  const limparFormulario = () => {
    formularioDeDisciplinas.reset();
    campoIdDaDisciplinas.value = '';
    botaoEnviar.textContent = 'Adicionar Disciplina';
  };

  // Submit do formulário
  formularioDeDisciplinas.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = campoIdDaDisciplinas.value;
    const name = document.getElementById('nome').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const professor = document.getElementById('professor').value.trim();
    const faculdade_id = selectFaculdade.value;

    if (!faculdade_id) {
      alert('Por favor, selecione uma faculdade.');
      return;
    }

    const disc = { name, descricao, professor, faculdade_id: Number(faculdade_id) };

    if (id) {
      await atualizarDisciplinas(id, disc);
    } else {
      await enviarDisciplinas(disc);
    }

    await buscarDisciplinas();
    limparFormulario();
  });

  // Botões editar/excluir
  listaDeDisciplinas.addEventListener('click', async (event) => {
    const alvo = event.target;
    const id = alvo.dataset.id;
    if (!id) return;

    if (alvo.classList.contains('botao-editar')) {
      const encontrada = disciplinas.find((p) => String(p.id) === String(id));
      if (encontrada) {
        campoIdDaDisciplinas.value = encontrada.id;
        document.getElementById('nome').value = encontrada.name || '';
        document.getElementById('descricao').value = encontrada.descricao || '';
        document.getElementById('professor').value = encontrada.professor || '';
        selectFaculdade.value = encontrada.faculdade_id || '';
        botaoEnviar.textContent = 'Atualizar Disciplina';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (alvo.classList.contains('botao-excluir')) {
      if (confirm('Tem certeza que deseja excluir esta disciplina?')) {
        await excluirDisciplinas(id);
        await buscarDisciplinas();
      }
    }
  });

  // Inicialização
  carregarFaculdades();
  buscarDisciplinas();

  // ===== Scroll horizontal (lista de cartões) =====
  const area = document.getElementById('lista-de-disciplinas');
  const btnEsq = document.getElementById('btn-esquerda');
  const btnDir = document.getElementById('btn-direita');

  if (area && btnEsq && btnDir) {
    const scrollStep = 320; // 1 card (300px) + gap (20px)

    btnEsq.addEventListener('click', () => {
      area.scrollBy({ left: -scrollStep, behavior: 'smooth' });
    });

    btnDir.addEventListener('click', () => {
      area.scrollBy({ left: scrollStep, behavior: 'smooth' });
    });

    function atualizarBotoes() {
      btnEsq.style.display = area.scrollLeft > 0 ? 'flex' : 'none';
      btnDir.style.display =
        area.scrollLeft + area.clientWidth < area.scrollWidth ? 'flex' : 'none';
    }

    area.addEventListener('scroll', atualizarBotoes);
    window.addEventListener('resize', atualizarBotoes);
    atualizarBotoes();
  }
});
