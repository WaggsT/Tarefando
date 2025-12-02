// Login e Cadastro (frontend-only) – Tarefando
// Observação: senhas são armazenadas em texto puro apenas para fins didáticos.
// Em produção, usar hashing/criptografia e backend real.

(function () {
  const KEY_USERS = "tarefando_usuarios";
  const KEY_LOGGED = "tarefando_usuario_logado";

  /* Helpers de storage */
  function loadUsuarios() {
    try {
      return JSON.parse(localStorage.getItem(KEY_USERS) || "[]");
    } catch (_) {
      return [];
    }
  }
  function saveUsuarios(list) {
    try {
      localStorage.setItem(KEY_USERS, JSON.stringify(list || []));
    } catch (_) {}
  }
  function saveUsuarioLogado(user) {
    try {
      localStorage.setItem(KEY_LOGGED, JSON.stringify(user));
    } catch (_) {}
  }

  /* UI helpers */
  function showBlockError(el, msg) {
    if (!el) return;
    el.textContent = msg || "";
  }
  function clearBlockError(el) {
    if (!el) return;
    el.textContent = "";
  }

  function emailValido(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  /* CEP */
  async function buscarEnderecoPorCep(cep) {
    const limpo = String(cep || "").replace(/\D/g, "");
    if (limpo.length !== 8) throw new Error("CEP inválido");
    const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
    if (!res.ok) throw new Error("Erro ao buscar CEP");
    const data = await res.json();
    if (data.erro) throw new Error("CEP não encontrado");
    return data;
  }

  function preencherCamposEndereco(data) {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && val) el.value = val;
    };
    setVal("signupLogradouro", data.logradouro);
    setVal("signupBairro", data.bairro);
    setVal("signupCidade", data.localidade);
    setVal("signupEstado", data.uf);
  }

  /* Troca de abas */
  function switchToLoginForm() {
    const tabLogin = document.getElementById("tabLogin");
    const tabSignup = document.getElementById("tabSignup");
    const loginWrap = document.getElementById("loginFormWrap");
    const signupWrap = document.getElementById("signupFormWrap");
    if (tabLogin) tabLogin.classList.add("is-active");
    if (tabSignup) tabSignup.classList.remove("is-active");
    if (loginWrap) loginWrap.style.display = "block";
    if (signupWrap) signupWrap.style.display = "none";
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
    const nome = document.getElementById("signupNome");
    if (nome) nome.focus();
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
      showBlockError(errorsEl, "Informe um e-mail válido.");
      return;
    }

    const usuarios = loadUsuarios();
    const found = usuarios.find(u => u.email?.toLowerCase() === email.toLowerCase() && u.senha === senha);
    if (!found) {
      showBlockError(errorsEl, "E-mail ou senha incorretos.");
      return;
    }

    saveUsuarioLogado({ id: found.id, nome: found.nome, email: found.email });
    alert("Login realizado com sucesso");
  }

  /* Cadastro */
  async function handleSignupSubmit(e) {
    e.preventDefault();
    const errorsEl = document.getElementById("signupErrors");
    clearBlockError(errorsEl);

    const nome = document.getElementById("signupNome")?.value.trim();
    const email = document.getElementById("signupEmail")?.value.trim();
    const telefone = document.getElementById("signupTelefone")?.value.trim();
    const senha = document.getElementById("signupSenha")?.value.trim();
    const senha2 = document.getElementById("signupSenha2")?.value.trim();
    const cep = document.getElementById("signupCep")?.value.trim();
    const logradouro = document.getElementById("signupLogradouro")?.value.trim();
    const numero = document.getElementById("signupNumero")?.value.trim();
    const complemento = document.getElementById("signupComplemento")?.value.trim();
    const bairro = document.getElementById("signupBairro")?.value.trim();
    const cidade = document.getElementById("signupCidade")?.value.trim();
    const estado = document.getElementById("signupEstado")?.value.trim();
    const cepErro = document.getElementById("cepErro");

    showBlockError(cepErro, "");

    if (!nome || !email || !senha || !senha2 || !cep) {
      showBlockError(errorsEl, "Preencha os campos obrigatórios.");
      return;
    }
    if (!emailValido(email)) {
      showBlockError(errorsEl, "E-mail inválido.");
      return;
    }
    if (senha.length < 6) {
      showBlockError(errorsEl, "A senha precisa ter ao menos 6 caracteres.");
      return;
    }
    if (senha !== senha2) {
      showBlockError(errorsEl, "As senhas não coincidem.");
      return;
    }
    if (!/^\d{8}$/.test(cep)) {
      showBlockError(cepErro, "CEP deve ter 8 números.");
      return;
    }

    // Valida duplicidade de e-mail
    const usuarios = loadUsuarios();
    if (usuarios.some(u => u.email?.toLowerCase() === email.toLowerCase())) {
      showBlockError(errorsEl, "Já existe uma conta com este e-mail.");
      return;
    }

    // Busca CEP (ignora erros para não bloquear cadastro, mas tenta preencher)
    try {
      const data = await buscarEnderecoPorCep(cep);
      preencherCamposEndereco(data);
    } catch (err) {
      showBlockError(cepErro, err.message || "CEP inválido");
    }

    const novo = {
      id: Date.now(),
      nome,
      email,
      senha, // Em produção, criptografar a senha antes de salvar.
      telefone,
      endereco: {
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado
      }
    };
    usuarios.push(novo);
    saveUsuarios(usuarios);
    saveUsuarioLogado({ id: novo.id, nome: novo.nome, email: novo.email });
    alert("Conta criada com sucesso!");
    switchToLoginForm();
    const emailEl = document.getElementById("loginEmail");
    const senhaEl = document.getElementById("loginSenha");
    if (emailEl) emailEl.value = email;
    if (senhaEl) senhaEl.value = senha;
  }

  /* CEP blur/listener */
  function setupCepListener() {
    const cepEl = document.getElementById("signupCep");
    const cepErro = document.getElementById("cepErro");
    if (!cepEl) return;
    const handler = async () => {
      showBlockError(cepErro, "");
      const val = cepEl.value.trim();
      if (!/^\d{8}$/.test(val)) return;
      try {
        const data = await buscarEnderecoPorCep(val);
        preencherCamposEndereco(data);
      } catch (err) {
        showBlockError(cepErro, err.message || "CEP inválido");
      }
    };
    cepEl.addEventListener("blur", handler);
    cepEl.addEventListener("input", () => {
      if (cepEl.value.replace(/\D/g, "").length === 8) handler();
    });
  }

  /* Google Identity Services */
  function initGoogleLogin() {
    if (!window.google || !window.google.accounts || !window.google.accounts.id) return;
    window.google.accounts.id.initialize({
      client_id: "COLOQUE_SEU_CLIENT_ID_GOOGLE_AQUI", // TODO: substituir pelo client_id real
      callback: onGoogleLoginSuccess
    });
    // Render pode ser feita em um container; aqui chamamos prompt para UI básica.
    const btn = document.getElementById("btnGoogle");
    if (btn) {
      btn.addEventListener("click", () => window.google.accounts.id.prompt());
    }
  }

  function onGoogleLoginSuccess(response) {
    console.log("Google login success", response);
    // TODO: trocar por chamada real de token/backend.
    const dummyUser = { id: Date.now(), nome: "Usuário Google", email: "google-user@example.com", provider: "google" };
    saveUsuarioLogado(dummyUser);
    alert("Login via Google simulado (configure o client_id para usar de verdade).");
  }

  /* Microsoft / MSAL */
  let msalInstance = null;
  function initMicrosoftLogin() {
    if (!window.msal || !window.msal.PublicClientApplication) return;
    msalInstance = new msal.PublicClientApplication({
      auth: {
        clientId: "COLOQUE_SEU_CLIENT_ID_MICROSOFT_AQUI", // TODO: substituir pelo clientId real
        redirectUri: window.location.origin + "/codigo/public/modulos/login/index.html"
      },
      cache: { cacheLocation: "localStorage", storeAuthStateInCookie: false }
    });
    const btn = document.getElementById("btnMicrosoft");
    if (btn) btn.addEventListener("click", loginWithMicrosoft);
  }

  async function loginWithMicrosoft() {
    if (!msalInstance) return;
    const loginRequest = { scopes: ["User.Read"] };
    try {
      const res = await msalInstance.loginPopup(loginRequest);
      console.log("Microsoft login success", res);
      const account = res.account;
      const user = { id: account.localAccountId, nome: account.name || "Usuário Microsoft", email: account.username, provider: "microsoft" };
      saveUsuarioLogado(user);
      alert("Login via Microsoft simulado (configure clientId/redirectUri para usar de verdade).");
    } catch (err) {
      console.error("Microsoft login error", err);
      alert("Não foi possível entrar com Microsoft. Verifique as configurações.");
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

    setupCepListener();

    // Seleciona a aba conforme a querystring (?mode=login|signup)
    const mode = new URLSearchParams(location.search).get("mode");
    if (mode === "signup") {
      switchToSignupForm();
    } else {
      switchToLoginForm();
    }

    // Inicializa integrações sociais (só funcionam com client_id configurado)
    initGoogleLogin();
    initMicrosoftLogin();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLoginPage);
  } else {
    initLoginPage();
  }
})();
