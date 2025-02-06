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
