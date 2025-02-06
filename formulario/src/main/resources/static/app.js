// ----------- CAPTURA DE ASSINATURA -----------
// Obtém o canvas e o contexto
const assinaturaCanvas = document.getElementById("assinatura");
const ctx = assinaturaCanvas.getContext("2d");
let desenhando = false;

// Ajustes visuais da assinatura
ctx.lineWidth = 3;
ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.strokeStyle = "#333";

// Funções para desenhar
const startDrawing = (x, y) => {
    desenhando = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
};

const draw = (x, y) => {
    if (desenhando) {
        ctx.lineTo(x, y);
        ctx.stroke();
    }
};

const stopDrawing = () => {
    desenhando = false;
};

// Eventos para desktop (mouse)
assinaturaCanvas.addEventListener("mousedown", (e) => {
    startDrawing(e.offsetX, e.offsetY);
});

assinaturaCanvas.addEventListener("mousemove", (e) => {
    if (desenhando) {
        draw(e.offsetX, e.offsetY);
    }
});

assinaturaCanvas.addEventListener("mouseup", stopDrawing);
assinaturaCanvas.addEventListener("mouseleave", stopDrawing);

// Eventos para dispositivos móveis (toque)
assinaturaCanvas.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Evita o comportamento de rolagem
    let touch = e.touches[0];
    let rect = assinaturaCanvas.getBoundingClientRect();
    startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
});

assinaturaCanvas.addEventListener("touchmove", (e) => {
    if (desenhando) {
        let touch = e.touches[0];
        let rect = assinaturaCanvas.getBoundingClientRect();
        draw(touch.clientX - rect.left, touch.clientY - rect.top);
    }
    e.preventDefault(); // Evita rolagem da tela
});

assinaturaCanvas.addEventListener("touchend", stopDrawing);

// Melhorando a experiência no iPhone
assinaturaCanvas.style.touchAction = "none";

// Função para limpar a assinatura
function limparAssinatura() {
    ctx.clearRect(0, 0, assinaturaCanvas.width, assinaturaCanvas.height);
}

// ----------- CAPTURA DE FOTO -----------
// Configura o canvas para foto
const video = document.getElementById("video");
const fotoCanvas = document.getElementById("fotoCanvas");
const fotoCtx = fotoCanvas.getContext("2d");

// Ajusta o tamanho do canvas da foto
fotoCanvas.width = 400;
fotoCanvas.height = 300;

// Ativar a câmera
navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then((stream) => video.srcObject = stream)
    .catch((err) => console.error("Erro ao acessar a câmera: ", err));

// Função para tirar a foto
function tirarFoto() {
    fotoCtx.drawImage(video, 0, 0, fotoCanvas.width, fotoCanvas.height);
    alert("Foto capturada com sucesso!");
}

// Limpar foto
function limparFoto() {
    fotoCtx.clearRect(0, 0, fotoCanvas.width, fotoCanvas.height);
}

// ----------- ENVIO DOS DADOS -----------
// Função para enviar os dados para o servidor
function enviarDados() {
    const nome = document.getElementById("nome").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const expositor = document.getElementById("expositor").value.trim();
    const rua = document.getElementById("rua").value.trim();

    // Validação aprimorada
    if (!nome || !cpf || !expositor || !rua) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

    if (!/^\d{11}$/.test(cpf)) {
        alert("CPF inválido. Insira 11 números.");
        return;
    }

    // Captura as imagens como Base64
    const assinaturaBase64 = assinaturaCanvas.toDataURL("image/png");
    const fotoBase64 = fotoCanvas.toDataURL("image/png");

    // Dados para envio
    const dados = {
        nome,
        cpf,
        expositor,
        rua,
        assinatura: assinaturaBase64,
        foto: fotoBase64,
        timestamp: new Date().toISOString(), // Adiciona timestamp
        userAgent: navigator.userAgent, // Captura informações do navegador
        ip: "" // Campo para backend preencher com IP do usuário
    };

    // Envio para o backend
    fetch("/api/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    })
        .then(response => {
            if (!response.ok) throw new Error("Erro ao enviar os dados.");
            return response.text();
        })
        .then(data => {
            console.log("Resposta do servidor:", data);
            const mensagem = `Dados do Formulário:\nNome: ${nome}\nCPF: ${cpf}\nExpositor: ${expositor}\nRua: ${rua}`;
            const numeroDestino = "5511980534827";
            const url = `https://wa.me/${numeroDestino}?text=${encodeURIComponent(mensagem)}`;
            window.open(url, "_blank");
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Ocorreu um erro ao enviar os dados. Tente novamente.");
        });
}

// ----------- MELHORIAS ADICIONAIS -----------

// 1. Aumentar o limite de desenho da assinatura para suportar telas menores
assinaturaCanvas.width = window.innerWidth * 0.9; // Ajusta a largura conforme a largura da tela

// 2. Ajustar o tamanho da imagem da assinatura conforme a tela
assinaturaCanvas.height = 150; // Ajuste automático para tamanhos pequenos

// 3. Prevenir a duplicação do clique para o envio dos dados
let enviando = false;

function enviarDadosSeguros() {
    if (enviando) return;
    enviando = true;
    enviarDados();
}

// 4. Ajustar o design do botão "Enviar" para garantir que ele esteja sempre visível
const botaoEnviar = document.getElementById("botaoEnviar");
botaoEnviar.style.position = "fixed";
botaoEnviar.style.bottom = "10px";
botaoEnviar.style.right = "10px";

// 5. Verificar se o navegador é compatível antes de acessar a câmera
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Seu navegador não suporta acesso à câmera.");
}

// 6. Melhorar a performance ao limpar o canvas da foto e assinatura
function limparCanvas(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 7. Adicionar feedback visual para o usuário ao capturar foto
function feedbackFoto() {
    const feedbackElement = document.getElementById("feedbackFoto");
    feedbackElement.innerText = "Foto capturada com sucesso!";
    setTimeout(() => feedbackElement.innerText = "", 3000);
}

// 8. Validar o CPF em tempo real enquanto o usuário digita
document.getElementById("cpf").addEventListener("input", function () {
    const cpf = this.value;
    if (!/^\d{11}$/.test(cpf)) {
        this.setCustomValidity("CPF inválido. Insira 11 números.");
    } else {
        this.setCustomValidity("");
    }
});

// 9. Melhorar a responsividade no iPhone com ajuste automático do canvas de assinatura
if (navigator.userAgent.match(/iPhone/)) {
    assinaturaCanvas.style.width = "100%";
    assinaturaCanvas.style.height = "auto";
}

// 10. Salvar automaticamente os dados do formulário em localStorage para prevenir perda de dados
window.addEventListener("beforeunload", function () {
    const dadosFormulario = {
        nome: document.getElementById("nome").value,
        cpf: document.getElementById("cpf").value,
        expositor: document.getElementById("expositor").value,
        rua: document.getElementById("rua").value,
    };
    localStorage.setItem("dadosFormulario", JSON.stringify(dadosFormulario));
});

// 11. Preencher automaticamente os dados do formulário a partir do localStorage
window.addEventListener("load", function () {
    const dadosFormulario = JSON.parse(localStorage.getItem("dadosFormulario"));
    if (dadosFormulario) {
        document.getElementById("nome").value = dadosFormulario.nome;
        document.getElementById("cpf").value = dadosFormulario.cpf;
        document.getElementById("expositor").value = dadosFormulario.expositor;
        document.getElementById("rua").value = dadosFormulario.rua;
    }
});

// 12. Exibir mensagem de confirmação antes de enviar os dados
function confirmarEnvio() {
    if (confirm("Você tem certeza que deseja enviar os dados?")) {
        enviarDadosSeguros();
    }
}

// 13. Limitar o tamanho máximo da foto para evitar sobrecarga no servidor
const MAX_FOTO_SIZE = 2 * 1024 * 1024; // 2 MB
fotoCanvas.addEventListener("change", function () {
    const fotoData = fotoCanvas.toDataURL("image/png");
    if (fotoData.length > MAX_FOTO_SIZE) {
        alert("A foto capturada é muito grande. Por favor, tente novamente.");
    }
});

// 14. Manter o estado de carregamento durante o envio
function carregarEnvio() {
    const loadingElement = document.getElementById("loading");
    loadingElement.style.display = "block";
}

// 15. Remover estado de carregamento após o envio
function finalizarEnvio() {
    const loadingElement = document.getElementById("loading");
    loadingElement.style.display = "none";
}

// 16. Melhorar a compatibilidade com Android, garantindo que o botão "Enviar" seja visível
botaoEnviar.style.zIndex = "1000";

// 17. Garantir que a tela de captura de assinatura tenha um fundo branco
assinaturaCanvas.style.backgroundColor = "white";

// 18. Desabilitar o envio enquanto há dados pendentes
function desabilitarEnvio() {
    botaoEnviar.disabled = true;
}

// 19. Melhorar a navegação com a adição de atalhos de teclado
document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        confirmarEnvio();
    }
});

// 20. Fornecer uma visualização de dados antes do envio
function visualizarDados() {
    const nome = document.getElementById("nome").value;
    const cpf = document.getElementById("cpf").value;
    const expositor = document.getElementById("expositor").value;
    const rua = document.getElementById("rua").value;
    const preview = `Nome: ${nome}\nCPF: ${cpf}\nExpositor: ${expositor}\nRua: ${rua}`;
    alert("Dados a serem enviados:\n" + preview);
}
