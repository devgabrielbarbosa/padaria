# 🧁 Sistema Completo para Padaria

Projeto completo de um sistema de pedidos online para a padaria **Lanches da LJ**, desenvolvido com **HTML, CSS e JavaScript puro**, integrado ao **Firebase
(Firestore e Storage)** e APIs externas.

O sistema é dividido em dois sites independentes:

- 👨‍👩‍👧‍👦 **Site do Cliente:** onde os usuários visualizam os produtos, adicionam ao carrinho, finalizam o pedido e enviam pelo WhatsApp.
- 🛠️ **Painel Administrativo:** onde a padaria gerencia os produtos (CRUD), imagens, ativação/desativação e categorias.

---

## 🔗 Acesse o Projeto

- 🚀 [Site do Cliente (Pedidos)](https://devgabrielbarbosa.github.io/lanches/cliente/)
- 🔐 [Painel Administrativo (Admin)](https://devgabrielbarbosa.github.io/lanches/admin/)

---

## 🛠️ Funcionalidades

### 👨‍🍳 Cliente
- Visualização de produtos por categoria
- Carrinho de compras com ajuste de quantidades
- Campo de nome e observações para o pedido
- Envio do pedido via WhatsApp
- Upload de comprovante de pagamento com preview
- Geração de imagem do pedido para reduzir fraudes
- Cálculo automático da taxa de entrega via geolocalização
- Layout moderno com modo escuro

### 🧑‍💼 Painel Administrativo
- Adição, edição e exclusão de produtos
- Upload de imagem do produto (Firebase Storage)
- Ativar ou desativar produtos do catálogo
- Filtro por categoria
- Interface com abas e modo escuro
  
---

## 🔧 Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla)
- Firebase Firestore (Banco de dados)
- Firebase Storage (Imagens)
- Firebase Authentication
- API ImgBB (upload externo)
- Geolocation API
- WhatsApp API (redirecionamento)
- localStorage (para persistência de carrinho)

---

## 📁 Estrutura do Projeto

```plaintext
📁 /assets          → Imagens e ícones
📁 /css             → Estilos separados para cliente e admin
📁 /script          → Scripts JavaScript do cliente e admin
📁 /cliente/📄 cliente.html      → Página do cliente
📁 /admin/📄 admin.html     → Painel administrativo
