// ===============================================
// Tarefando — JS Comum do Front-End
// ===============================================
// Este script cuida de:
//  • Atualizar o ano do rodapé automaticamente.
//  • Gerenciar o popover do ícone de usuário (abrir/fechar menu).
//  • Estrutura simples e compatível com todas as páginas.
//
// Autor: Equipe Tarefando
// ===============================================

// Atualiza automaticamente o ano no rodapé (#y)
(() => {
  const yearEl = document.getElementById('y');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

// Controla o popover do botão de conta (ícone de usuário)
(() => {
  const btn = document.getElementById('accountBtn');
  const menu = document.getElementById('accountMenu');
  if (!btn || !menu) return; // se a página não tem o menu de conta, sai

  const wrap = btn.parentElement;

  const close = () => {
    wrap.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
  };

  const toggle = () => {
    const open = wrap.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  // Eventos de interação
  btn.addEventListener('click', toggle);

  // Fechar ao clicar fora
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) close();
  });

  // Fechar com tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      close();
      btn.focus();
    }
  });
})();

// ===============================================
// (Opcional) Modo de demonstração para o backend JSONServer
// ===============================================
// Este trecho é apenas referência e NÃO deve ser executado no front.
// Se quiser rodar localmente um servidor JSON, copie o código abaixo
// para um arquivo separado chamado "server.js" fora da pasta /public.
//
// Exemplo:
//
// const jsonServer = require('json-server');
// const server = jsonServer.create();
// const router = jsonServer.router('./db/db.json');
// const middlewares = jsonServer.defaults({ noCors: true });
// server.use(middlewares);
// server.use(router);
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => console.log(`JSON Server rodando em http://localhost:${PORT}`));
//
// ===============================================
