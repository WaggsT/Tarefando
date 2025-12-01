// Layout canǜnico para compartilhar header e footer
(function () {
  const BASE = "/codigo/public/";
  const menuItems = [
    { id: "home", label: "Home", href: `${BASE}index.html#home`, match: ["index.html"] },
    { id: "faculdades", label: "Faculdades", href: `${BASE}Faculdades-Maria-Eduarda/faculdades.html`, match: ["faculdades.html", "faculdades-maria-eduarda"] },
    { id: "cadernos", label: "Cadernos", href: `${BASE}Cadernos-Isabelle/cadernos.html`, match: ["cadernos.html", "cadernos-isabelle", "material.html"] },
    { id: "disciplinas", label: "Disciplinas", href: `${BASE}Disciplinas-Divan/disciplinas.html`, match: ["disciplinas.html", "disciplinas-divan"] },
    { id: "grupos", label: "Grupos", href: `${BASE}Grupo-Wagner/grupos.html`, match: ["grupos.html", "grupo.html", "grupo-wagner"] },
    { id: "assinaturas", label: "Assinaturas", href: `${BASE}index.html#planos`, match: ["assinaturas.html", "#planos"] },
    { id: "faq", label: "FAQ", href: `${BASE}faq-joao/faq.html`, match: ["faq.html", "faq-joao"] }
  ];

  const headerTemplate = () => `
    <div class="container nav" style="display:flex;align-items:center;justify-content:space-between;gap:1rem;">
      <a href="${BASE}index.html#home" class="brand" aria-label="Pǭgina inicial Tarefando">
        <span class="brand-badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9l-3 2V4z" stroke="white" stroke-opacity=".9" stroke-width="1.5"/>
            <path d="M9 8h6M9 12h6M9 16h4" stroke="white" stroke-opacity=".9" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </span>
        <span>Tarefando</span>
      </a>
      <nav class="menu" aria-label="menu principal" style="flex:1;justify-content:center;">
        ${menuItems.map(item => `<a class="btn" data-menu-id="${item.id}" href="${item.href}">${item.label}</a>`).join("")}
      </nav>
      <div class="account" style="margin-left:auto;">
        <button id="accountBtn" class="btn btn--round" aria-haspopup="menu" aria-expanded="false" aria-controls="accountMenu">
          <span class="sr-only">Abrir menu da conta</span>
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="2" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <div id="accountMenu" class="menu-popover" role="menu">
          <a role="menuitem" class="menu-item" href="#entrar">Entrar</a>
          <a role="menuitem" class="menu-item highlight" href="#cadastro">Cadastrar</a>
        </div>
      </div>
    </div>`;

  const footerTemplate = () => `
    <div class="container footer-content">
      <div>
        <strong>Tarefando</strong>
        <p class="section-desc">Cadernos e estudos compartilhados.</p>
      </div>
      <div>
        <p><a href="${BASE}index.html#planos">Pre��os e planos</a></p>
        <p><a href="#">Termos</a> �� <a href="#">Privacidade</a></p>
      </div>
      <div>
        <p>Contato: <a href="mailto:contato@tarefando.app">contato@tarefando.app</a></p>
        <p>�� <span id="y"></span> Tarefando</p>
      </div>
    </div>`;

  function setActiveMenu() {
    const override = document.body?.dataset?.activeMenu;
    const currentPath = (location.pathname || "").toLowerCase();
    const chosen = override
      ? menuItems.find(item => item.id === override)
      : menuItems.find(item => item.match.some(chunk => currentPath.includes(chunk)));

    if (!chosen) return;
    const link = document.querySelector(`[data-menu-id="${chosen.id}"]`);
    if (link) link.setAttribute("aria-current", "page");
  }

  function wireAccountPopover() {
    const btn = document.getElementById("accountBtn");
    const menu = document.getElementById("accountMenu");
    if (!btn || !menu) return;
    const wrap = btn.parentElement;
    const close = () => {
      wrap.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    };
    const toggle = () => {
      const open = wrap.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    };
    btn.addEventListener("click", toggle);
    document.addEventListener("click", e => { if (!wrap.contains(e.target)) close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") { close(); btn.focus(); } });
  }

  function updateFooterYear() {
    const y = document.getElementById("y");
    if (y) y.textContent = new Date().getFullYear();
  }

  function applyLayout() {
    const header = document.querySelector("header");
    if (header) header.innerHTML = headerTemplate();
    const footer = document.querySelector("footer");
    if (footer) footer.innerHTML = footerTemplate();
    setActiveMenu();
    wireAccountPopover();
    updateFooterYear();
  }

  window.applySiteLayout = applyLayout;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyLayout);
  } else {
    applyLayout();
  }
})();
