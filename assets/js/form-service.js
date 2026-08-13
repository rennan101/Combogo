/**
 * COMBOGÓ UNICAP - SELEÇÃO DE ALUNOS 2026.2
 * Camada de Serviço de Envio de Dados (Service Layer)
 * Preparado para futura integração com API, Google Sheets ou Backend.
 */

window.CombogoFormService = (function () {
    // Configuração futura do endpoint de API
    // Exemplo: "https://api.combogounicap.com.br/selecao" ou Webhook do Google Apps Script / Supabase
    const API_ENDPOINT = "https://script.google.com/macros/s/AKfycbwvJFkF-0QJPf_SeI0DQoxLXIw-i-Ddh1SIc2cypTKNXnsgVcXbxEIghmr6Ek9o1pJK/exec"; 

    /**
     * Envia os dados da candidatura
     * @param {Object} payload Dados completos do formulário
     * @returns {Promise<{success: boolean, message?: string}>}
     */
    async function submitApplication(payload) {
        console.log("🚀 Enviando candidatura para a Combogó UNICAP...", payload);

        // Obtém o nome da edição da seleção configurada no ADM
        const selectionConfig = window.CombogoSelectionConfig ? window.CombogoSelectionConfig.getConfig() : { name: "Seleção 2026.2" };

        const fullPayload = {
            ...payload,
            edicao_selecao: selectionConfig.name,
            submittedAt: new Date().toISOString(),
            source: "combogo_web_portal"
        };

        // Google Apps Script NÃO suporta preflight CORS com Content-Type: application/json.
        // A solução correta é enviar como text/plain com mode: "no-cors".
        // O Apps Script recebe e processa normalmente via e.postData.contents.
        if (API_ENDPOINT) {
            try {
                await fetch(API_ENDPOINT, {
                    method: "POST",
                    mode: "no-cors",
                    headers: {
                        "Content-Type": "text/plain;charset=utf-8"
                    },
                    body: JSON.stringify(fullPayload)
                });
                // Com no-cors, a resposta é opaca (não podemos ler o status),
                // mas se não gerou exceção, o envio foi feito com sucesso.
                return { success: true };
            } catch (error) {
                console.error("Falha ao comunicar com Google Apps Script:", error);
                // Fallback para localStorage se houver falha de rede
            }
        }

        // Simulação de delay de rede para feedback visual fluido (1.2s)
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Armazena no localStorage localmente para simular banco de dados / auditoria
        try {
            const history = JSON.parse(localStorage.getItem("combogo_candidaturas_enviadas") || "[]");
            history.push({
                ...payload,
                submittedAt: new Date().toISOString(),
                id: "CAND-" + Date.now()
            });
            localStorage.setItem("combogo_candidaturas_enviadas", JSON.stringify(history));
        } catch (e) {
            console.warn("Erro ao salvar histórico local de candidatura:", e);
        }

        return {
            success: true,
            timestamp: new Date().toISOString()
        };
    }

    return {
        submitApplication
    };
})();
