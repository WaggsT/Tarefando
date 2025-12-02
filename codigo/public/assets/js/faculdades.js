// Faculdades â€” pÃ¡gina
// Carrega do localStorage (se existir) ou de /codigo/db/faculdades.json

document.addEventListener('DOMContentLoaded', () => {
  // ====== CONFIG ======
  const LOCAL_JSON = "/codigo/db/faculdades.json"; // <- bate com sua Ã¡rvore
  const STORAGE_ALL  = "tarefando_all_faculdades";
  const STORAGE_MY   = "tarefando_my_faculty_id";
  const STORAGE_OWN  = "tarefando_user_faculty_ids";

  // ====== ESTADO ======
  let allFaculdades = [];
  let myFacultyID   = localStorage.getItem(STORAGE_MY);
  let userCreatedIDs = new Set(JSON.parse(localStorage.getItem(STORAGE_OWN) || "[]"));

  // ====== HELPERS ======
  const $ = s => document.querySelector(s);
  const esc = (s="") => String(s).replace(/[&<>\"']/g, m=>({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[m]));

  function saveAllData(){
    localStorage.setItem(STORAGE_ALL, JSON.stringify(allFaculdades));
    localStorage.setItem(STORAGE_OWN, JSON.stringify([...userCreatedIDs]));
  }
  function saveMyFaculty(id){
    if(!id) return;
    localStorage.setItem(STORAGE_MY, String(id));
    myFacultyID = String(id);
    renderAll();
  }
  function clearMyFaculty(){
    localStorage.removeItem(STORAGE_MY);
    myFacultyID = null;
    renderAll();
  }

  // ====== LOAD ======
  async function loadInitialData(){
    const stored = localStorage.getItem(STORAGE_ALL);
    if (stored) {
      allFaculdades = JSON.parse(stored);
      return;
    }
    // busca do JSON local (absoluto)
    const r = await fetch(LOCAL_JSON, { cache: "no-store" });
    if (!r.ok) throw new Error("NÃ£o foi possÃ­vel ler " + LOCAL_JSON);
    allFaculdades = await r.json();
    saveAllData();
  }

  // ====== RENDER ======
  function carouselCardHTML(f){
    const isSelected = String(f.id) === myFacultyID;
    const canEdit = userCreatedIDs.has(String(f.id));
    const canDelete = canEdit;

    return `
      <article class="card group">
        <div class="card-media" style="background-image:url('${esc(f.capa || `https://picsum.photos/640/360?seed=${f.id}`)}')"></div>
        <div class="group-body">
          <h3>${esc(f.name)}</h3>
          <p class="group-desc" style="font-size:.9rem">${esc(f.endereco || "EndereÃ§o nÃ£o informado")}</p>
          <div class="group-actions" style="display:flex;gap:.5rem;align-items:center;margin-top:auto;min-height:40px">
            ${isSelected ? `<button class="btn" disabled>âœ“ Selecionada</button>`
                          : `<button class="cta" data-select-id="${esc(f.id)}">Selecionar</button>`}
            ${canEdit ? `<button class="btn btn--ghost btn--action btn--edit" data-edit-id="${esc(f.id)}">Editar</button>` : ""}
            ${canDelete ? `<button class="btn btn--ghost btn--action btn--delete" data-delete-id="${esc(f.id)}">Excluir</button>` : ""}
          </div>
        </div>
      </article>`;
  }

  function myFacultyCardHTML(f){
    const canEdit = userCreatedIDs.has(String(f.id));
    const canDelete = canEdit;
    return `
      <article class="card" style="display:flex;gap:1rem;align-items:center">
        <div style="flex:0 0 auto">
          <img src="${esc(f.capa || `https://picsum.photos/100/100?seed=${f.id}`)}" alt="Logo/foto da ${esc(f.name)}"
               width="80" height="80" style="border-radius:12px;border:1px solid var(--line);object-fit:cover">
        </div>
        <div style="flex:1">
          <h3 style="margin:0 0 .25rem">${esc(f.name)}</h3>
          <p class="section-desc" style="margin:0;font-size:.95rem">${esc(f.endereco || "EndereÃ§o nÃ£o informado")}</p>
          <div class="group-meta" style="margin-top:.5rem;font-size:.9rem;gap:1rem">
            <span>${Number(f.cursos||0)} cursos</span>
            <span>${Number(f.alunos||0)} alunos</span>
          </div>
        </div>
        <div class="group-actions" style="margin-left:auto;display:flex;flex-direction:column;gap:.5rem;align-self:flex-end">
          <button class="btn btn--ghost" data-remove-id="${esc(f.id)}">Remover Faculdade</button>
          ${canEdit ? `<button class="btn btn--ghost btn--action btn--edit" data-edit-id="${esc(f.id)}">Editar</button>` : ""}
          ${canDelete ? `<button class="btn btn--ghost btn--action btn--delete" data-delete-id="${esc(f.id)}">Excluir Faculdade</button>` : ""}
        </div>
      </article>`;
  }

  function renderCarousel(){
    $("#carouselGrid").innerHTML = allFaculdades.map(carouselCardHTML).join("");
  }
  function renderMyFaculty(){
    const box = $("#myFacultyBox");
    if (!myFacultyID) {
      box.innerHTML = `<p class="section-desc">VocÃª ainda nÃ£o selecionou sua faculdade. Clique em "Selecionar" em um dos cards acima.</p>`;
      return;
    }
    const f = allFaculdades.find(x => String(x.id) === String(myFacultyID));
    box.innerHTML = f ? myFacultyCardHTML(f)
                      : `<p class="section-desc" style="color:orange">A faculdade selecionada nÃ£o foi encontrada.</p>`;
  }
  function renderAll(){
    renderCarousel();
    renderMyFaculty();
  }

  // ====== CRUD local (localStorage) ======
  function handleCreate(data){
    const newFac = {
      id: "facul-" + Date.now() + Math.random().toString(36).slice(2,5),
      name: data.name, campus: data.campus, endereco: data.endereco, capa: data.capa,
      cursos: 0, alunos: 1
    };
    allFaculdades.unshift(newFac);
    userCreatedIDs.add(String(newFac.id));
    saveAllData();
    saveMyFaculty(newFac.id);
    return newFac;
  }
  function handleUpdate(id, data){
    const i = allFaculdades.findIndex(f => String(f.id) === String(id));
    if (i === -1) return false;
    allFaculdades[i] = { ...allFaculdades[i], ...data };
    saveAllData();
    renderAll();
    return true;
  }
  function handleDelete(id){
    if (!userCreatedIDs.has(String(id))) {
      alert("VocÃª sÃ³ pode excluir faculdades que cadastrou.");
      return;
    }
    const name = allFaculdades.find(f => String(f.id)===String(id))?.name || "esta faculdade";
    if (!confirm(`Excluir "${name}"?`)) return;

    allFaculdades = allFaculdades.filter(f => String(f.id)!==String(id));
    userCreatedIDs.delete(String(id));
    if (String(myFacultyID) === String(id)) {
      clearMyFaculty(); // jÃ¡ renderiza/salva
    } else {
      saveAllData();
      renderAll();
    }
  }

  // ====== FORM ======
  const formCard   = $("#formCard");
  const ctaCard    = $("#cta-card");
  const form       = $("#facultyForm");
  const formTitle  = $("#formTitle");
  const submitBtn  = $("#submitFormBtn");
  const statusMsg  = $("#formStatus");
  const idInput    = $("#facul_id");

  function openCreateForm(){
    form.reset(); idInput.value = "";
    formTitle.textContent = "Cadastrar nova faculdade";
    submitBtn.textContent = "Cadastrar e Selecionar";
    statusMsg.textContent = "";
    formCard.style.display = "block";
    ctaCard.style.display  = "none";
    $("#facul_nome").focus();
  }
  function openEditForm(id){
    const fac = allFaculdades.find(f => String(f.id)===String(id));
    if (!fac || !userCreatedIDs.has(String(id))) {
      alert("VocÃª sÃ³ pode editar faculdades que cadastrou.");
      return;
    }
    idInput.value = fac.id;
    $("#facul_nome").value = fac.name || "";
    $("#facul_campus").value = fac.campus || "";
    $("#facul_endereco").value = fac.endereco || "";
    $("#facul_capa").value = fac.capa || "";

    formTitle.textContent = "Editar Faculdade";
    submitBtn.textContent = "Salvar AlteraÃ§Ãµes";
    statusMsg.textContent = "";
    formCard.style.display = "block";
    ctaCard.style.display  = "none";
    $("#facul_nome").focus();
  }
  function closeForm(){
    formCard.style.display = "none";
    ctaCard.style.display  = "flex";
    statusMsg.textContent = "";
    form.reset();
    idInput.value = "";
  }

  // ====== EVENTOS ======
  $("#openCreate").addEventListener("click", openCreateForm);
  $("#closeForm").addEventListener("click", closeForm);
  $("#cancelForm").addEventListener("click", closeForm);

  $("#carouselGrid").addEventListener("click", (e)=>{
    const s = e.target.closest("[data-select-id]");
    const ed= e.target.closest("[data-edit-id]");
    const del= e.target.closest("[data-delete-id]");
    if (s)   saveMyFaculty(s.dataset.selectId);
    if (ed)  openEditForm(ed.dataset.editId);
    if (del) handleDelete(del.dataset.deleteId);
  });

  $("#myFacultyBox").addEventListener("click", (e)=>{
    const rem= e.target.closest("[data-remove-id]");
    const ed = e.target.closest("[data-edit-id]");
    const del= e.target.closest("[data-delete-id]");
    if (rem) clearMyFaculty();
    if (ed)  openEditForm(ed.dataset.editId);
    if (del) handleDelete(del.dataset.deleteId);
  });

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const data = {
      name: $("#facul_nome").value,
      campus: $("#facul_campus").value,
      endereco: $("#facul_endereco").value,
      capa: $("#facul_capa").value
    };
    const id = idInput.value;
    let ok=false, msg="";
    if (id) { ok = handleUpdate(id, data); msg = ok ? "Faculdade atualizada!" : "Erro ao atualizar."; }
    else    { ok = !!handleCreate(data);   msg = ok ? "Faculdade cadastrada e selecionada!" : "Erro ao cadastrar."; }
    statusMsg.textContent = msg;
    statusMsg.style.color = ok ? "green" : "red";
    if (ok) setTimeout(()=>{ closeForm(); renderAll(); }, 900);
  });

  // setas do carrossel
  (function bindCarouselButtons(){
    const carousel = $("#carouselGrid");
    const leftBtn  = $("#scrollLeftBtn");
    const rightBtn = $("#scrollRightBtn");
    if (!carousel || !leftBtn || !rightBtn) return;

    const step = 320 + 20; // card + gap
    leftBtn.addEventListener("click", ()=>{
      const tol = 10;
      if (carousel.scrollLeft < tol) carousel.scrollTo({ left: carousel.scrollWidth, behavior:'smooth' });
      else carousel.scrollBy({ left: -step, behavior:'smooth' });
    });
    rightBtn.addEventListener("click", ()=>{
      const tol = 10;
      const max = carousel.scrollWidth - carousel.clientWidth;
      if (carousel.scrollLeft > max - tol) carousel.scrollTo({ left: 0, behavior:'smooth' });
      else carousel.scrollBy({ left: step, behavior:'smooth' });
    });
  })();

  // ====== INIT ======
  (async function init(){
    try {
      await loadInitialData();
      renderAll();
    } catch (e){
      console.error(e);
      $("#carouselGrid").innerHTML = `<p class="section-desc" style="color:red"><b>Erro:</b> nÃ£o deu pra carregar as faculdades.</p>`;
    }
  })();
});

