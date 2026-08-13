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

        // Se houver um endpoint configurado, faz o POST via fetch
        if (API_ENDPOINT) {
            try {
                const response = await fetch(API_ENDPOINT, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        ...payload,
                        submittedAt: new Date().toISOString(),
                        source: "selecao_2026_web"
                    })
                });

                if (!response.ok) {
                    throw new Error(`Erro na API (${response.status})`);
                }

                return { success: true };
            } catch (error) {
                console.error("Falha ao comunicar com API externa:", error);
                // Fallback para persistência local se houver falha de rede
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
