let carrinho = [];
let taxaDeEntrega = 0;

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
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

window.abrirModal = function () {
  document.getElementById('modal').style.display = 'block';
  document.getElementById('modal-overlay').style.display = 'block';
  calcularTaxaDeEntrega();
};

window.fecharModal = function () {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
};

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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

      const lojaLat =  -7.1954965;
      const lojaLng =  -48.1993776 ;

      const distancia = calcularDistancia(userLat, userLng, lojaLat, lojaLng);

       if (distancia <= 3) {
        taxaDeEntrega = 0;
      } else if (distancia <= 7) {
        taxaDeEntrega = 5;
      } else if (distancia <= 10) {
        taxaDeEntrega = 12;
      } else if (distancia <= 50) {
        taxaDeEntrega = 17;
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

  total += taxaDeEntrega;
  totalModal.textContent = total.toFixed(2);
  qtdItens.textContent = carrinho.length;
}

window.finalizarPedido = async function () {
  const nomeCliente = document.getElementById("nome-cliente-modal").value;
  const observacoes = document.getElementById("observacoes-modal").value;

  if (!nomeCliente) {
    alert("Por favor, informe seu nome.");
    return;
  }

  const resumo = carrinho
    .map((item) => `${item.quantidade} x ${item.nome} (R$ ${item.preco.toFixed(2)})`)
    .join(", ");
  const total = document.getElementById("total-modal").textContent;
  const textoPedido = `Olá o meu nome é ${nomeCliente} e gostaria de fazer um pedido:\n${resumo}\nObservações: ${observacoes}\nTaxa de entrega: R$ ${taxaDeEntrega.toFixed(2)}\nTotal: R$ ${total}`;

  document.getElementById("resumo-nome").textContent = `Pedido ${nomeCliente}:`;
  document.getElementById("resumo-produtos").innerHTML = carrinho.map(
    (item) => `<li>${item.quantidade} x ${item.nome} (R$ ${item.preco.toFixed(2)})</li>`).join("");
  document.getElementById("resumo-taxa").textContent = taxaDeEntrega.toFixed(2);
  document.getElementById("resumo-observacoes").textContent = observacoes;
  document.getElementById("resumo-total").textContent = total;

  document.getElementById("carregando").style.display = "block";

  html2canvas(document.getElementById("resumo-pedido")).then(async (canvas) => {
    const imagemBase64 = canvas.toDataURL("image/png").split(',')[1];

    const formData = new FormData();
    formData.append("image", imagemBase64);

    try {
      const response = await fetch("https://api.imgbb.com/1/upload?key=5633d7932b72210c398e734ddbc2d8ea", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      const imagemURL = result.data.url;

      const textoWhatsApp = encodeURIComponent(`${textoPedido}\nImagem do pedido: ${imagemURL}`);
      const numero = "5563991300213"; // Número de WhatsApp do vendedor
      const link = `https://wa.me/${numero}?text=${textoWhatsApp}`;

      window.open(link, "_blank");
      carrinho = [];
      atualizarCarrinho();
      fecharModal();

    } catch (err) {
      console.error("Erro ao enviar imagem:", err);
      alert("Erro ao finalizar o pedido. Tente novamente.");
    } finally {
      document.getElementById("carregando").style.display = "none";
    }
  });
};
window.limparCarrinho = function() {
  // Limpa o carrinho no localStorage
  localStorage.removeItem('carrinho');

  // Atualiza a interface do carrinho (caso tenha uma função para isso)
  const carrinho = [];
  atualizarCarrinho(carrinho);

  // Limpa o conteúdo do modal
  const modalCarrinho = document.querySelector('#modal-carrinho');
  if (modalCarrinho) {
    modalCarrinho.innerHTML = ''; // Remove todos os itens dentro do modal
  }

  // Limpar os campos de nome e outros campos dentro do modal (caso necessário)
  const nomeCliente = document.querySelector('#nome-cliente'); // Ajuste o seletor conforme o seu código
  if (nomeCliente) {
    nomeCliente.value = ''; // Limpa o campo de nome do cliente
  }

  // Caso haja uma lista de pedidos ou informações dentro do modal, você pode limpá-las
  const listaPedidos = document.querySelector('#pedido-lista'); // Ajuste o seletor conforme necessário
  if (listaPedidos) {
    listaPedidos.innerHTML = ''; // Limpa os pedidos listados no modal
  }

  //  Alterar o total do pedido 
  const totalModal = document.querySelector('#total-modal');
  if (totalModal) {
    totalModal.textContent = 'R$ 0,00'; // Reseta o total para zero
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


carregarProdutos();
calcularTaxaDeEntrega();
