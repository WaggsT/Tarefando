// Cadernos page logic (separated from HTML)
// Loads data, renders cards, search, create/edit/delete with localStorage persistence

(() => {
  'use strict';

  // Config
  const JSON_PATH = '/codigo/db/cadernos.json';
  const DISCIPLINAS = {};
  let allCadernos = [];

  // Utils
  const $ = (sel) => document.querySelector(sel);
  const esc = (s = '') => String(s).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));

  function getMaterialIdSlug(cadernoName) {
    const name = String(cadernoName || '').toLowerCase();
    if (name.includes('algoritmos i')) return 'algoritmos1';
    if (name.includes('cálculo ii') || name.includes('cflculo ii')) return 'calculo2';
    if (name.includes('história moderna') || name.includes('histdria moderna')) return 'historia';
    if (name.includes('química') || name.includes('qufmica')) return 'quimica';
    return 'algoritmos1';
  }

  function getDisciplinaName(id) {
    return DISCIPLINAS[id] || `Disciplina #${id}`;
  }

  async function getAllData() {
    const r = await fetch(JSON_PATH);
    if (!r.ok) throw new Error('Falha ao carregar dados');
    return r.json();
  }

  function cadernoCardHTML(c) {
    const disciplina = getDisciplinaName(c.disciplina_id);
    const tags = [disciplina, `Usuário #${c.usuario_id}`];
    const materialSlug = getMaterialIdSlug(c.name);

    return `
      <article class="card card-caderno" id="card-${c.id}">
        <div class="group-body">
          <div class="card-header-actions">
            <h3>${esc(c.name)}</h3>
            <button class="btn-excluir" data-id="${c.id}" onclick="excluirCaderno(${c.id})">Excluir</button>
          </div>
          <p class="group-desc">${esc(c.descricao || '')}</p>
          <div class="caderno-tags group-tags">
            ${tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}
          </div>
          <div class="group-actions">
            <a class="btn cta" href="/codigo/public/material.html?id=${materialSlug}">Ver Material</a>
            <button class="btn btn--ghost" onclick="abrirModalParaEditar(${c.id})">Editar</button>
          </div>
        </div>
      </article>`;
  }

  function renderCadernos(list) {
    const grid = $('#cadernosGrid');
    if (!grid) return;
    if (!list || list.length === 0) {
      grid.innerHTML = `<p class="section-desc">Nenhum caderno encontrado.</p>`;
      return;
    }
    grid.innerHTML = list.map(cadernoCardHTML).join('');
  }

  // Exposed actions for inline handlers
  window.excluirCaderno = function (id) {
    if (!confirm('Tem certeza que deseja excluir este caderno?')) return;

    const initialLength = allCadernos.length;
    allCadernos = allCadernos.filter((c) => c.id !== id);
    if (allCadernos.length === initialLength) return;

    const userCadernos = JSON.parse(localStorage.getItem('meus_cadernos') || '[]');
    const newUser = userCadernos.filter((c) => c.id !== id);
    localStorage.setItem('meus_cadernos', JSON.stringify(newUser));

    renderCadernos(allCadernos);
    alert('Caderno removido.');
  };

  window.abrirModalParaEditar = function (id) {
    const modal = document.getElementById('novoCadernoModal');
    const modalTitle = document.getElementById('modalTitle');
    const editId = document.getElementById('editCadernoId');
    const nomeEl = document.getElementById('nomeCaderno');
    const descEl = document.getElementById('descricao');
    const discEl = document.getElementById('disciplina');

    const caderno = allCadernos.find((c) => c.id == id);
    if (!caderno) return;

    if (modalTitle) modalTitle.textContent = 'Editar Caderno';
    if (editId) editId.value = String(id);
    if (nomeEl) nomeEl.value = caderno.name || '';
    if (descEl) descEl.value = caderno.descricao || '';
    if (discEl) discEl.value = (caderno.disciplina_id != null ? String(caderno.disciplina_id) : '');

    if (modal) modal.style.display = 'block';
  };

  function bindModal() {
    const modal = document.getElementById('novoCadernoModal');
    const btnAbrir = document.getElementById('btnAbrirModal');
    const btnFechar = document.getElementById('fecharModal');
    const btnCancelar = document.getElementById('btnCancelar');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('formNovoCaderno');
    const editId = document.getElementById('editCadernoId');

    function abrirModal() {
      if (modalTitle) modalTitle.textContent = 'Cadastrar Novo Caderno';
      if (editId) editId.value = '';
      if (form) form.reset();
      if (modal) modal.style.display = 'block';
    }
    function fecharModal() {
      if (modal) modal.style.display = 'none';
      if (modalTitle) modalTitle.textContent = 'Cadastrar Novo Caderno';
      if (editId) editId.value = '';
      if (form) form.reset();
    }

    if (btnAbrir) btnAbrir.addEventListener('click', abrirModal);
    if (btnFechar) btnFechar.addEventListener('click', fecharModal);
    if (btnCancelar) btnCancelar.addEventListener('click', fecharModal);
    window.addEventListener('click', (e) => { if (e.target === modal) fecharModal(); });

    if (form) form.addEventListener('submit', (e) => {
      e.preventDefault();
      const idParaEditar = editId ? editId.value : '';
      const nomeEl = document.getElementById('nomeCaderno');
      const disciplinaEl = document.getElementById('disciplina');
      const descEl = document.getElementById('descricao');
      const arquivoEl = document.getElementById('uploadFile');

      const nomeCaderno = nomeEl ? String(nomeEl.value || '').trim() : '';
      const disciplinaId = disciplinaEl ? String(disciplinaEl.value || '') : '';
      const descricao = descEl ? String(descEl.value || '').trim() : '';

      if (!nomeCaderno) { alert('Por favor, digite um nome para o caderno.'); nomeEl && nomeEl.focus(); return; }
      if (!disciplinaId) { alert('Por favor, selecione uma disciplina.'); disciplinaEl && disciplinaEl.focus(); return; }

      if (idParaEditar) {
        const idx = allCadernos.findIndex((c) => c.id == idParaEditar);
        if (idx === -1) { alert('Erro ao salvar: ID do caderno não encontrado.'); return; }

        const atualizado = {
          ...allCadernos[idx],
          name: nomeCaderno,
          descricao: descricao,
          disciplina_id: parseInt(disciplinaId, 10)
        };
        allCadernos[idx] = atualizado;

        const user = JSON.parse(localStorage.getItem('meus_cadernos') || '[]');
        const uidx = user.findIndex((c) => c.id == idParaEditar);
        if (uidx !== -1) {
          user[uidx] = atualizado;
          localStorage.setItem('meus_cadernos', JSON.stringify(user));
        }
        alert('Caderno atualizado com sucesso!');
      } else {
        const arquivoNome = (arquivoEl && arquivoEl.files && arquivoEl.files.length > 0) ? arquivoEl.files[0].name : 'Nenhum arquivo subido';
        const newId = Date.now();
        const novo = {
          id: newId,
          name: nomeCaderno,
          descricao: descricao,
          disciplina_id: parseInt(disciplinaId, 10),
          usuario_id: Math.floor(Math.random() * 100) + 20,
          arquivo: arquivoNome
        };
        allCadernos.unshift(novo);
        const user = JSON.parse(localStorage.getItem('meus_cadernos') || '[]');
        user.unshift(novo);
        localStorage.setItem('meus_cadernos', JSON.stringify(user));
        alert(`Caderno "${nomeCaderno}" cadastrado com sucesso!`);
      }

      renderCadernos(allCadernos);
      fecharModal();
    });
  }

  function bindSearch() {
    const q = $('#q');
    if (!q) return;
    q.addEventListener('input', () => {
      const term = String(q.value || '').toLowerCase();
      const filtered = allCadernos.filter((c) => (
        (c.name || '').toLowerCase().includes(term) ||
        (c.descricao || '').toLowerCase().includes(term) ||
        (getDisciplinaName(c.disciplina_id) || '').toLowerCase().includes(term)
      ));
      renderCadernos(filtered);
    });
  }

  function populateDisciplinasSelect(list) {
    const sel = document.getElementById('disciplina');
    if (!sel || !Array.isArray(list)) return;
    sel.innerHTML = '<option value="">Selecione a Disciplina</option>' +
      list.map((d) => `<option value="${d.id}">${esc(d.name)}</option>`).join('');
  }

  // Init
  document.addEventListener('DOMContentLoaded', async () => {
    bindModal();
    bindSearch();
    try {
      const data = await getAllData();
      if (Array.isArray(data.Disciplina)) {
        data.Disciplina.forEach((d) => { DISCIPLINAS[d.id] = d.name; });
        populateDisciplinasSelect(data.Disciplina);
      }
      const userCadernos = JSON.parse(localStorage.getItem('meus_cadernos') || '[]');
      const base = Array.isArray(data.Caderno) ? data.Caderno : [];
      allCadernos = [...userCadernos, ...base];
      renderCadernos(allCadernos);
    } catch (e) {
      const grid = $('#cadernosGrid');
      if (grid) grid.innerHTML = `<p class="section-desc">Erro ao carregar dados. Verifique o arquivo ${JSON_PATH}.</p>`;
      console.error('Falha ao carregar dados:', e);
    }
  });
})();

