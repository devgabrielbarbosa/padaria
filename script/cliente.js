let carrinho = [];
let taxaDeEntrega = 0;

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  onSnapshot
}  from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { query, where } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAyY14CV-ODcWMSD4tdGkGzh0HlZr_8KvY",
  authDomain: "lanchonete-lj.firebaseapp.com",
  projectId: "lanchonete-lj",
  storageBucket: "lanchonete-lj.firebasestorage.app",
  messagingSenderId: "939172982803",
  appId: "1:939172982803:web:9695ada6d98d4fed858fe6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Definindo a referência do documento 'loja' na coleção 'configuracoes'
const lojaDocRef = doc(db, "configuracoes", "loja");

window.abrirModal = function () {
  document.getElementById('modal').style.display = 'block';
  document.getElementById('modal-overlay').style.display = 'block';
  
  // Chamar depois de abrir o modal
  calcularTaxaDeEntrega();
};

window.fecharModal = function () {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
};

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distancia = R * c;
  return distancia; // em km
}


function calcularTaxaDeEntrega() {
  if (!navigator.geolocation) {
    alert("Geolocalização não é suportada.");
    taxaDeEntrega = 0;
    atualizarCarrinho();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const userLat = pos.coords.latitude;
      const userLng = pos.coords.longitude;

      // 📍 Coordenadas exatas da loja (ajuste conforme necessário)
      const lojaLat = -7.191562;
      const lojaLng = -48.208474;

      const distancia = calcularDistancia(userLat, userLng, lojaLat, lojaLng);
      console.log(`Distância calculada: ${distancia.toFixed(2)} km`);

      if (distancia <= 1) {
  taxaDeEntrega = 0;
} else if (distancia <= 3) {
  taxaDeEntrega = 3;   // taxa menor para curtas distâncias
} else if (distancia <= 5) {
  taxaDeEntrega = 6;
} else if (distancia <= 8) {
  taxaDeEntrega = 10;
} else if (distancia <= 15) {
  taxaDeEntrega = 15;
} else {
  taxaDeEntrega = 20;
}


      atualizarCarrinho();
    },
    (err) => {
      console.error("Erro de geolocalização:", err);
      taxaDeEntrega = 0;
      alert("Não foi possível obter sua localização. A taxa será R$ 0,00.");
      atualizarCarrinho();
    }
  );
}

// Definindo a função carregarProdutos antes de chamá-la
window.carregarProdutos = async function carregarProdutos() {
  const categoriaSelecionada = document.getElementById('filtro-categoria').value;
  const listaProdutos = document.getElementById('lista-produtos');
  listaProdutos.innerHTML = ''; // Limpa a lista antes de carregar os produtos

  const produtosRef = collection(db, 'produtos');
  let produtosQuery;

  if (categoriaSelecionada === 'tudo') {
    produtosQuery = query(produtosRef, where('ativo', '==', true));
  } else if (categoriaSelecionada) {
    produtosQuery = query(produtosRef, where('categoria', '==', categoriaSelecionada), where('ativo', '==', true));
  } else {
    listaProdutos.innerHTML = "<p>Nenhum produto encontrado.</p>";
    return;
  }

  try {
    const produtosSnapshot = await getDocs(produtosQuery);

    if (produtosSnapshot.empty) {
      listaProdutos.innerHTML = "<p>Nenhum produto encontrado.</p>";
      return;
    }

    produtosSnapshot.forEach((doc) => {
      const data = doc.data();
      const li = document.createElement('li');
      const quantidadeId = `quantidade-${doc.id}`;

      li.innerHTML = `
        <div class="produto">
          <div class="img">
            <img  src="${data.imagem}" alt="${data.nome}" width="400" height="100" />
          </div>
          <div class="detalhes-produto">
            <h3>${data.nome}</h3>
            <p>R$ ${data.preco.toFixed(2)}</p>
            <p>${data.descricao}</p>
            <p>Categoria: ${data.categoria}</p>
            <div class="quantidade-controle">
              <button class="botao-tema-vermelho" onclick="alterarQuantidadeVisual('${quantidadeId}', -1, '${doc.id}', '${data.nome}', ${data.preco})">−</button>
              <span id="${quantidadeId}">0</span>
              <button class="botao-tema-verde" onclick="alterarQuantidadeVisual('${quantidadeId}', 1, '${doc.id}', '${data.nome}', ${data.preco})">+</button>
            </div>
          </div>
        </div>
      `;

      listaProdutos.appendChild(li);
    });
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    listaProdutos.innerHTML = "<p>Erro ao carregar produtos. Tente novamente.</p>";
  }
}

window.alterarQuantidadeVisual = function (idSpan, delta, id, nome, preco) {
  const span = document.getElementById(idSpan);
  if (!span) return;

  let quantidade = parseInt(span.textContent);
  quantidade = Math.max(0, quantidade + delta);
  span.textContent = quantidade;

  const itemExistente = carrinho.find((item) => item.id === id);

  if (itemExistente) {
    itemExistente.quantidade = quantidade;
    if (quantidade === 0) {
      carrinho = carrinho.filter((item) => item.id !== id);
    }
  } else if (quantidade > 0) {
    carrinho.push({ id, nome, preco, quantidade });
  }

  atualizarCarrinho(); // Garante que o modal da sacola também atualize
};

window.alterarQuantidade = function (id, delta) {
  const span = document.getElementById(id);
  let quantidade = parseInt(span.textContent);
  quantidade = Math.max(1, quantidade + delta);
  span.textContent = quantidade;
  const item = carrinho.find((item) => item.id === id);
  if (item) {
    item.quantidade = quantidade;
    if (quantidade === 0) {
      carrinho = carrinho.filter((item) => item.id !== id);
    }
  }
  atualizarCarrinho();
}

function atualizarCarrinho() {
  const modalCarrinho = document.getElementById("modal-carrinho");
  const qtdItens = document.getElementById("qtd-itens");
  const totalModal = document.getElementById("total-modal");
  const taxaModal = document.getElementById("taxa-modal");

  modalCarrinho.innerHTML = "";
  let total = 0;

  carrinho.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.quantidade} x ${item.nome} (R$ ${item.preco.toFixed(2)})
    `;
    modalCarrinho.appendChild(li);
    total += item.preco * item.quantidade;
  });

  // Atualiza o campo taxa de entrega no modal
  taxaModal.innerText = `R$ ${taxaDeEntrega.toFixed(2)}`;

  total += taxaDeEntrega;
  totalModal.textContent = total.toFixed(2);
  qtdItens.textContent = carrinho.length;
}

window.finalizarPedido = async function () {
  const nomeCliente = document.getElementById("nome-cliente-modal").value.trim();
  const observacoes = document.getElementById("observacoes-modal").value.trim();
  const localizacaoCliente = document.getElementById("endereco-modal").value.trim();
  const complemento = document.getElementById("complemento").value.trim();
  const resumoNomeEl = document.getElementById("resumo-nome");
  const resumoEnderecoEl = document.getElementById("resumo-endereco");


  if (!nomeCliente) {
    alert("Por favor, informe seu nome.");
    return;
  }

  if (!localizacaoCliente) {
    alert("Por favor, informe sua localização (ex: bairro ou rua).");
    return;
  }

  // Cria o resumo do pedido em texto (para a mensagem)
  const resumoTexto = carrinho
    .map((item) => `${item.quantidade} x ${item.nome} (R$ ${item.preco.toFixed(2)})`)
    .join(", ");

  const total = document.getElementById("total-modal").textContent;

  // Monta texto com pedido e informações para a mensagem (sem link no texto do pedido)
  const textoPedido = 
    `Olá, meu nome é ${nomeCliente} e gostaria de fazer um pedido:\n\n` +
    `${resumoTexto}\n\n` +
    `Observações: ${observacoes}\n` +
    `Taxa de entrega: R$ ${taxaDeEntrega.toFixed(2)}\n` +
    `Endereço: ${localizacaoCliente}\n` +
    `Complemento: ${complemento}\n` +
    `Total: R$ ${total}`;

  // Link para o endereço no Google Maps (usando o endereço digitado)
  const linkLocalizacao = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(localizacaoCliente)}`;

  // Atualiza o resumo no modal para gerar a imagem (print)
  // Aqui você deve ter um elemento "resumo-pedido" com o resumo que quer imprimir (sem localização)
  const resumoProdutosEl = document.getElementById("resumo-produtos");
  resumoProdutosEl.innerHTML = carrinho.map(
    (item) => `<li>${item.quantidade} x ${item.nome} (R$ ${item.preco.toFixed(2)})</li>`
  ).join("");

  const resumoTaxaEl = document.getElementById("resumo-taxa");
  resumoTaxaEl.textContent = `R$ ${taxaDeEntrega.toFixed(2)}`;

  const resumoObservacoesEl = document.getElementById("resumo-observacoes");
  resumoObservacoesEl.textContent = observacoes;

  const resumoTotalEl = document.getElementById("resumo-total");
  resumoTotalEl.textContent = total;
  resumoEnderecoEl.textContent = localizacaoCliente || "Não informado";
  resumoNomeEl.textContent = nomeCliente || "Anônimo";
  const resumoComplementoEl = document.getElementById("resumo-complemento");
  resumoComplementoEl.textContent = complemento || "Nenhum";


  // Mostra o loading
  document.getElementById("carregando").style.display = "block";

  try {
    // Gera a imagem só do resumo-pedido (sem o endereço)
    const canvas = await html2canvas(document.getElementById("resumo-pedido"), { scale: 1 });
    const imagemBase64 = canvas.toDataURL("image/png").split(",")[1]; // só o base64 sem prefixo

    // Prepara para enviar para o ImgBB
    const formData = new FormData();
    formData.append("image", imagemBase64);

    // Envia imagem para ImgBB
    const response = await fetch("https://api.imgbb.com/1/upload?key=5633d7932b72210c398e734ddbc2d8ea", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.data || !result.data.url) {
      console.error("Erro na API do ImgBB:", result);
      alert("Erro ao enviar a imagem do pedido. Tente novamente mais tarde.");
      return;
    }

    const imagemURL = result.data.url;

    // Monta a mensagem final para o WhatsApp com texto + link da localização + link da imagem do pedido
    const mensagemWhatsApp = 
      `${textoPedido}\n\n` +
      `📍 Localização: ${localizacaoCliente}\n`
      + `📍 Complemento: ${complemento}\n` +
      `🔗 Link da localização: ${linkLocalizacao}\n\n` +
      `📸 Imagem do pedido: ${imagemURL}`;

    const numero = "5563991300213"; // Número do WhatsApp da padaria
    const linkWhatsApp = `https://wa.me/${numero}?text=${encodeURIComponent(mensagemWhatsApp)}`;

    // Abre o WhatsApp com a mensagem pronta
    window.open(linkWhatsApp, "_blank");

    // Limpa carrinho e fecha modal
    carrinho = [];
    atualizarCarrinho();
    fecharModal();

  } catch (err) {
    console.error("Erro ao finalizar o pedido:", err);
    alert("Erro ao finalizar o pedido. Tente novamente.");
  } finally {
    document.getElementById("carregando").style.display = "none";
  }
};


window.limparCarrinho = function() {
  // Limpa o carrinho no localStorage
  localStorage.removeItem('carrinho');

  // Atualiza a interface do carrinho (caso tenha uma função para isso)
  carrinho = [];
  atualizarCarrinho();

  // Limpa o conteúdo do modal
  const modalCarrinho = document.querySelector('#modal-carrinho');
  if (modalCarrinho) {
    modalCarrinho.innerHTML = ''; // Remove todos os itens dentro do modal
  }

  // Limpar os campos de nome e outros campos dentro do modal (caso necessário)
  const nomeCliente = document.querySelector('#nome-cliente-modal');
  if (nomeCliente) {
    nomeCliente.value = ''; // Limpa o campo de nome do cliente
  }

  // Caso haja uma lista de pedidos ou informações dentro do modal, você pode limpá-las
  const listaPedidos = document.querySelector('#pedido-lista'); // Ajuste o seletor conforme necessário
  if (listaPedidos) {
    listaPedidos.innerHTML = ''; // Limpa os pedidos listados no modal
  }

  // Alterar o total do pedido 
  const totalModal = document.querySelector('#total-modal');
  if (totalModal) {
    totalModal.textContent = '0.00'; // Reseta o total para zero (sem "R$")
  }

  // Exibe uma mensagem de sucesso
  alert('Carrinho limpo com sucesso!');
}

window.alternarModoEscuro = function () {
  document.body.classList.toggle("modo-escuro");
};
window.alternarTema = function () {
  const app = document.getElementById("app");
  app.classList.toggle("dark");
  app.classList.toggle("light");
}

function dentroDoHorarioDeFuncionamento() {
  const agora = new Date();
  const horas = agora.getHours();
  const minutos = agora.getMinutes();
  const agoraMinutos = horas * 60 + minutos;

  // Intervalo da madrugada: 00h00 até 04h00
  const inicioMadrugada = 0;        // 00:00 = 0 minutos
  const fimMadrugada = 4 * 60;      // 04:00 = 240 minutos

  // Intervalo da manhã: 08h00 até 11h00
  const inicioManha = 8 * 60;       // 480
  const fimManha = 11 * 60;         // 660

  // Intervalo da tarde: 15h00 até 23h00
  const inicioTarde = 15 * 60;      // 900
  const fimTarde = 23 * 60;         // 1380

  const dentroDaMadrugada = agoraMinutos >= inicioMadrugada && agoraMinutos < fimMadrugada;
  const dentroDaManha = agoraMinutos >= inicioManha && agoraMinutos < fimManha;
  const dentroDaTarde = agoraMinutos >= inicioTarde && agoraMinutos < fimTarde;

  return dentroDaMadrugada || dentroDaManha || dentroDaTarde;
}



onSnapshot(lojaDocRef, (docSnap) => {
  const dados = docSnap.data();
  if (!dados) {
    console.warn("Documento 'loja' não encontrado.");
    return;
  }

  const status = dados.status;
  const aviso = document.getElementById("tela-fechada");

  if (!aviso) {
    console.warn("Elemento #tela-fechada não encontrado no HTML.");
    return;
  }

  const mostrarAviso = !dentroDoHorarioDeFuncionamento() || status === "fechada";

  aviso.style.display = mostrarAviso ? "flex" : "none";

  document.body.querySelectorAll('main, header, footer, .cardapio, .container, .outros-elementos').forEach(el => {
    if (el) el.style.display = mostrarAviso ? 'none' : 'block';
  });
});


carregarProdutos();
calcularTaxaDeEntrega();
