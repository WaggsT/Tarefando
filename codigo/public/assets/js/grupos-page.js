// -------------------------------------------------------------------
// Grupos – lista/criar/editar/excluir
// Fonte de dados: tenta API (http://localhost:3000/grupos) e cai para localStorage
// -------------------------------------------------------------------

/* ============================================================
   Config / Estado
   ============================================================ */
const PER_PAGE = 8;
const LS_GROUPS = 'grupos_db_v1';   // Array de grupos [{id, titulo, ...}]
const LS_MY     = 'meus_grupos_v1'; // Array de ids que participo
const LS_OWNERS = 'grupos_autoria_v1'; // Array de ids criados por mim

let all = [];
let page = 1;
let q = '';
const me = new Set(JSON.parse(localStorage.getItem(LS_MY) || '[]'));
const createdByMe = new Set(JSON.parse(localStorage.getItem(LS_OWNERS) || '[]'));

/* Helpers */
const $  = s => document.querySelector(s);
const esc = (s='') => String(s).replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\'':'&#39;'}[m]));
const toTags = s => String(s||'').split(',').map(t=>t.trim()).filter(Boolean);
const cover = g => esc(g.capa || `https://picsum.photos/640/360?seed=${g.id}`);
function saveMe(){ localStorage.setItem(LS_MY, JSON.stringify([...me])); }
function saveOwners(){ localStorage.setItem(LS_OWNERS, JSON.stringify([...createdByMe])); }
function isOwner(id){ return createdByMe.has(String(id)); }

// Dados: delega para GruposData (API + fallback local)
async function getAll(){ return await window.GruposData.getAll(); }

/* ============================================================
   Templates de cards
   ============================================================ */
function myCardHTML(g){
  return `
    <article class="card group">
      <div class="card-media" style="background-image:url('${cover(g)}')"></div>
      <div class="group-body">
        <h3>${esc(g.titulo||'')}</h3>
        <p class="group-desc">${esc(g.descricao||'')}</p>
        <div class="group-meta" style="display:flex;flex-direction:column;gap:.25rem">
          <span>${Number(g.membros||0)} membros</span>
          <span>${Number(g.posts_semana||0)} posts/semana</span>
        </div>
        <div class="group-tags">${(g.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
        <div class="group-actions">
          <a class="btn" href="grupo.html?id=${encodeURIComponent(g.id)}">Ver grupo</a>
          <button class="btn btn--ghost" data-leave="${esc(g.id)}">Sair</button>
          ${ isOwner(g.id) ? `<button class="btn btn--ghost" data-edit="${esc(g.id)}">Editar</button>
                               <button class="btn btn--ghost" data-delete="${esc(g.id)}">Excluir</button>` : '' }
        </div>
      </div>
    </article>`;
}

function pubCardHTML(g){
  const joined = me.has(String(g.id));
  return `
    <article class="card group">
      <div class="card-media" style="background-image:url('${cover(g)}')"></div>
      <div class="group-body">
        <h3>${esc(g.titulo||'')}</h3>
        <p class="group-desc">${esc(g.descricao||'')}</p>
        <div class="group-meta" style="display:flex;flex-direction:column;gap:.25rem">
          <span>${Number(g.membros||0)} membros</span>
          <span>${Number(g.posts_semana||0)} posts/semana</span>
        </div>
        <div class="group-tags">${(g.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
        <div class="group-actions">
          <a class="btn" href="grupo.html?id=${encodeURIComponent(g.id)}">Ver grupo</a>
          ${ joined ? `<button class="btn" disabled data-joined>Participando</button>`
                    : `<button class="cta" data-join="${esc(g.id)}">Participar</button>` }
        </div>
      </div>
    </article>`;
}

/* ============================================================
   Render
   ============================================================ */
function renderMy(){
  const mine = all.filter(g => me.has(String(g.id)));
  const grid = $('#myGrid'); if(grid) grid.innerHTML = mine.map(myCardHTML).join('');
  const empty = $('#myEmpty'); if(empty) empty.style.display = mine.length ? 'none' : 'block';
}

function renderPublic(){
  const filtered = q
    ? all.filter(g =>
        (g.titulo||'').toLowerCase().includes(q) ||
        (g.descricao||'').toLowerCase().includes(q) ||
        (g.tags||[]).some(t => (t||'').toLowerCase().includes(q)))
    : all;

  const total = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  if(page > total) page = total;
  const slice = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const grid = $('#groupsGrid');
  if(grid) grid.innerHTML = slice.map(pubCardHTML).join('') || `<p class="section-desc">Nenhum grupo encontrado.</p>`;

  const mk = (label, p, active=false, dis=false) =>
    `<a class="btn"
       ${dis ? 'aria-disabled="true" tabindex="-1"' : `href="#p${p}" data-p="${p}"`}
       ${active ? 'aria-current="page" style="font-weight:800;border-color:transparent;background:linear-gradient(135deg,var(--brand-2),var(--brand));color:#fff"' : ''}>
       ${label}</a>`;
  let html = mk('‹ Anterior', page-1, false, page===1);
  for(let i=1;i<=total;i++) html += mk(String(i), i, i===page);
  html += mk('Próxima ›', page+1, false, page===total);
  const pag = $('#pagination'); if(pag) pag.innerHTML = html;
}

/* ============================================================
   Drawer + Formulário (criar/editar)
   ============================================================ */
(function(){
  const dr         = $('#drawer');
  const openCreate = $('#openCreate');
  const closeBtn   = $('#closeDrawer');
  const cancelBtn  = $('#cancelDrawer');
  const form       = $('#createFormMobile');

  if(!dr || !openCreate) return;

  const open  = ()=>{ dr.classList.add('is-open');  dr.setAttribute('aria-hidden','false'); };
  const close = ()=>{ dr.classList.remove('is-open'); dr.setAttribute('aria-hidden','true');  form?.reset(); if(form?.dataset) delete form.dataset.editingId; };

  openCreate.addEventListener('click', open);
  closeBtn  && closeBtn.addEventListener('click', close);
  cancelBtn && cancelBtn.addEventListener('click', close);
  dr.addEventListener('click', (e)=>{ if(e.target===dr) close(); });

  form && form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const payload = {
      titulo:     $('#mtitulo').value.trim(),
      faculdade:  $('#mfaculdade').value.trim(),
      curso:      $('#mcurso').value.trim(),
      descricao:  $('#mdescricao').value.trim(),
      tags:       toTags($('#mtags').value),
      capa:       $('#mcapa').value.trim(),
      membros: 1, posts_semana: 0
    };
    try{
      if(form.dataset.editingId){
        await window.GruposData.updateGroup(form.dataset.editingId, payload);
        all = await getAll();
        const st = document.querySelector('#createStatusMobile');
        if(st) st.textContent = 'Grupo atualizado!';
      }else{
        const g = await window.GruposData.createGroup(payload);
        // marca autor/participação localmente
        createdByMe.add(String(g.id)); saveOwners();
        me.add(String(g.id)); saveMe();
        all = await getAll();
        const st = document.querySelector('#createStatusMobile');
        if(st) st.textContent = 'Grupo criado!';
      }
      renderMy(); renderPublic();
      close();
    }catch(err){
      const st = document.querySelector('#createStatusMobile');
      if(st) st.textContent = 'Erro: ' + err.message;
      console.error(err);
    }
  });
})();

/* ============================================================
   Busca e paginação + ações dos cards
   ============================================================ */
document.addEventListener('input', (e)=>{
  if(e.target && e.target.id === 'q'){
    q = (e.target.value||'').toLowerCase(); page = 1; renderPublic();
  }
});

document.addEventListener('click', async (e)=>{
  const joinBtn  = e.target.closest('[data-join]');
  const leaveBtn = e.target.closest('[data-leave]');
  const editBtn  = e.target.closest('[data-edit]');
  const delBtn   = e.target.closest('[data-delete]');
  const pag      = e.target.closest('[data-p]');

  if (joinBtn){
    const id = String(joinBtn.dataset.join); me.add(id); saveMe(); renderMy(); renderPublic(); e.preventDefault(); return;
  }
  if (leaveBtn){
    const id = String(leaveBtn.dataset.leave); me.delete(id); saveMe(); renderMy(); renderPublic(); e.preventDefault(); return;
  }
  if (editBtn){
    const id = String(editBtn.dataset.edit);
    if (!isOwner(id)) { alert('Apenas quem criou pode editar.'); return; }
    const g = all.find(x => String(x.id)===id); if(!g) return;
    const dr = $('#drawer'); const fm = $('#createFormMobile'); if(!dr||!fm) return;
    $('#drawerTitle').textContent = 'Editar grupo';
    $('#mtitulo').value = g.titulo||'';
    $('#mfaculdade').value = g.faculdade||'';
    $('#mcurso').value = g.curso||'';
    $('#mdescricao').value = g.descricao||'';
    $('#mtags').value = (g.tags||[]).join(', ');
    $('#mcapa').value = g.capa||'';
    fm.dataset.editingId = id; dr.classList.add('is-open'); dr.setAttribute('aria-hidden','false');
    e.preventDefault(); return;
  }
  if (delBtn){
    const id = String(delBtn.dataset.delete);
    if (!isOwner(id)) { alert('Apenas quem criou pode excluir.'); return; }
    if (!confirm('Excluir este grupo?')) return;
    await window.GruposData.deleteGroup(id);
    // atualiza autor/participação localmente
    me.delete(id); saveMe();
    createdByMe.delete(id); saveOwners();
    all = await getAll();
    renderMy(); renderPublic(); e.preventDefault(); return;
  }
  if (pag){ const p = Number(pag.dataset.p); if(!isNaN(p)){ page = p; renderPublic(); e.preventDefault(); return; } }
});

/* ============================================================
   Init
   ============================================================ */
(async function init(){
  all = await getAll();
  renderMy();
  renderPublic();
})();

// API util para debug no console
window.GruposAPI = { getAll, createGroup, updateGroup, deleteGroup };



