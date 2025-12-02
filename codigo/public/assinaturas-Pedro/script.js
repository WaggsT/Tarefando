const apiUrl = "https://f9964542-666c-43e2-a68e-dcf09cad3194-00-2v0mysfsljsr1.spock.replit.dev/";
const userId = 1; 

async function carregarPlanos() {
  const response = await fetch(`${apiUrl}/planos`);
  const planos = await response.json();
  exibirPlanos(planos);
  carregarPlanoAtual();
}

function exibirPlanos(planos) {
  const container = document.getElementById("planos-container");
  container.innerHTML = "";

  planos.forEach(plano => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <h3>${plano.nome}</h3>
      <p><strong>R$ ${plano.preco.toFixed(2)}</strong>/mês</p>
      <ul>${plano.beneficios.map(b => `<li>${b}</li>`).join("")}</ul>
      <button onclick="trocarPlano(${plano.id})">Selecionar</button>
    `;

    container.appendChild(card);
  });
}

async function carregarPlanoAtual() {
  const response = await fetch(`${apiUrl}/usuarios/${userId}`);
  const usuario = await response.json();

  if (usuario.planoId) {
    const planoResponse = await fetch(`${apiUrl}/planos/${usuario.planoId}`);
    const plano = await planoResponse.json();
    document.getElementById("plano-atual").innerText = plano.nome;
  } else {
    document.getElementById("plano-atual").innerText = "Nenhum plano ativo.";
  }
}

async function trocarPlano(planoId) {
  await fetch(`${apiUrl}/usuarios/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planoId })
  });

  alert("Plano atualizado com sucesso!");
  carregarPlanoAtual();
}

async function cancelarPlano() {
  await fetch(`${apiUrl}/usuarios/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planoId: null })
  });

  alert("Plano cancelado!");
  carregarPlanoAtual();
}

document.getElementById("cancelar-plano").addEventListener("click", cancelarPlano);
carregarPlanos();
