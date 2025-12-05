// Layout canonico para compartilhar header e footer
(function () {
  const BASE = "/codigo/public/";
  const SESSION_KEY = "tarefando_user";
  const menuItems = [
    { id: "home", label: "Home", href: `${BASE}index.html#home`, match: ["index.html"] },
    { id: "faculdades", label: "Faculdades", href: `${BASE}modules/faculdades/index.html`, match: ["modules/faculdades", "faculdades.html"] },
    { id: "cadernos", label: "Cadernos", href: `${BASE}modules/cadernos/index.html`, match: ["modules/cadernos", "cadernos.html", "material.html"] },
    { id: "disciplinas", label: "Disciplinas", href: `${BASE}modules/disciplinas/index.html`, match: ["modules/disciplinas", "disciplinas.html"] },
    { id: "grupos", label: "Grupos", href: `${BASE}modules/grupos/index.html`, match: ["modules/grupos", "grupos.html", "grupo.html"] },
    { id: "assinaturas", label: "Assinaturas", href: `${BASE}assinaturas.html`, match: ["assinaturas.html"] },
    { id: "faq", label: "FAQ", href: `${BASE}faq.html`, match: ["faq.html"] }
  ];

  function getCurrentUser() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function logout() {
    try { localStorage.removeItem(SESSION_KEY); } catch (_) {}
    window.location.href = `${BASE}modulos/login/index.html`;
  }

  window.getCurrentUser = getCurrentUser;

  const headerTemplate = (user) => `
    <div class="container nav" style="display:flex;align-items:center;justify-content:space-between;gap:1rem;">
      <a id="brandLink" href="${BASE}index.html#home" class="brand" aria-label="Página inicial Tarefando">
        <span class="brand-text">Tarefando</span>
      </a>
      <nav id="mainMenu" class="menu" aria-label="menu principal" style="flex:1;justify-content:center;">
        ${menuItems.map(item => `<a class="btn" data-menu-id="${item.id}" href="${item.href}">${item.label}</a>`).join("")}
      </nav>
      <button class="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="mainMenu">
        <span></span><span></span><span></span>
      </button>
      <div class="account" style="margin-left:auto;">
        <button id="accountBtn" class="btn btn--round" aria-haspopup="menu" aria-expanded="false" aria-controls="accountMenu">
          <span class="sr-only">Abrir menu da conta</span>
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="2" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <div id="accountMenu" class="menu-popover" role="menu">
          ${user ? `
            <div id="accountStatus" class="menu-item" role="presentation">
              Logado como ${user.email} ${user.role === "admin" ? "(Admin)" : ""}
            </div>
            ${user.role === "admin" ? `<button class="menu-item btnD" type="button" onclick="location.href='${BASE}admin/dashboard.html'">Dashboard</button>` : ""}
            <button id="logoutBtn" class="menu-item highlight" type="button">Sair</button>
          ` : `
            <a role="menuitem" class="menu-item" href="${BASE}modulos/login/index.html?mode=login">Entrar</a>
            <a role="menuitem" class="menu-item highlight" href="${BASE}modulos/login/index.html?mode=signup">Cadastrar</a>
          `}
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
        <p><a href="${BASE}assinaturas.html">Preços e planos</a></p>
        <p><a href="#">Termos</a> · <a href="#">Privacidade</a></p>
      </div>
      <div>
        <p>Contato: <a href="mailto:contato@tarefando.app">contato@tarefando.app</a></p>
        <p>© <span id="y"></span> Tarefando</p>
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

  function wireMenuToggle() {
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.getElementById("mainMenu");
    if (!toggle || !menu) return;
    const close = () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };
    const setState = (open) => {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    toggle.addEventListener("click", () => {
      const next = !menu.classList.contains("is-open");
      setState(next);
    });

    document.addEventListener("click", (e) => {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        close();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) close();
    });
  }

  function wireAccountActions(user) {
    const logoutBtn = document.getElementById("logoutBtn");
    const status = document.getElementById("accountStatus");
    if (status && user) {
      status.textContent = `Logado como ${user.email}${user.role === "admin" ? " (Admin)" : ""}`;
    }
    if (logoutBtn) logoutBtn.addEventListener("click", logout);
  }

  function hideHomeCtasIfLogged(user) {
    if (!user) return;
    document.getElementById("btnCadastrar")?.remove();
    document.getElementById("btnEntrar")?.remove();
    document.querySelector(".cta-home")?.classList.add("hidden");
  }

  function applyLayout() {
    const user = getCurrentUser();
    const header = document.querySelector("header");
    if (header) header.innerHTML = headerTemplate(user);
    const footer = document.querySelector("footer");
    if (footer) footer.innerHTML = footerTemplate();
    setActiveMenu();
    wireAccountPopover();
    wireMenuToggle();
    wireAccountActions(user);
    hideHomeCtasIfLogged(user);
    updateFooterYear();
  }

  window.applySiteLayout = applyLayout;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyLayout);
  } else {
    applyLayout();
  }
})();
