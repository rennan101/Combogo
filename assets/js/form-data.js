/**
 * COMBOGÓ UNICAP - SELEÇÃO DE ALUNOS 2026.2
 * Configuração dos Dados do Formulário (Form Schema & Steps)
 */

window.CombogoFormSteps = [
    {
        id: "etapa-01",
        stepNumber: "01",
        shortTitle: "Dados",
        title: "ETAPA 01 — Dados do aluno",
        subtitle: "Primeiro, queremos conhecer você.",
        fields: [
            {
                id: "nome_completo",
                label: "Nome completo",
                type: "text",
                required: true,
                placeholder: "Digite seu nome completo",
                autocomplete: "name"
            },
            {
                id: "matricula",
                label: "Matrícula",
                type: "text",
                required: true,
                placeholder: "Ex: 2024101234",
                inputmode: "numeric"
            },
            {
                id: "email_institucional",
                label: "E-mail institucional",
                type: "email",
                required: true,
                placeholder: "seu.nome@unicap.br",
                autocomplete: "email",
                hint: "Utilize preferencialmente seu e-mail da UNICAP"
            },
            {
                id: "whatsapp",
                label: "WhatsApp / telefone",
                type: "tel",
                required: true,
                placeholder: "(81) 99999-9999",
                autocomplete: "tel",
                inputmode: "tel"
            },
            {
                id: "curso",
                label: "Curso",
                type: "radio",
                required: true,
                options: [
                    "Ciência da Computação",
                    "Sistemas para Internet"
                ]
            },
            {
                id: "periodo",
                label: "Período",
                type: "select",
                required: true,
                options: [
                    "1º período",
                    "2º período",
                    "3º período",
                    "4º período",
                    "5º período",
                    "6º período",
                    "7º período",
                    "8º período ou superior"
                ]
            }
        ]
    },
    {
        id: "etapa-02",
        stepNumber: "02",
        shortTitle: "Interesses",
        title: "ETAPA 02 — Interesse",
        subtitle: "O que faz seus olhos brilharem?",
        fields: [
            {
                id: "motivo_interesse",
                label: "Por que você gostaria de fazer parte da Combogó?",
                type: "textarea",
                required: true,
                placeholder: "Conte o que despertou seu interesse em fazer parte da Combogó...",
                rows: 4
            },
            {
                id: "areas_atuacao",
                label: "Em quais áreas você gostaria de atuar?",
                type: "checkbox-group",
                required: true,
                options: [
                    "Desenvolvimento Web / Front-end",
                    "Desenvolvimento Web / Back-end",
                    "Desenvolvimento Full Stack",
                    "Desenvolvimento de Jogos",
                    "Unity / C#",
                    "Unreal Engine",
                    "Aplicações Mobile",
                    "Inteligência Artificial",
                    "Computação Gráfica",
                    "Realidade Virtual / VR",
                    "Realidade Aumentada / AR",
                    "Modelagem / aplicações 3D",
                    "Banco de Dados",
                    "UX/UI",
                    "Prototipação",
                    "Automação / Scripts",
                    "Outra"
                ],
                hasOtherInput: true,
                otherInputId: "area_outra_texto",
                otherPlaceholder: "Especifique a outra área de interesse"
            },
            {
                id: "area_principal",
                label: "Qual dessas áreas é seu principal interesse?",
                type: "dynamic-radio",
                dependsOn: "areas_atuacao",
                required: true,
                emptyHint: "Selecione ao menos uma área acima para escolher seu interesse principal."
            }
        ]
    },
    {
        id: "etapa-03",
        stepNumber: "03",
        shortTitle: "Conhecimentos",
        title: "ETAPA 03 — Conhecimentos técnicos",
        subtitle: "O que você já sabe fazer?",
        fields: [
            {
                id: "nivel_tecnico",
                label: "Como você avalia seu nível de conhecimento técnico atualmente?",
                type: "radio",
                required: true,
                options: [
                    "Iniciante — ainda estou aprendendo",
                    "Básico",
                    "Intermediário",
                    "Avançado",
                    "Tenho experiência profissional"
                ]
            },
            {
                id: "tecnologias_utilizadas",
                label: "Quais tecnologias, linguagens ou ferramentas você já utilizou?",
                type: "checkbox-group",
                required: false,
                options: [
                    "HTML",
                    "CSS",
                    "JavaScript",
                    "TypeScript",
                    "React",
                    "Node.js",
                    "Python",
                    "Java",
                    "C",
                    "C#",
                    "C++",
                    "PHP",
                    "SQL / Banco de Dados",
                    "Git / GitHub",
                    "Unity",
                    "Unreal Engine",
                    "Godot",
                    "Blender",
                    "Figma",
                    "APIs / Web Services",
                    "IA generativa",
                    "Machine Learning",
                    "Docker",
                    "Antigravity IDE",
                    "Claude Code",
                    "Codex",
                    "Google Stitch",
                    "Lovable",
                    "Render",
                    "Vercel",
                    "Firebase",
                    "Supabase",
                    "Outra",
                    "Ainda não tenho experiência com essas tecnologias"
                ],
                exclusiveOption: "Ainda não tenho experiência com essas tecnologias",
                hasOtherInput: true,
                otherInputId: "tecnologia_outra_texto",
                otherPlaceholder: "Especifique outra tecnologia"
            },
            {
                id: "tem_projeto",
                label: "Você possui algum projeto que gostaria de apresentar?",
                type: "radio",
                required: false,
                options: ["Sim", "Não"],
                defaultValue: "Não"
            },
            {
                id: "link_projeto",
                label: "Link para portfólio, GitHub, LinkedIn ou projetos",
                type: "url",
                required: false,
                condition: { field: "tem_projeto", value: "Sim" },
                placeholder: "https://github.com/seu-usuario ou https://..."
            },
            {
                id: "descricao_projeto",
                label: "Conte brevemente sobre um projeto que você desenvolveu ou participou.",
                type: "textarea",
                required: false,
                condition: { field: "tem_projeto", value: "Sim" },
                placeholder: "Descreva a ideia, tecnologias utilizadas e seu papel no projeto...",
                rows: 3
            }
        ]
    },
    {
        id: "etapa-04",
        stepNumber: "04",
        shortTitle: "Estrutura",
        title: "ETAPA 04 — Seu setup & Disponibilidade",
        subtitle: "Tecnologia também precisa de um lugar e tempo para acontecer.",
        fields: [
            {
                id: "tem_computador",
                label: "Você possui um computador pessoal que pode utilizar para atividades relacionadas à Combogó?",
                type: "radio",
                required: true,
                options: ["Sim", "Não"]
            },
            {
                id: "consegue_levar_computador",
                label: "Você consegue levar seu computador pessoal para a Combogó quando necessário?",
                type: "radio",
                required: true,
                options: [
                    "Sim, consigo levar regularmente",
                    "Sim, mas apenas eventualmente",
                    "Não consigo levar",
                    "Não possuo computador"
                ]
            },
            {
                id: "desempenho_computador",
                label: "Como você classificaria o desempenho do seu computador?",
                type: "radio",
                required: false,
                options: [
                    "Básico — adequado para programação e tarefas leves",
                    "Intermediário — adequado para programação e desenvolvimento de aplicações",
                    "Avançado — adequado para desenvolvimento de jogos, 3D, Unity/Unreal etc.",
                    "Não sei informar",
                    "Não possuo computador"
                ]
            },
            {
                id: "sistema_operacional",
                label: "Qual é o sistema operacional principal do seu computador?",
                type: "radio",
                required: false,
                options: [
                    "Windows",
                    "macOS",
                    "Linux",
                    "ChromeOS",
                    "Outro",
                    "Não possuo computador"
                ]
            },
            {
                id: "disponibilidade_14_18",
                label: "Você teria disponibilidade para atuar na Combogó das 14hrs até as 18hrs?",
                type: "radio",
                required: true,
                options: ["Sim", "Não"]
            }
        ]
    },
    {
        id: "etapa-05",
        stepNumber: "05",
        shortTitle: "Perfil",
        title: "ETAPA 05 — Perfil",
        subtitle: "Queremos conhecer seu jeito de trabalhar.",
        fields: [
            {
                id: "participou_extracurricular",
                label: "Você já participou de algum projeto acadêmico, extensão, iniciação científica, empresa júnior, Game Jam ou projeto extracurricular?",
                type: "checkbox-group",
                required: false,
                options: [
                    "Projeto acadêmico",
                    "Projeto de extensão",
                    "Iniciação científica",
                    "Empresa júnior",
                    "Game Jam",
                    "Outro projeto extracurricular",
                    "Nenhum"
                ],
                exclusiveOption: "Nenhum"
            },
            {
                id: "descricao_extracurricular",
                label: "Conte brevemente sobre essa experiência.",
                type: "textarea",
                required: false,
                condition: { field: "participou_extracurricular", notIncludes: "Nenhum" },
                placeholder: "Descreva qual foi o projeto, evento ou iniciativa...",
                rows: 3
            },
            {
                id: "trabalho_em_equipe",
                label: "Como você se sente trabalhando em equipe?",
                type: "radio",
                required: true,
                options: [
                    "Prefiro trabalhar sozinho",
                    "Consigo trabalhar em equipe",
                    "Gosto bastante de trabalhar em equipe",
                    "Tenho experiência trabalhando em equipes de desenvolvimento"
                ]
            },
            {
                id: "aprender_tecnologia_nova",
                label: "Como você reage quando precisa aprender uma tecnologia que ainda não conhece?",
                type: "textarea",
                required: true,
                placeholder: "Conte como você costuma aprender algo novo...",
                rows: 4
            }
        ]
    },
    {
        id: "etapa-06",
        stepNumber: "06",
        shortTitle: "Finalização",
        title: "ETAPA 06 — A pergunta final",
        subtitle: "Agora é com você.",
        isFinalStep: true,
        fields: [
            {
                id: "por_que_escolher",
                label: "Por que deveríamos escolher você para fazer parte da Combogó?",
                type: "textarea",
                required: true,
                placeholder: "Essa é sua oportunidade de nos contar aquilo que não apareceu nas perguntas anteriores.",
                rows: 6,
                highlight: true
            },
            {
                id: "informacao_adicional",
                label: "Existe alguma informação que você gostaria que a equipe da Combogó soubesse sobre você?",
                type: "textarea",
                required: false,
                placeholder: "Qualquer outro detalhe, hobby, conquista ou observação que queira compartilhar...",
                rows: 3
            },
            {
                id: "autorizacao_dados",
                label: "Autorização",
                type: "checkbox-single",
                required: true,
                checkboxLabel: "Autorizo a Combogó UNICAP a utilizar as informações fornecidas neste formulário exclusivamente para fins de seleção, contato e organização das atividades relacionadas à equipe."
            }
        ]
    }
];
