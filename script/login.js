const usuarioCorreto = "admin";
const senhaCorreta = "1234";

function fazerLogin() {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;

  if (usuario === usuarioCorreto && senha === senhaCorreta) {
    document.getElementById("tela-login").style.display = "none";
    document.getElementById("painel-admin").style.display = "block";
  } else {
    document.getElementById("erro-login").innerText = "Usuário ou senha incorretos!";
  }
}

function fazerLogout() {
  document.getElementById("tela-login").style.display = "block";
  document.getElementById("painel-admin").style.display = "none";
  document.getElementById("usuario").value = "";
  document.getElementById("senha").value = "";
  document.getElementById("erro-login").innerText = "";
}