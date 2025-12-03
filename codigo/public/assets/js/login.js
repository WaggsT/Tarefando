// Autenticacao front-end (demo) - Tarefando
// Contas fixas: admin@tarefando.com.br (admin123) e usuario@tarefando.com.br (usuario123)
(function () {
  const USERS = [
    { email: "admin@tarefando.com.br", password: "admin123", role: "admin" },
    { email: "usuario@tarefando.com.br", password: "usuario123", role: "user" }
  ];
  const SESSION_KEY = "tarefando_user";
  const HOME_URL = "/codigo/public/index.html";
  const LOGIN_URL = "/codigo/public/modulos/login/index.html";

  /* Storage */
  function saveSession(user) {
    if (!user) return null;
    const payload = { email: user.email, role: user.role };
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(payload)); } catch (_) {}
    return payload;
  }
  function clearSession() {
    try { localStorage.removeItem(SESSION_KEY); } catch (_) {}
  }
  function getSessionUser() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }
  window.tarefandoSessionKey = SESSION_KEY;

  /* UI helpers */
  function showBlockError(el, msg) { if (el) el.textContent = msg || ""; }
  function clearBlockError(el) { if (el) el.textContent = ""; }
  function emailValido(email) { return /\S+@\S+\.\S+/.test(email); }

  function switchToLoginForm() {
    const tabLogin = document.getElementById("tabLogin");
    const tabSignup = document.getElementById("tabSignup");
    const loginWrap = document.getElementById("loginFormWrap");
    const signupWrap = document.getElementById("signupFormWrap");
    if (tabLogin) tabLogin.classList.add("is-active");
    if (tabSignup) tabSignup.classList.remove("is-active");
    if (loginWrap) loginWrap.style.display = "block";
    if (signupWrap) signupWrap.style.display = "none";
    clearBlockError(document.getElementById("loginErrors"));
    const email = document.getElementById("loginEmail");
    if (email) email.focus();
  }

  function switchToSignupForm() {
    const tabLogin = document.getElementById("tabLogin");
    const tabSignup = document.getElementById("tabSignup");
    const loginWrap = document.getElementById("loginFormWrap");
    const signupWrap = document.getElementById("signupFormWrap");
    if (tabSignup) tabSignup.classList.add("is-active");
    if (tabLogin) tabLogin.classList.remove("is-active");
    if (signupWrap) signupWrap.style.display = "block";
    if (loginWrap) loginWrap.style.display = "none";
    clearBlockError(document.getElementById("signupErrors"));
    const nome = document.getElementById("signupNome");
    if (nome) nome.focus();
  }

  function redirectAfterLogin() {
    const params = new URLSearchParams(location.search);
    const redirect = params.get("redirect");
    const referrer = document.referrer && document.referrer.includes("/codigo/public/") ? document.referrer : null;
    window.location.href = redirect || referrer || HOME_URL;
  }

  /* Login */
  function handleLoginSubmit(e) {
    e.preventDefault();
    const emailEl = document.getElementById("loginEmail");
    const senhaEl = document.getElementById("loginSenha");
    const errorsEl = document.getElementById("loginErrors");
    clearBlockError(errorsEl);

    const email = emailEl?.value.trim();
    const senha = senhaEl?.value.trim();
    if (!email || !senha) {
      showBlockError(errorsEl, "Preencha e-mail e senha.");
      return;
    }
    if (!emailValido(email)) {
      showBlockError(errorsEl, "Informe um e-mail valido.");
      return;
    }

    const found = USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === senha);
    if (!found) {
      showBlockError(errorsEl, "E-mail ou senha incorretos.");
      return;
    }
    saveSession(found);
    redirectAfterLogin();
  }

  /* Cadastro desabilitado na versao demo */
  function handleSignupSubmit(e) {
    e.preventDefault();
    const errorsEl = document.getElementById("signupErrors");
    clearBlockError(errorsEl);
    const email = document.getElementById("signupEmail")?.value.trim();
    showBlockError(errorsEl, "Cadastros estao desativados nesta versao. Use uma das contas demo acima.");
    switchToLoginForm();
    const loginEmail = document.getElementById("loginEmail");
    if (loginEmail && email) loginEmail.value = email;
  }

  /* Social buttons apenas informam uso de contas fixas */
  function wireSocialButtons() {
    const msg = "Use as contas fixas: admin@tarefando.com.br (admin123) ou usuario@tarefando.com.br (usuario123).";
    const btnGoogle = document.getElementById("btnGoogle");
    const btnMicrosoft = document.getElementById("btnMicrosoft");
    if (btnGoogle) btnGoogle.addEventListener("click", () => alert(msg));
    if (btnMicrosoft) btnMicrosoft.addEventListener("click", () => alert(msg));
  }

  function hydrateSignupForm() {
    const faculdadeSelect = document.getElementById("faculdadeSelect");
    if (faculdadeSelect) {
      faculdadeSelect.innerHTML = '<option value="">Cadastros desativados (use contas demo)</option>';
    }
  }

  function initLoginPage() {
    const tabLogin = document.getElementById("tabLogin");
    const tabSignup = document.getElementById("tabSignup");
    if (tabLogin) tabLogin.addEventListener("click", switchToLoginForm);
    if (tabSignup) tabSignup.addEventListener("click", switchToSignupForm);

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    if (loginForm) loginForm.addEventListener("submit", handleLoginSubmit);
    if (signupForm) signupForm.addEventListener("submit", handleSignupSubmit);

    hydrateSignupForm();
    wireSocialButtons();

    const mode = new URLSearchParams(location.search).get("mode");
    if (mode === "signup") switchToSignupForm(); else switchToLoginForm();

    const current = getSessionUser();
    if (current) {
      const status = document.getElementById("loginErrors");
      showBlockError(status, `Voce ja esta logado como ${current.email}.`);
    }
  }

  /* Logout helper para botao na pagina de login */
  const logoutBtn = document.getElementById("btnLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearSession();
      window.location.href = LOGIN_URL;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLoginPage);
  } else {
    initLoginPage();
  }
})();
