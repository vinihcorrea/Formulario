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
    const cpfRegex = /^\d{11}$/;
    if (!cpfRegex.test(cpf)) {
        alert("CPF inválido. Insira 11 números.");
        enviando = false;
        return;
    }

    // Verifica se há algo desenhado no canvas (assinatura)
    const assinaturaBase64 = assinaturaCanvas.toDataURL("image/png").length > 100 ? assinaturaCanvas.toDataURL("image/png") : null;
    const fotoBase64 = fotoCanvas.toDataURL("image/png").length > 100 ? fotoCanvas.toDataURL("image/png") : null;

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

            // Tenta abrir o link do WhatsApp em uma nova aba ou janela
            try {
                window.open(url, "_blank");
            } catch (error) {
                console.error("Erro ao abrir o link do WhatsApp:", error);
                alert("Não foi possível abrir o WhatsApp. Tente novamente.");
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Ocorreu um erro ao enviar os dados. Tente novamente.");
        })
        .finally(() => {
            enviando = false;
        });
}
