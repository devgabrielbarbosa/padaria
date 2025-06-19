import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAyY14CV-ODcWMSD4tdGkGzh0HlZr_8KvY",
  authDomain: "lanchonete-lj.firebaseapp.com",
  projectId: "lanchonete-lj",
  storageBucket: "lanchonete-lj.appspot.com",
  messagingSenderId: "939172982803",
  appId: "1:939172982803:web:9695ada6d98d4fed858fe6"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let idEditando = null;
let todosProdutos = [];

const uploadImageToImgBB = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("https://api.imgbb.com/1/upload?key=5633d7932b72210c398e734ddbc2d8ea", {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  if (data.success) {
    return data.data.url;
  } else {
    throw new Error("Erro no upload da imagem");
  }
};

const imagemInput = document.getElementById("imagem");
imagemInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const preview = document.getElementById("imagem-preview");
  if (file && preview) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
  }
});

window.adicionarProduto = async () => {
  const nome = document.getElementById("nome").value.trim();
  const preco = parseFloat(document.getElementById("preco").value);
  const categoria = document.getElementById("categoria").value;
  const descricao = document.getElementById("descricao").value.trim();
  const imagemFile = imagemInput.files[0];

  if (!nome || isNaN(preco)) {
    alert("Preencha o nome e o preço corretamente.");
    return;
  }

  let imagemUrl = "";

  if (imagemFile) {
    try {
      imagemUrl = await uploadImageToImgBB(imagemFile);
    } catch (erro) {
      alert("Erro ao enviar imagem: " + erro.message);
      return;
    }
  }

  salvarProduto(imagemUrl);
};
async function salvarProduto(imagemUrl) {
  const nome = document.getElementById("nome").value.trim();
  const preco = parseFloat(document.getElementById("preco").value);
  const categoria = document.getElementById("categoria").value;
  const descricao = document.getElementById("descricao").value.trim();

  let dados = {
    nome,
    preco,
    categoria,
    descricao,
    ativo: true
  };

  if (imagemUrl) {
    dados.imagem = imagemUrl;
  }

  if (idEditando) {
    // Primeiro busca o documento atual
    const docRef = doc(db, "produtos", idEditando);
    const docSnap = await getDoc(docRef);
    const produtoAtual = docSnap.data();

    // Se imagemUrl não veio, mantém a imagem antiga
    if (!imagemUrl) {
      dados.imagem = produtoAtual.imagem;
    }

    await updateDoc(docRef, dados);
  } else {
    // Para novo produto, imagem sempre deve vir
    dados.imagem = imagemUrl;
    await addDoc(collection(db, "produtos"), dados);
    alert("Produto adicionado com sucesso!");
  }

  limparCampos();
}


function limparCampos() {
  document.getElementById("nome").value = "";
  document.getElementById("preco").value = "";
  document.getElementById("categoria").value = "";
  document.getElementById("descricao").value = "";
  document.getElementById("imagem").value = "";
  document.getElementById("imagem-preview").style.display = "none";
  document.getElementById("btn-salvar").textContent = "Salvar Produto";
  idEditando = null;
}

onSnapshot(collection(db, "produtos"), (snapshot) => {
  todosProdutos = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    todosProdutos.push({ id: docSnap.id, ...data });
  });
  renderizarProdutos(todosProdutos);
});
 // Função para filtrar os produtos por nome e categoria
 window.filtrarProdutos = () => {
    const termo = document.getElementById("busca-produto").value.toLowerCase();
    const categoria = document.getElementById("filtro-categoria").value;
  
    // Filtra os produtos de acordo com o nome e categoria
    const filtrados = todosProdutos.filter((produto) => {
        const nomeMatch = produto.nome.toLowerCase().includes(termo);
        const categoriaMatch = categoria === "" || produto.categoria === categoria;
        return nomeMatch && categoriaMatch;
      });
  
    // Re-renderiza a lista de produtos filtrados
    renderizarProdutos(filtrados);
  };
  
  
// Função para desativar todos os produtos filtrados
window.desativarFiltrados = () => {
    const termo = document.getElementById("busca-produto").value.toLowerCase();
    const categoria = document.getElementById("filtro-categoria").value;
  
    // Filtra os produtos de acordo com os termos de busca e categoria
    const filtrados = todosProdutos.filter((produto) => {
      const nomeMatch = produto.nome.toLowerCase().includes(termo);
      const categoriaMatch = categoria === "" || produto.categoria === categoria ;
      return nomeMatch && categoriaMatch;
    });
  
    // Desativa todos os produtos filtrados
    filtrados.forEach(async (produto) => {
      await updateDoc(doc(db, "produtos", produto.id), { ativo: false });
    });
  
    // Re-renderiza a lista de produtos após a desativação
    renderizarProdutos(todosProdutos);
  };
  window.ativarFiltrados = () => {
    const termo = document.getElementById("busca-produto").value.toLowerCase();
    const categoria = document.getElementById("filtro-categoria").value;
  
    // Filtra os produtos de acordo com o nome e categoria
    const filtrados = todosProdutos.filter((produto) => {
      const nomeMatch = produto.nome.toLowerCase().includes(termo);
      const categoriaMatch = categoria === "" || produto.categoria === categoria;
      return nomeMatch && categoriaMatch;
    });
  
    // Ativa todos os produtos filtrados
    filtrados.forEach(async (produto) => {
      await updateDoc(doc(db, "produtos", produto.id), { ativo: true });
    });
  
    // Re-renderiza a lista de produtos após a ativação
    renderizarProdutos(todosProdutos);
  };
  
  

  // Função para renderizar os produtos na tela
  function renderizarProdutos(produtos) {
    const lista = document.getElementById("lista-produtos");
    lista.innerHTML = "<h2 style='color:#60a5fa;'>Produtos Cadastrados</h2>";
  
    if (produtos.length === 0) {
      lista.innerHTML += "<p>Nenhum produto encontrado.</p>";
    }
  
    produtos.forEach((data) => {
      const id = data.id;
  
      const container = document.createElement("div");
      container.className = "produto";
      container.innerHTML = `
        <div class="detalhes-produto">
          <h3>${data.nome} - R$${parseFloat(data.preco).toFixed(2)}</h3>
          <p><strong>Categoria:</strong>${data.categoria === "combo" ? "🍕🥤 Combo" : data.categoria}</p>
          <p><strong>Descrição:</strong> ${data.descricao}</p>
          <p><strong>Status:</strong> ${data.ativo ? "✅ Ativo" : "❌ Inativo"}</p>
          ${data.imagem ? `<img src="${data.imagem}" alt="Imagem do produto">` : ""}
        </div>
      `;
  
      const btnAtivar = document.createElement("button");
      btnAtivar.textContent = data.ativo ? "Desativar" : "Ativar";
      btnAtivar.onclick = () => {
        updateDoc(doc(db, "produtos", id), { ativo: !data.ativo });
      };
  
      const btnEditar = document.createElement("button");
      btnEditar.textContent = "Editar";
      btnEditar.style.backgroundColor = "#facc15";
      btnEditar.style.color = "#000";
      btnEditar.onclick = () => {
        document.getElementById("nome").value = data.nome;
        document.getElementById("preco").value = data.preco;
        document.getElementById("categoria").value = data.categoria;
        document.getElementById("descricao").value = data.descricao;
        document.getElementById("imagem").value = "";  
        document.getElementById("imagem-preview").style.display = "none";
        idEditando = id;
        document.getElementById("btn-salvar").textContent = "Atualizar Produto";
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
  
      const btnExcluir = document.createElement("button");
      btnExcluir.textContent = "Excluir";
      btnExcluir.style.backgroundColor = "#ef4444";
      btnExcluir.onclick = () => {
        if (confirm(`Deseja excluir "${data.nome}"?`)) {
          deleteDoc(doc(db, "produtos", id));
        }
      };
  
      container.appendChild(btnAtivar);
      container.appendChild(btnEditar);
      container.appendChild(btnExcluir);
      lista.appendChild(container);
    });
  }

  // Alterando o onSnapshot para filtrar no momento do carregamento
onSnapshot(collection(db, "produtos"), (snapshot) => {
    todosProdutos = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      todosProdutos.push({ id: docSnap.id, ...data });
    });
  
    // Filtra e renderiza os produtos após a captura
    filtrarProdutos();
  });