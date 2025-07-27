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
  setDoc,
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

window.addEventListener("DOMContentLoaded", () => {
  const statusSelect = document.getElementById("statusLoja");
  const imagemInput = document.getElementById("imagem");

  // Função para upload de imagem para ImgBB
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

  imagemInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById("imagem-preview");
    if (file && preview) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
    }
  });

  // Referência do documento que guarda o status da loja
  const lojaDocRef = doc(db, "configuracoes", "loja");

  // Função para carregar status da loja do Firestore
  async function carregarStatusLoja() {
    const docSnap = await getDoc(lojaDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.status) {
        statusSelect.value = data.status;
      }
    } else {
      // Se não existir, cria com status padrão "aberta"
      await setDoc(lojaDocRef, { status: "aberta" });
      statusSelect.value = "aberta";
    }
  }

  carregarStatusLoja();

  // Atualizar status no Firestore quando o select mudar
  statusSelect.addEventListener("change", async () => {
    const novoStatus = statusSelect.value;
    try {
      await updateDoc(lojaDocRef, { status: novoStatus });
      alert(`Status da loja atualizado para: ${novoStatus}`);
    } catch (erro) {
      alert("Erro ao atualizar status da loja: " + erro.message);
    }
  });

  // Adicionar ou atualizar produto
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
      const docRef = doc(db, "produtos", idEditando);
      const docSnap = await getDoc(docRef);
      const produtoAtual = docSnap.data();

      if (!imagemUrl) {
        dados.imagem = produtoAtual.imagem;
      }

      await updateDoc(docRef, dados);
      alert("Produto atualizado com sucesso!");
    } else {
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

  // Filtrar produtos (nome e categoria)
  window.filtrarProdutos = () => {
    const termo = document.getElementById("busca-produto").value.toLowerCase();
    const categoria = document.getElementById("filtro-categoria").value;

    const filtrados = todosProdutos.filter((produto) => {
      const nomeMatch = produto.nome.toLowerCase().includes(termo);
      const categoriaMatch = categoria === "" || produto.categoria === categoria;
      return nomeMatch && categoriaMatch;
    });

    renderizarProdutos(filtrados);
  };

  // Desativar produtos filtrados
  window.desativarFiltrados = () => {
    const termo = document.getElementById("busca-produto").value.toLowerCase();
    const categoria = document.getElementById("filtro-categoria").value;

    const filtrados = todosProdutos.filter((produto) => {
      const nomeMatch = produto.nome.toLowerCase().includes(termo);
      const categoriaMatch = categoria === "" || produto.categoria === categoria;
      return nomeMatch && categoriaMatch;
    });

    filtrados.forEach(async (produto) => {
      await updateDoc(doc(db, "produtos", produto.id), { ativo: false });
    });

    renderizarProdutos(todosProdutos);
  };

  // Ativar produtos filtrados
  window.ativarFiltrados = () => {
    const termo = document.getElementById("busca-produto").value.toLowerCase();
    const categoria = document.getElementById("filtro-categoria").value;

    const filtrados = todosProdutos.filter((produto) => {
      const nomeMatch = produto.nome.toLowerCase().includes(termo);
      const categoriaMatch = categoria === "" || produto.categoria === categoria;
      return nomeMatch && categoriaMatch;
    });

    filtrados.forEach(async (produto) => {
      await updateDoc(doc(db, "produtos", produto.id), { ativo: true });
    });

    renderizarProdutos(todosProdutos);
  };

  // Desativar produto único
  window.desativarProduto = async (id) => {
    const produtoRef = doc(db, "produtos", id);
    await updateDoc(produtoRef, { ativo: false });
  };

  // Excluir produto
  window.excluirProduto = async (id) => {
    if (confirm("Confirma exclusão do produto?")) {
      await deleteDoc(doc(db, "produtos", id));
    }
  };

  // Renderizar lista de produtos
  function renderizarProdutos(produtos) {
    const lista = document.getElementById("lista-produtos");
    lista.innerHTML = "";

    if (produtos.length === 0) {
      lista.innerHTML += "<p>Nenhum produto encontrado.</p>";
    }

    produtos.forEach((data) => {
      const id = data.id;

      const container = document.createElement("div");
      container.className = "produto";
      container.innerHTML = `
        <div class="detalhes-produto">
          ${data.imagem ? `<img src="${data.imagem}" alt="Imagem do produto">` : `<div style="width: 90px; height: 90px; background:#eee; border-radius:8px; margin-right:15px;"></div>`}
          <div class="conteudo">
            <h3>${data.nome} - R$${parseFloat(data.preco).toFixed(2)}</h3>
            <p><strong>Categoria:</strong> ${data.categoria === "combo" ? "🍕🥤 Combo" : data.categoria}</p>
            <p><strong>Descrição:</strong> ${data.descricao}</p>
            <p><strong>Status:</strong> ${data.ativo ? "✅ Ativo" : "❌ Inativo"}</p>
          </div>
          <div class="botoes"></div>
        </div>
      `;

      const botoesDiv = container.querySelector(".botoes");

      // Botão Ativar/Desativar
      const btnAtivarDesativar = document.createElement("button");
      btnAtivarDesativar.textContent = data.ativo ? "Desativar" : "Ativar";
      btnAtivarDesativar.style.backgroundColor = data.ativo ? "#ef4444" : "#10b981";
      btnAtivarDesativar.onclick = async () => {
        await updateDoc(doc(db, "produtos", id), { ativo: !data.ativo });
      };
      botoesDiv.appendChild(btnAtivarDesativar);

      // Botão Editar
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
      botoesDiv.appendChild(btnEditar);

      // Botão Excluir
      const btnExcluir = document.createElement("button");
      btnExcluir.textContent = "Excluir";
      btnExcluir.style.backgroundColor = "#ef4444";
      btnExcluir.onclick = async () => {
        if (confirm(`Deseja excluir "${data.nome}"?`)) {
          await deleteDoc(doc(db, "produtos", id));
        }
      };
      botoesDiv.appendChild(btnExcluir);

      lista.appendChild(container);
    });
  }

  // Escuta mudanças em produtos e atualiza a lista
  onSnapshot(collection(db, "produtos"), (snapshot) => {
    todosProdutos = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      todosProdutos.push({ id: docSnap.id, ...data });
    });

    filtrarProdutos();
  });
});

