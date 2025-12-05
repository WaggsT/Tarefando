// -------------------------------------------------------------------
// Grupo – página de DETALHE (capa, descrição, ações, relacionados)
// -------------------------------------------------------------------

/* =================== CONFIG & ESTADO =================== */
const LS_GROUPS = 'grupos_db_v1';   // mesmo da lista de grupos
const LS_MY     = 'meus_grupos_v1'; // ids dos grupos que participo

const params  = new URLSearchParams(location.search);
const groupId = params.get("id");

const me  = new Set(JSON.parse(localStorage.getItem(LS_MY) || "[]"));
const $   = s => document.querySelector(s);
const esc = (s="") => String(s).replace(/[&<>\"']/g, m => ({
  "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
}[m]));
const coverOf = g => esc(g.capa || `https://picsum.photos/1200/420?seed=${g.id}`);
function saveMe(){ localStorage.setItem(LS_MY, JSON.stringify([...me])); }
/* =================== Fonte de dados: tenta API e cai para local =================== */
async function getAll() {
 return await window.GruposData.getAll();
}

/* =================== RENDER =================== */
function renderGroup(g){
  if(!g){
    $("#title").textContent = "Grupo não encontrado";
    $("#desc").textContent  = "Verifique o link ou volte para Grupos.";
    $("#actions").innerHTML = "";
    $("#asideActions").innerHTML = "";
    return;
  }

  $("#title").textContent = g.titulo || "Sem título";
  $("#cover").style.backgroundImage = `url('${coverOf(g)}')`;
  $("#desc").textContent = g.descricao || "—";

  // meta
  $("#meta").innerHTML = `
    <span title="Membros">
      <svg viewBox="0 0 24 24" fill="none"><path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4Zm0 2c-3.3 0-8 1.7-8 5v1h16v-1c0-3.3-4.7-5-8-5Z" stroke="currentColor" stroke-width="1.6"/></svg>
      ${Number(g.membros||0)} membros
    </span>
    <span title="Posts por semana">
      <svg viewBox="0 0 24 24" fill="none"><path d="M7 3v4M17 3v4M3 9h18M5 12h14v8H5z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      ${Number(g.posts_semana||0)} posts/semana
    </span>
    ${g.faculdade ? `<span>${esc(g.faculdade)}</span>` : ''}
    ${g.curso ? `<span>${esc(g.curso)}</span>` : ''}
  `;

  // tags
  $("#tags").innerHTML = (g.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join("");

  // ações (topo + aside)
  const joined  = me.has(String(g.id));
  const joinBtn = joined ? `<button class="btn" disabled>Participando</button>`
                         : `<button class="cta" id="joinTop">Participar</button>`;
  const leaveBtn= joined ? `<button class="btn btn--ghost" id="leaveTop">Sair</button>` : "";

  $("#actions").innerHTML      = joinBtn + leaveBtn;
  $("#asideActions").innerHTML = joinBtn + leaveBtn;

  // handlers
  document.getElementById("joinTop")?.addEventListener("click", ()=>{
    me.add(String(g.id)); saveMe(); renderGroup(g);
  });
  document.getElementById("leaveTop")?.addEventListener("click", ()=>{
    if(confirm("Sair deste grupo?")){ me.delete(String(g.id)); saveMe(); renderGroup(g); }
  });

  // breadcrumb
  $("#crumb").innerHTML = `<a href="/codigo/public/modules/grupos/index.html">← Voltar para Grupos</a>` +
    (g.curso || g.faculdade ? ` · <span class="section-desc">${esc(g.curso||g.faculdade)}</span>` : "");
}

function renderRelated(all, g){
  const box = $("#related");
  if(!g){ box.innerHTML = `<p class="section-desc">—</p>`; return; }

  let rel = all.filter(x =>
    x.id !== g.id &&
    ((x.curso && g.curso && x.curso===g.curso) || (x.faculdade && g.faculdade && x.faculdade===g.faculdade))
  );

  if(rel.length < 3){
    const tset = new Set(g.tags||[]);
    rel = rel.concat(all.filter(x => x.id!==g.id && (x.tags||[]).some(t=>tset.has(t))));
  }

  rel = Array.from(new Set(rel)).slice(0,3);

  box.innerHTML = rel.map(x => `
    <a class="card" href="/codigo/public/modules/grupos/grupo.html?id=${encodeURIComponent(x.id)}" style="display:flex;gap:.75rem">
      <div style="width:96px;height:64px;border-radius:10px;background:url('${esc(x.capa||`https://picsum.photos/200/120?seed=${x.id}`)}') center/cover no-repeat;border:1px solid var(--line)"></div>
      <div>
        <strong>${esc(x.titulo)}</strong>
        <p class="section-desc" style="margin:.25rem 0 0">${Number(x.membros||0)} membros</p>
      </div>
    </a>
  `).join("") || `<p class="section-desc">Sem relacionados.</p>`;
}

/* =================== INIT =================== */
(async function init(){
  if(!groupId){ renderGroup(null); return; }
  const all = await getAll();
  const g   = all.find(x => String(x.id) === String(groupId));
  renderGroup(g);
  renderRelated(all, g);
})();

