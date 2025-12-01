// public/assets/js/layout.js

(function(){
  // 1) Descobrindo o prefixo relativo (./ ou ../) a partir do caminho atual
  const path = location.pathname;
  const needsUpOne = /\/(Grupo-Wagner|Disciplinas-Divan)\//.test(path);
  const base = needsUpOne ? "../" : "./";

  // 2) Corrigir HREFs do menu e da marca
  const setHref = (id, target) => {
    const el = document.getElementById(id);
    if (el) el.href = base + target;
  };

  setHref("brandLink", "index.html#home");
  setHref("navHome", "index.html#home");
  setHref("navFaculdades", "faculdades.html");
  setHref("navCadernos", "cadernos.html");
  setHref("navDisciplinas", needsUpOne ? "Disciplinas-Divan/disciplinas.html" : "Disciplinas-Divan/disciplinas.html");
  setHref("navGrupos", needsUpOne ? "Grupo-Wagner/grupos.html" : "Grupo-Wagner/grupos.html");
  setHref("navPlanos", "assinaturas.html");
  setHref("navFaq", "faq.html");

  // 3) Marcar item ativo do menu
  const current = path.split("/").pop().toLowerCase();
  const map = [
    { file: "index.html",      id: "navHome" },
    { file: "faculdades.html", id: "navFaculdades" },
    { file: "cadernos.html",   id: "navCadernos" },
    { file: "disciplinas.html",id: "navDisciplinas" },
    { file: "grupos.html",     id: "navGrupos" },
    { file: "assinaturas.html",id: "navPlanos" },
    { file: "faq.html",        id: "navFaq" }
  ];
  const active = map.find(m => current.includes(m.file));
  if (active) {
    const el = document.getElementById(active.id);
    if (el) el.setAttribute("aria-current", "page");
  }

  // 4) Popover da conta (mesmo comportamento em todas)
  const btn  = document.getElementById('accountBtn');
  const menu = document.getElementById('accountMenu');
  if (btn && menu) {
    const wrap = btn.parentElement;
    const close  = ()=>{ wrap.classList.remove('is-open'); btn.setAttribute('aria-expanded','false'); };
    const toggle = ()=>{ const o = wrap.classList.toggle('is-open'); btn.setAttribute('aria-expanded', o?'true':'false'); };
    btn.addEventListener('click', toggle);
    document.addEventListener('click', e=>{ if(!wrap.contains(e.target)) close(); });
    document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ close(); btn.focus(); }});
  }

  // 5) Ano no rodapé
  const y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();
})();
