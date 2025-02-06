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

// Função para obter a posição do toque ou do mouse (ajustado para dispositivos móveis e desktop)
const getPosition = (e) => {
    let rect = assinaturaCanvas.getBoundingClientRect();
    if (e.touches) {
        // Para toque em dispositivos móveis
        return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    } else {
        // Para desktop (mouse)
        return { x: e.offsetX, y: e.offsetY };
    }
};

// Função para ajustar o tamanho do canvas
function ajustarTamanhoCanvas() {
    const popUp = document.getElementById("popup-assinatura");
    const canvas = document.getElementById("assinatura");

    const largura = window.innerWidth * 0.9; // 90% da largura da tela
    const altura = window.innerHeight * 0.6; // 60% da altura da tela

    canvas.width = largura;
    canvas.height = altura;
}

// Chama a função ao abrir o pop-up
function abrirPopUpAssinatura() {
    ajustarTamanhoCanvas();
    const popUp = document.getElementById("popup-assinatura");
    popUp.style.visibility = "visible"; // Exibe o pop-up
    popUp.style.opacity = "1"; // Animação suave
}

// Função para fechar o pop-up da assinatura
function fecharPopUpAssinatura() {
    const popUp = document.getElementById("popup-assinatura");
    popUp.style.opacity = "0"; // Animação suave para ocultar
    setTimeout(() => {
        popUp.style.visibility = "hidden"; // Oculta após animação
    }, 300); // Tempo da animação
}

// Adiciona a verificação de suporte ao Canvas
if (!document.createElement('canvas').getContext) {
    alert("Seu navegador não suporta a funcionalidade de assinatura!");
    return;
}

// Melhorando a experiência no iPhone
assinaturaCanvas.style.touchAction = "none";

// Eventos para desktop (mouse)
assinaturaCanvas.addEventListener("mousedown", (e) => {
    const { x, y } = getPosition(e);
    startDrawing(x, y);
});

assinaturaCanvas.addEventListener("mousemove", (e) => {
    if (desenhando) {
        const { x, y } = getPosition(e);
        draw(x, y);
    }
});

assinaturaCanvas.addEventListener("mouseup", stopDrawing);
assinaturaCanvas.addEventListener("mouseleave", stopDrawing);

// Eventos para dispositivos móveis (toque)
assinaturaCanvas.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Evita o comportamento de rolagem
    const { x, y } = getPosition(e);
    startDrawing(x, y);
});

assinaturaCanvas.addEventListener("touchmove", (e) => {
    e.preventDefault(); // Evita rolagem da tela
    if (desenhando) {
        const { x, y } = getPosition(e);
        draw(x, y);
    }
});

assinaturaCanvas.addEventListener("touchend", stopDrawing);
assinaturaCanvas.addEventListener("touchcancel", stopDrawing);

// Evento para a mudança de orientação da tela (dispositivos móveis)
window.addEventListener("orientationchange", () => {
    ajustarTamanhoCanvas();
});

// Função para limpar a assinatura
function limparAssinatura() {
    ctx.clearRect(0, 0, assinaturaCanvas.width, assinaturaCanvas.height);
}

// Função para salvar a assinatura em uma imagem
function salvarAssinatura() {
    const dataUrl = assinaturaCanvas.toDataURL("image/png");
    // Aqui, você pode fazer algo com a imagem, como enviá-la para o servidor ou permitir que o usuário faça o download
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

    // Função para gerar a mensagem do WhatsApp
    const gerarMensagem = () => {
        // Verifica se os dados são válidos e cria a mensagem
        const mensagem = `Dados do Formulário:\nNome: ${nome || 'Não informado'}\nCPF: ${cpf || 'Não informado'}\nExpositor: ${expositor || 'Não informado'}\nRua: ${rua || 'Não informado'}`;

        return mensagem;
    }

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

            // Gerar a mensagem com os dados
            const mensagem = gerarMensagem();

            // Verifique o número do WhatsApp
            const numeroDestino = "5511980534827";

            // Crie a URL para abrir o WhatsApp com a mensagem
            const url = `https://wa.me/${numeroDestino}?text=${encodeURIComponent(mensagem)}`;

            // Abre o link em uma nova aba
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

document.getElementById("botaoLimpar").addEventListener("click", () => limparCanvas(assinaturaCanvas, ctx));
