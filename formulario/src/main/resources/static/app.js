// ----------- CAPTURA DE ASSINATURA -----------

const assinaturaCanvas = document.getElementById("assinatura");
const ctx = assinaturaCanvas.getContext("2d");
let desenhando = false;

ctx.lineWidth = 3;
ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.strokeStyle = "#333";

// Ajusta o tamanho do canvas conforme a tela
function ajustarTamanhoCanvas() {
    const largura = Math.min(window.innerWidth * 0.9, 500);
    assinaturaCanvas.width = largura;
    assinaturaCanvas.height = 150;
}

window.addEventListener("load", ajustarTamanhoCanvas);
window.addEventListener("resize", ajustarTamanhoCanvas);
window.addEventListener("orientationchange", ajustarTamanhoCanvas);

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

const getPosition = (e) => {
    let rect = assinaturaCanvas.getBoundingClientRect();
    if (e.touches) {
        return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
    } else {
        return { x: e.offsetX, y: e.offsetY };
    }
};

["mousedown", "touchstart"].forEach(evento =>
    assinaturaCanvas.addEventListener(evento, (e) => {
        e.preventDefault();
        const { x, y } = getPosition(e);
        startDrawing(x, y);
    })
);

["mousemove", "touchmove"].forEach(evento =>
    assinaturaCanvas.addEventListener(evento, (e) => {
        e.preventDefault();
        if (desenhando) {
            const { x, y } = getPosition(e);
            draw(x, y);
        }
    })
);

["mouseup", "mouseleave", "touchend", "touchcancel"].forEach(evento =>
    assinaturaCanvas.addEventListener(evento, stopDrawing)
);

function limparAssinatura() {
    ctx.clearRect(0, 0, assinaturaCanvas.width, assinaturaCanvas.height);
}

// ----------- CAPTURA DE FOTO -----------

const video = document.getElementById("video");
const fotoCanvas = document.getElementById("fotoCanvas");
const fotoCtx = fotoCanvas.getContext("2d");
const fotoPreview = document.getElementById("fotoPreview");

fotoCanvas.width = 400;
fotoCanvas.height = 300;

// Solicita permissão para usar a câmera
navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then((stream) => video.srcObject = stream)
    .catch((err) => console.error("Erro ao acessar a câmera:", err));

function tirarFoto() {
    fotoCtx.drawImage(video, 0, 0, fotoCanvas.width, fotoCanvas.height);
    fotoPreview.src = fotoCanvas.toDataURL("image/png");
    fotoPreview.style.display = "block";
}

function limparFoto() {
    fotoCtx.clearRect(0, 0, fotoCanvas.width, fotoCanvas.height);
    fotoPreview.style.display = "none";
}

// ----------- ENVIO DOS DADOS -----------

let enviando = false;

function enviarDados() {
    if (enviando) return;
    enviando = true;

    const nome = document.getElementById("nome").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const expositor = document.getElementById("expositor").value.trim();
    const rua = document.getElementById("rua").value.trim();

    // Validação de campos obrigatórios
    if (!nome || !cpf || !expositor || !rua) {
        alert("Por favor, preencha todos os campos corretamente.");
        enviando = false;
        return;
    }

    // Validação do CPF
    if (!/^\d{11}$/.test(cpf)) {
        alert("CPF inválido. Insira 11 números.");
        enviando = false;
        return;
    }

    // Verifica se há algo desenhado no canvas (assinatura)
    const assinaturaBase64 = assinaturaCanvas.toDataURL("image/png").length > 100 ?
        assinaturaCanvas.toDataURL("image/png") : null;
    const fotoBase64 = fotoCanvas.toDataURL("image/png").length > 100 ?
        fotoCanvas.toDataURL("image/png") : null;

    // Validação para assinatura e foto
    if (!assinaturaBase64 || !fotoBase64) {
        alert("Por favor, forneça sua assinatura e uma foto.");
        enviando = false;
        return;
    }

    const dados = {
        nome,
        cpf,
        expositor,
        rua,
        assinatura: assinaturaBase64,
        foto: fotoBase64,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    };

    // Gera a mensagem formatada
    const gerarMensagem = () => {
        return `Dados do Formulário:\n\n\u{1F464} Nome: ${nome}\n\u{1F4CD} CPF: ${cpf}\n\u{1F3E2} Expositor: ${expositor}\n\u{1F4C5} Rua: ${rua}`;
    };

    // Criação do PDF
    const doc = new jsPDF();

    // Adiciona os dados no PDF
    doc.text("Dados do Formulário:", 10, 10);
    doc.text(`Nome: ${nome}`, 10, 20);
    doc.text(`CPF: ${cpf}`, 10, 30);
    doc.text(`Expositor: ${expositor}`, 10, 40);
    doc.text(`Rua: ${rua}`, 10, 50);

    // Adiciona a foto e assinatura no PDF
    doc.addImage(fotoCanvas.toDataURL("image/png"), "PNG", 10, 60, 50, 50); // Foto
    doc.addImage(assinaturaCanvas.toDataURL("image/png"), "PNG", 10, 120, 50, 20); // Assinatura

    // Gera o PDF
    const pdfBase64 = doc.output("datauristring");

    // Envia os dados e o PDF para o servidor
    fetch("/api/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dados, pdf: pdfBase64 })
    })
        .then(response => {
            if (!response.ok) throw new Error("Erro ao enviar os dados.");
            return response.text();
        })
        .then(data => {
            console.log("Resposta do servidor:", data);

            // Gera o link para WhatsApp
            const mensagem = gerarMensagem();
            const numeroDestino = "5511980534827";
            const url = `https://wa.me/${numeroDestino}?text=${encodeURIComponent(mensagem)}`;

            window.open(url, "_blank");
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Ocorreu um erro ao enviar os dados. Tente novamente.");
        })
        .finally(() => {
            enviando = false;
        });
}

// ----------- MELHORIAS ADICIONAIS -----------

const botaoEnviar = document.getElementById("botaoEnviar");
botaoEnviar.style.position = "fixed";
botaoEnviar.style.bottom = "10px";
botaoEnviar.style.right = "10px";

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Seu navegador não suporta acesso à câmera.");
}

function limparCanvas(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
