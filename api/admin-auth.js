/**
 * Vercel Serverless Function para Autenticação Segura do Painel ADM
 * Lê a senha a partir da variável de ambiente ADMIN_PASSWORD configurada na Vercel.
 */

module.exports = async (req, res) => {
    // Permite CORS caso necessário
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { password } = req.body || {};

        // Senha definida nas Variáveis de Ambiente da Vercel (ou fallback padrão caso ainda não tenha sido configurada)
        const validPassword = process.env.ADMIN_PASSWORD || "ComboExtensão";

        if (password && password === validPassword) {
            // Retorna sucesso e um token simples de sessão
            return res.status(200).json({
                authenticated: true,
                message: "Acesso autorizado com sucesso."
            });
        } else {
            return res.status(401).json({
                authenticated: false,
                message: "Senha incorreta."
            });
        }
    } catch (err) {
        return res.status(500).json({
            error: "Erro interno no servidor de autenticação."
        });
    }
};
