// ----------- CAPTURA DE ASSINATURA -----------
const assinaturaCanvas = document.getElementById("assinatura");
const ctx = assinaturaCanvas.getContext("2d");
let desenhando = false;

// Melhorias visuais da assinatura
ctx.lineWidth = 3;
ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.strokeStyle = "#333";

// Eventos de mouse
assinaturaCanvas.addEventListener("mousedown", (e) => {
    desenhando = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

assinaturaCanvas.addEventListener("mousemove", (e) => {
    if (desenhando) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
});

assinaturaCanvas.addEventListener("mouseup", () => desenhando = false);
assinaturaCanvas.addEventListener("mouseleave", () => desenhando = false);

// Eventos de toque (celulares)
assinaturaCanvas.addEventListener("touchstart", (e) => {
    desenhando = true;
    let touch = e.touches[0];
    let rect = assinaturaCanvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
});

assinaturaCanvas.addEventListener("touchmove", (e) => {
    if (desenhando) {
        let touch = e.touches[0];
        let rect = assinaturaCanvas.getBoundingClientRect();
        ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
        ctx.stroke();
    }
    e.preventDefault(); // Evita rolagem da tela ao assinar
});

assinaturaCanvas.addEventListener("touchend", () => desenhando = false);

// Melhor experiência no iPhone
assinaturaCanvas.style.touchAction = "none";

// Função para limpar a assinatura
function limparAssinatura() {
    ctx.clearRect(0, 0, assinaturaCanvas.width, assinaturaCanvas.height);
}

// ----------- CAPTURA DE FOTO -----------
const video = document.getElementById("video");
const fotoCanvas = document.getElementById("fotoCanvas");
const fotoCtx = fotoCanvas.getContext("2d");

// Ajusta o tamanho do canvas da foto
fotoCanvas.width = 400;
fotoCanvas.height = 300;

// Ativar câmera
navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then((stream) => video.srcObject = stream)
    .catch((err) => console.error("Erro ao acessar a câmera: ", err));

// Tirar foto
function tirarFoto() {
    fotoCtx.drawImage(video, 0, 0, fotoCanvas.width, fotoCanvas.height);
    alert("Foto capturada com sucesso!");
}

// Limpar foto
function limparFoto() {
    fotoCtx.clearRect(0, 0, fotoCanvas.width, fotoCanvas.height);
}

// ----------- ENVIO DOS DADOS -----------
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

    // Captura a assinatura como imagem Base64
    const assinaturaBase64 = assinaturaCanvas.toDataURL("image/png");

    // Captura a foto como imagem Base64
    const fotoBase64 = fotoCanvas.toDataURL("image/png");

    const dados = {
        nome,
        cpf,
        expositor,
        rua,
        assinatura: assinaturaBase64,
        foto: fotoBase64,
        timestamp: new Date().toISOString(), // Adiciona timestamp para rastreamento
        userAgent: navigator.userAgent, // Captura informações do navegador para debug
        ip: "" // Campo para backend preencher com IP do usuário
    };

    // Enviar para o backend
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
