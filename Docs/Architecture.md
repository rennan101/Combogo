---
title: Arquitetura Técnica do Website
tags:
  - tech-stack
  - dev
  - frontend
  - architecture
---

# 💻 Arquitetura Técnica do Website Combogó

O website da Combogó UNICAP adota uma arquitetura **Zero-Build Vanilla ES Modules**, focada em máxima velocidade de carregamento, longevidade de código, facilidade de manutenção e ausência de dependências frágeis de empacotamento.

---

## 🏗️ Estrutura de Arquivos

```
Combogo/
├── index.html                 # Página inicial semântica e limpa (< 350 linhas)
├── selecao.html               # Página do processo seletivo integrado
├── styles.css                 # CSS estruturado em Design Tokens e layout responsivo
├── translations.js           # Dicionário trilíngue (PT, EN, ES) sem buzzwords
├── projects.json              # Fonte canônica de dados do portfólio
├── team.json                  # Fonte canônica de dados da equipe
├── assets/
│   ├── js/
│   │   ├── main.js            # Ponto de entrada modular (ES Modules)
│   │   ├── modules/
│   │   │   ├── storage.js     # Leitura/escrita segura em localStorage
│   │   │   ├── i18n.js        # Gerenciador de idiomas dinâmico
│   │   │   ├── portfolio.js   # Renderizador de cards, tags e modal com galeria
│   │   │   ├── team.js        # Renderizador de cards de membros da equipe
│   │   │   ├── quotes.js      # Ticker interativo de soluções e serviços
│   │   │   ├── admin.js       # Gestão ADM (Adição/Edição e exportação JSON)
│   │   │   └── ui.js          # Navbar móvel, scroll reveal e progresso
│   │   └── selection-config.js# Configuração do ciclo seletivo
│   ├── css/
│   │   └── selecao.css        # Estilos específicos da seleção
│   ├── projects/              # Imagens e banners dos projetos
│   ├── equipe/                # Fotos dos membros
│   └── icons/                 # SVGs vetoriais
└── Docs/                      # Obsidian Second Brain (Vault de documentação)
```

---

## ⚙️ Princípios de Design & Implementação

1. **No-AI-Slop:**
   - Textos diretos, concisos, escritos em voz ativa (sem clichês como *"no mundo em constante evolução"*, *"transformador"*, *"robusto"*).
   - Eliminação de elementos visuais artificiais (como canvas de partículas aleatórias ou caixas de terminal simulando falsos comandos).
   - Uso de padrões geométricos reais de Cobogó e paleta contrastante oficial UNICAP/Combogó.

2. **Gerenciamento de Estado Seguro:**
   - Acesso resiliente ao `localStorage` através do módulo [[storage|modules/storage.js]], garantindo funcionamento em modo anônimo e iframes sem quebras de runtime.
   - Sincronização e exportação direta de dados canônicos (`projects.json` e `team.json`).

3. **Internacionalização (i18n):**
   - Suporte nativo e instantâneo a Português (`pt`), Inglês (`en`) e Espanhol (`es`) sem recarregar a página.

---

## 🧭 Conexões
- [[Index|MOC Principal]]
- [[About|Manifesto & História]]
- [[Projects/Index|Portfólio de Projetos]]
