import type { SiteContent } from '../domain/models/SiteContent'
import { defaultContent } from './defaultContent'
import { withOfficialProfile } from '../assets/public/officialProfile'
import { officialCvUrl } from '../assets/public/officialCv'
import { externalLinks } from '../config/externalLinks'

/** Read-only public CMS export, 2026-11-26; reference main
 * 67e8877b02fc23352306f75c04a40f4085b1f716. Same field mapping as the
 * repository. No credentials or private records. Empty research/social
 * exports retain approved code defaults. Dynamic CMS edits remain possible.
 */
const published = {
  "home": {
    "eyebrow": "LEONARDO CAMARGO ROSSATO",
    "title": "AI Engineering & Software Development",
    "highlightedWords": "AI Engineering & Software Development",
    "description": "I design and build intelligent systems combining AI engineering, software development, systems architecture, LLM applications, retrieval-augmented generation (RAG), data engineering, and mathematical optimization. My background in physics and scientific computing provides a strong quantitative foundation, complemented by research in quantum technologies and complex systems.",
    "focus": "AI Engineer | Software Development | Applied AI | Systems Architecture",
    "skills": [
      "Software Development",
      "Applied AI",
      "Open Source",
      "AI Agents",
      "Data Engineering",
      "Optimization",
      "Quantitative Methods",
      "Scientific Computing",
      "Quantum Technologies",
      "Solution Architecture Practices"
    ],
    "translations": {
      "pt-BR": {
        "focus": "AI Engineer | Software Development | Applied AI | Systems Architecture",
        "title": "AI Engineering & Software Development",
        "skills": [
          "Desenvolvimento de Software",
          "IA Aplicada",
          "Open Source",
          "Agentes de IA",
          "Engenharia de Dados",
          "Otimização",
          "Métodos Quantitativos",
          "Computação Científica",
          "Tecnologias Quânticas",
          "Práticas de Arquitetura de Soluções"
        ],
        "eyebrow": "LEONARDO CAMARGO ROSSATO",
        "description": "Projeto e desenvolvo sistemas inteligentes combinando engenharia de inteligência artificial, desenvolvimento de software, arquitetura de sistemas, aplicações com LLMs, recuperação aumentada por geração (RAG), engenharia de dados e otimização matemática. Minha formação em Física e Computação Científica oferece uma sólida base quantitativa, complementada por pesquisas em tecnologias quânticas e sistemas complexos.",
        "highlightedWords": "AI Engineering & Software Development"
      }
    }
  },
  "about": {
    "name": "Leonardo Camargo Rossato",
    "headline": "AI Engineer | Software Development | Applied AI | Systems Architecture",
    "professionalTitle": "AI Engineer | Software Development | Applied AI | Systems Architecture",
    "intro": "I design and build intelligent systems combining AI engineering, software development, systems architecture, LLM applications, retrieval-augmented generation (RAG), data engineering and mathematical optimization. My physics and scientific computing background underpins research in quantum technologies and complex systems.",
    "valueProposition": "",
    "title": "About",
    "bio": [
      "<strong>Software & AI:</strong> AI-assisted software development, AI agents, LLM applications, OpenAI API, Microsoft Copilot, RAG, APIs, guardrails and enterprise integrations.",
      "<strong>Data & Quantitative:</strong> Data engineering, clustering, statistical modeling, graph-based methods, optimization and scientific computing.",
      "<strong>Microsoft Ecosystem:</strong> SharePoint/SPFx, Power Apps, Power Automate and Dataverse.",
      "<strong>PhD Research @ ITA:</strong> GNSS-denied navigation, quantum sensing, sensor fusion, state estimation and embedded systems.",
      "<strong>MSc in Physics:</strong> Econophysics, Data Science & Complex Systems.",
      "<strong>Leadership:</strong> President & Co-Founder of Instituto Foton (2025–2026, volunteer); Vice-President & Co-Founder of Brazil’s National Quantum Computing Academic Leagues Movement (2024–2025, volunteer).",
      "<strong>Scientific Communication:</strong> More than 50 talks in Portuguese and English across Brazil's five macro-regions.",
      "<strong>Education:</strong> BSc in Physics (UFSM); MSc in Physics (UFRGS); PhD Candidate in Electronic Engineering and Computing (ITA)."
    ],
    "location": "São José dos Campos, Brazil",
    "email": "leo.c.rossato@gmail.com",
    "experiences": [
      {
        "id": "pronext",
        "order": 1,
        "title": "Software Development & Applied AI",
        "period": "2026 — Present",
        "description": "Develop AI-assisted software, LLM-based agents, data solutions, Power Apps, tool integrations and automated workflows for enterprise problems within the Microsoft ecosystem, including SharePoint, Dataverse and Power Automate. Build agentic solutions and GPT integrations using OpenAI API and Microsoft Copilot interfaces, prompt/context engineering, APIs, guardrails and enterprise knowledge-source integrations.",
        "organization": "ProNext · Internship Contract | Remote"
      },
      {
        "id": "ita",
        "order": 2,
        "title": "PhD Researcher — Autonomous Navigation & Hybrid Sensing",
        "period": "2026 — Present",
        "description": "Research GNSS-denied autonomous navigation integrating classical and quantum sensors, sensor fusion, state estimation, intelligent computational methods and validation strategies for safety-critical systems.",
        "organization": "Aeronautics Institute of Technology — ITA"
      },
      {
        "id": "foton",
        "order": 3,
        "title": "President & Co-Founder (Volunteer)",
        "period": "2025 — 2026",
        "description": "Led multidisciplinary R&D&I at the interface of scientific research, technology development and industrial application; acted as Project Manager across multidisciplinary teams, guiding system architecture, PoC/MVP development, optimization and data-driven operational decision-making. Applied a structured AI-assisted development workflow separating requirements and architecture planning from implementation, testing and iterative refinement with AI coding assistants.",
        "organization": "Institute of Quantum Sciences and Technologies — Foton Institute",
        "organizationUrl": "https://institutofoton.com.br/"
      },
      {
        "id": "quantum-leagues",
        "order": 4,
        "title": "Vice-President & Co-Founder (Volunteer)",
        "period": "2024 — 2025",
        "description": "Co-founded Brazil's national academic quantum computing leagues movement, supporting student and research networks and connections among academic leagues.",
        "organization": "National Quantum Computing Academic Leagues Movement — Brazil"
      },
      {
        "id": "ufrgs",
        "order": 5,
        "title": "Researcher — Econophysics, Data Science & Complex Systems",
        "period": "2022 — 2025",
        "description": "Built end-to-end Python/Jupyter data pipelines covering ETL, cleaning, standardization, integration, validation/QA, statistical modeling and visualization for heterogeneous socioeconomic datasets from Brazil, the United States and Latin America. Worked extensively with clustering and data optimization, graph-based clustering, statistical inference, scikit-learn workflows, visual analytics and reproducible pipelines.",
        "organization": "Federal University of Rio Grande do Sul — UFRGS"
      },
      {
        "id": "ufsm",
        "order": 6,
        "title": "Researcher — Computational Physics & Condensed Matter",
        "period": "2020 — 2022",
        "description": "Automated reproducible pre-processing, execution and post-processing pipelines using Jupyter, Linux, Fortran/C/Shell; processed large simulation datasets and optimized numerical routines by approximately 50%.",
        "organization": "Federal University of Santa Maria — UFSM"
      }
    ],
    "education": [
      {
        "id": "ita-phd",
        "field": "Electronic Engineering and Computing",
        "order": 1,
        "degree": "PhD Candidate",
        "period": "2026 — Present",
        "institution": "Aeronautics Institute of Technology (ITA)"
      },
      {
        "id": "ufrgs-msc",
        "field": "Econophysics, Data Science & Statistical Physics",
        "order": 2,
        "degree": "MSc in Physics",
        "period": "2022 — 2025",
        "institution": "Federal University of Rio Grande do Sul (UFRGS)"
      },
      {
        "id": "ufsm-bsc",
        "field": "Computational & Condensed-Matter Physics",
        "order": 3,
        "degree": "BSc in Physics",
        "period": "2020 — 2022",
        "institution": "Federal University of Santa Maria (UFSM)"
      },
      {
        "id": "ufsm-chemical",
        "field": "Partial undergraduate studies",
        "order": 4,
        "degree": "Chemical Engineering",
        "period": "2016 — 2020",
        "institution": "Federal University of Santa Maria (UFSM)"
      }
    ],
    "researchTimeline": [
      {
        "id": "nav",
        "order": 1,
        "title": "Autonomous Navigation & Hybrid Sensing",
        "period": "2026 → Present",
        "description": "GNSS-denied navigation, classical and quantum sensors, sensor fusion, state estimation, intelligent computational methods and validation strategies.",
        "institution": "ITA"
      },
      {
        "id": "econ",
        "order": 2,
        "title": "Econophysics, Data Science & Complex Systems",
        "period": "2022 → 2025",
        "description": "ETL, clustering, graph algorithms, statistical inference, visual analytics and reproducible pipelines for heterogeneous socioeconomic datasets.",
        "institution": "UFRGS"
      },
      {
        "id": "cmp",
        "order": 3,
        "title": "Computational Physics & Condensed Matter",
        "period": "2020 → 2022",
        "description": "Reproducible computational pipelines, numerical methods and simulation of condensed-matter systems.",
        "institution": "UFSM"
      }
    ],
    "areas": [
      "AI Agents",
      "Software Engineering",
      "Data Engineering",
      "Quantitative Modeling",
      "Scientific Computing",
      "Solution Architecture",
      "Clustering",
      "Statistical Inference",
      "Sensor Fusion",
      "State Estimation",
      "Quantum Technologies"
    ],
    "publications": [
      {
        "id": "epjb-2024",
        "year": 2024,
        "order": 1,
        "title": "Analysis of socioeconomic indicators in the United States, Brazil, and other Latin American countries using econophysics techniques.",
        "venue": "European Physical Journal B, 97, 137.",
        "authors": [
          "L. C. Rossato",
          "J. R. Iglesias",
          "S. Gonçalves"
        ]
      },
      {
        "id": "physica-2023",
        "year": 2023,
        "order": 2,
        "title": "The Ising bilayer honeycomb lattice: A cluster mean-field study.",
        "venue": "Physica A, 621, 128778.",
        "authors": [
          "L. C. Rossato",
          "F. M. Zimmer",
          "C. V. Morais",
          "M. Schmidt"
        ]
      }
    ],
    "scienceCommunication": "Co-Founder of the Brazilian Quantum Computing Academic League movement; founded and supported 10+ academic leagues across Brazil (2024–2026/1). Delivered 50+ talks in Portuguese and English (2023–2026) across Brazil’s five macro-regions. Organized, coordinated or curated 15+ events and technical tracks in Quantum, Security and Emerging Technologies. Selected through the Young Scholars Initiative as the only Brazilian among seven internationally sponsored researchers for the 2023 Conference on Complex Systems (CCS).",
    "speakerPortfolioUrl": "https://leonardo-camargo-rossato.lovable.app/",
    "contentBlocks": [],
    "translations": {
      "pt-BR": {
        "bio": [
          "<strong>Software & IA:</strong> desenvolvimento de software assistido por IA, agentes de IA, aplicações com LLM, OpenAI API, Microsoft Copilot, RAG, APIs, guardrails e integrações corporativas.",
          "<strong>Dados & Quantitativo:</strong> engenharia de dados, clustering, modelagem estatística, métodos baseados em grafos, otimização e computação científica.",
          "<strong>Ecossistema Microsoft:</strong> SharePoint/SPFx, Power Apps, Power Automate e Dataverse.",
          "<strong>Pesquisa de Doutorado @ ITA:</strong> navegação GNSS-denied, sensoriamento quântico, fusão de sensores, estimação de estado e sistemas embarcados.",
          "<strong>Mestrado em Física:</strong> Econofísica, Ciência de Dados & Sistemas Complexos.",
          "<strong>Liderança:</strong> Presidente e cofundador do Instituto Foton (2025–2026, voluntário); vice-presidente e cofundador do Movimento Nacional de Ligas Acadêmicas de Computação Quântica no Brasil (2024–2025, voluntário).",
          "<strong>Comunicação Científica:</strong> Mais de 50 palestras em português e inglês nas cinco macrorregiões do Brasil.",
          "<strong>Formação:</strong> Físico (UFSM); Mestre em Física (UFRGS); Doutorando em Engenharia Eletrônica e Computação (ITA)."
        ],
        "name": "Leonardo Camargo Rossato",
        "areas": [
          "Agentes de IA",
          "Engenharia de Software",
          "Engenharia de Dados",
          "Modelagem Quantitativa",
          "Computação Científica",
          "Arquitetura de Soluções",
          "Clustering",
          "Inferência Estatística",
          "Fusão de Sensores",
          "Estimação de Estado",
          "Tecnologias Quânticas"
        ],
        "email": "leo.c.rossato@gmail.com",
        "intro": "Projeto e desenvolvo sistemas inteligentes integrando engenharia de IA, desenvolvimento de software, arquitetura de sistemas, LLMs, RAG, engenharia de dados e otimização matemática. Minha formação em Física e Computação Científica sustenta a atuação em tecnologias quânticas e sistemas complexos.",
        "title": "Sobre",
        "headline": "AI Engineer | Software Development | Applied AI | Systems Architecture",
        "location": "São José dos Campos, Brasil",
        "education": [
          {
            "id": "ita-phd",
            "field": "Engenharia Eletrônica e Computação",
            "order": 1,
            "degree": "Doutorando",
            "period": "2026 — Presente",
            "institution": "Instituto Tecnológico de Aeronáutica (ITA)"
          },
          {
            "id": "ufrgs-msc",
            "field": "Econofísica, Ciência de Dados & Física Estatística",
            "order": 2,
            "degree": "Mestrado em Física",
            "period": "2022 — 2025",
            "institution": "Universidade Federal do Rio Grande do Sul (UFRGS)"
          },
          {
            "id": "ufsm-bsc",
            "field": "Física Computacional & Matéria Condensada",
            "order": 3,
            "degree": "Bacharelado em Física",
            "period": "2020 — 2022",
            "institution": "Universidade Federal de Santa Maria (UFSM)"
          },
          {
            "id": "ufsm-chemical",
            "field": "Graduação parcial",
            "order": 4,
            "degree": "Engenharia Química",
            "period": "2016 — 2020",
            "institution": "Universidade Federal de Santa Maria (UFSM)"
          }
        ],
        "experiences": [
          {
            "id": "pronext",
            "order": 1,
            "title": "Desenvolvimento de Software & IA Aplicada",
            "period": "2026 — Presente",
            "description": "Desenvolvo software assistido por IA, agentes baseados em LLM, soluções de dados, Power Apps, integrações de ferramentas e fluxos automatizados para problemas corporativos no ecossistema Microsoft, incluindo SharePoint, Dataverse e Power Automate. Construo soluções agênticas e integrações com GPT usando OpenAI API e interfaces Microsoft Copilot, engenharia de prompt/contexto, APIs, guardrails e integração com fontes de conhecimento corporativas.",
            "organization": "ProNext · Contrato de Estágio | Remoto"
          },
          {
            "id": "ita",
            "order": 2,
            "title": "Pesquisador de Doutorado — Navegação Autônoma & Sensoriamento Híbrido",
            "period": "2026 — Presente",
            "description": "Pesquisa em navegação autônoma GNSS-denied integrando sensores clássicos e quânticos, fusão de sensores, estimação de estado, métodos computacionais inteligentes e estratégias de validação para sistemas críticos.",
            "organization": "Instituto Tecnológico de Aeronáutica — ITA"
          },
          {
            "id": "foton",
            "order": 3,
            "title": "Presidente e Cofundador (Voluntário)",
            "period": "2025 — 2026",
            "description": "Liderei P&D&I multidisciplinar na interface entre pesquisa científica, desenvolvimento tecnológico e aplicação industrial; atuei como Project Manager em equipes multidisciplinares, orientando arquitetura de sistemas, desenvolvimento de PoCs/MVPs, otimização e tomada de decisão operacional orientada por dados.",
            "organization": "Instituto de Ciências e Tecnologias Quânticas — Instituto Foton",
            "organizationUrl": "https://institutofoton.com.br/"
          },
          {
            "id": "quantum-leagues",
            "order": 4,
            "title": "Vice-presidente e Cofundador (Voluntário)",
            "period": "2024 — 2025",
            "description": "Cofundei o movimento nacional de ligas acadêmicas de computação quântica no Brasil, conectando estudantes, pesquisadores e comunidades acadêmicas.",
            "organization": "Movimento Nacional de Ligas Acadêmicas de Computação Quântica no Brasil"
          },
          {
            "id": "ufrgs",
            "order": 5,
            "title": "Pesquisador — Econofísica, Ciência de Dados & Sistemas Complexos",
            "period": "2022 — 2025",
            "description": "Desenvolvi pipelines end-to-end em Python/Jupyter cobrindo ETL, limpeza, padronização, integração, validação/QA, modelagem estatística e visualização para bases socioeconômicas heterogêneas do Brasil, Estados Unidos e América Latina, com forte atuação em clustering, otimização de dados, clustering baseado em grafos, inferência estatística e pipelines reprodutíveis.",
            "organization": "Universidade Federal do Rio Grande do Sul — UFRGS"
          },
          {
            "id": "ufsm",
            "order": 6,
            "title": "Pesquisador — Física Computacional & Matéria Condensada",
            "period": "2020 — 2022",
            "description": "Automatizei pipelines reprodutíveis de pré-processamento, execução e pós-processamento usando Jupyter, Linux, Fortran/C/Shell; processei grandes conjuntos de dados de simulação e otimizei rotinas numéricas em aproximadamente 50%.",
            "organization": "Universidade Federal de Santa Maria — UFSM"
          }
        ],
        "publications": [
          {
            "id": "epjb-2024",
            "year": 2024,
            "order": 1,
            "title": "Analysis of socioeconomic indicators in the United States, Brazil, and other Latin American countries using econophysics techniques.",
            "venue": "European Physical Journal B, 97, 137.",
            "authors": [
              "L. C. Rossato",
              "J. R. Iglesias",
              "S. Gonçalves"
            ]
          },
          {
            "id": "physica-2023",
            "year": 2023,
            "order": 2,
            "title": "The Ising bilayer honeycomb lattice: A cluster mean-field study.",
            "venue": "Physica A, 621, 128778.",
            "authors": [
              "L. C. Rossato",
              "F. M. Zimmer",
              "C. V. Morais",
              "M. Schmidt"
            ]
          }
        ],
        "researchTimeline": [
          {
            "id": "nav",
            "order": 1,
            "title": "Navegação Autônoma & Sensoriamento Híbrido",
            "period": "2026 → Presente",
            "description": "Navegação GNSS-denied, sensores clássicos e quânticos, fusão de sensores, estimação de estado, métodos computacionais inteligentes e estratégias de validação.",
            "institution": "ITA"
          },
          {
            "id": "econ",
            "order": 2,
            "title": "Econofísica, Ciência de Dados & Sistemas Complexos",
            "period": "2022 → 2025",
            "description": "ETL, clustering, algoritmos em grafos, inferência estatística, análise visual e pipelines reprodutíveis para bases socioeconômicas heterogêneas.",
            "institution": "UFRGS"
          },
          {
            "id": "cmp",
            "order": 3,
            "title": "Física Computacional & Matéria Condensada",
            "period": "2020 → 2022",
            "description": "Pipelines computacionais reprodutíveis, métodos numéricos e simulação de sistemas de matéria condensada.",
            "institution": "UFSM"
          }
        ],
        "valueProposition": "",
        "professionalTitle": "AI Engineer | Software Development | Applied AI | Systems Architecture",
        "scienceCommunication": "Cofundador do movimento brasileiro de Ligas Acadêmicas de Computação Quântica; fundou e apoiou 10+ ligas acadêmicas no Brasil (2024–2026/1). Realizou mais de 50 palestras em português e inglês (2023–2026) nas cinco macrorregiões do país. Organizou, coordenou ou curei 15+ eventos e trilhas técnicas em Quantum, Segurança e Tecnologias Emergentes. Selecionado pelo Young Scholars Initiative como o único brasileiro entre sete pesquisadores internacionalmente financiados para a Conference on Complex Systems (CCS) de 2023."
      }
    }
  },
  "siteSettings": {
    "footerTagline": "AI Engineering · Software Development · Applied AI · Systems Architecture",
    "contactIntro": "Open to software development and applied AI opportunities, project-based work, R&D collaborations and technical speaking engagements.",
    "projectsIntro": "Selected case studies showing how I turn complex requirements into implemented software, AI, data and scientific systems.",
    "architectureStatement": "AI Engineering · Software Development · RAG · Data Engineering · Mathematical Optimization · Quantum Computing",
    "capabilities": [
      {
        "title": "AI Engineering & Intelligent Systems",
        "description": "LLM applications, grounded retrieval and intelligent query orchestration connected to verified data.",
        "items": [
          "LLMs",
          "AI Agents",
          "RAG",
          "Hybrid Retrieval",
          "Semantic Search",
          "Embeddings",
          "Knowledge Integration",
          "Query Routing",
          "Applied AI",
          "OpenAI API",
          "LLM Applications",
          "Knowledge-source Integration",
          "Prompt / Context Engineering",
          "Guardrails",
          "AI-assisted Software Development",
          "Microsoft Copilot Interfaces"
        ]
      },
      {
        "title": "Software Engineering & Architecture",
        "description": "Maintainable application and system design, from APIs and front-end architecture to integrated workflows.",
        "items": [
          "Python",
          "APIs",
          "Backend Development",
          "React",
          "TypeScript",
          "Systems Architecture",
          "Modular Software",
          "System Integration",
          "JavaScript / TypeScript",
          "Git / GitHub",
          "Docker",
          "Supabase",
          "PostgreSQL / SQL",
          "Streamlit",
          "Jupyter Notebook"
        ]
      },
      {
        "title": "Data Engineering & Mathematical Optimization",
        "description": "Reproducible quantitative workflows across databases, statistics, numerical methods and optimization.",
        "items": [
          "PostgreSQL",
          "SQL",
          "Data Engineering",
          "Statistical Analysis",
          "Numerical Methods",
          "Clustering",
          "Graph Algorithms",
          "Optimization",
          "Pandas",
          "NumPy",
          "SciPy",
          "scikit-learn",
          "ETL / ELT",
          "Heuristics",
          "Statistical Inference",
          "Statistical Modeling",
          "Visual Analytics"
        ]
      },
      {
        "title": "Quantum & Scientific Computing",
        "description": "Scientific research and computational modeling as quantitative foundations for emerging technologies.",
        "items": [
          "Quantum Computing",
          "Qiskit",
          "Scientific Computing",
          "Computational Modeling",
          "Numerical Simulation",
          "Hybrid Sensing",
          "Quantum Sensing",
          "Sensor Fusion",
          "State Estimation",
          "GNSS-denied Navigation",
          "Econophysics",
          "Embedded Systems"
        ]
      },
      {
        "title": "Enterprise Systems & Integration",
        "description": "Enterprise applications, Microsoft platforms, data governance and interoperable systems.",
        "items": [
          "SharePoint",
          "SPFx",
          "Microsoft 365",
          "Enterprise Integration",
          "Governance",
          "Automated Workflows",
          "Solution Architecture",
          "Requirements Analysis",
          "System Integration",
          "SharePoint Framework (SPFx)",
          "SharePoint CLI",
          "Power Apps",
          "Power Automate",
          "Dataverse"
        ]
      }
    ],
    "workProcess": [
      {
        "step": "01",
        "title": "Understand",
        "description": "Understand the problem, requirements, constraints and success criteria."
      },
      {
        "step": "02",
        "title": "Architect",
        "description": "Decompose the system, define interfaces and select appropriate technologies."
      },
      {
        "step": "03",
        "title": "Build",
        "description": "Implement software, AI, data pipelines, integrations and prototypes."
      },
      {
        "step": "04",
        "title": "Validate & Iterate",
        "description": "Test, validate, optimize and refine the solution based on real requirements and feedback."
      }
    ],
    "mainCardScale": 100,
    "moreCardScale": 130,
    "translations": {
      "pt-BR": {
        "footerTagline": "Engenharia de IA · Desenvolvimento de Software · IA Aplicada · Arquitetura de Sistemas",
        "contactIntro": "Disponível para oportunidades em desenvolvimento de software e IA aplicada, trabalhos por projeto, colaborações de P&D e palestras técnicas.",
        "projectsIntro": "Cases selecionados mostrando como transformo requisitos complexos em sistemas implementados de software, IA, dados e tecnologia científica.",
        "architectureStatement": "Engenharia de IA · Desenvolvimento de Software · RAG · Engenharia de Dados · Otimização Matemática · Computação Quântica",
        "capabilities": [
          {
            "title": "Engenharia de IA & Sistemas Inteligentes",
            "description": "LLMs, recuperação fundamentada em evidências e roteamento inteligente integrado a dados verificáveis.",
            "items": [
              "LLMs",
              "Agentes de IA",
              "RAG",
              "Recuperação Híbrida",
              "Busca Semântica",
              "Embeddings",
              "Integração de Conhecimento",
              "Roteamento de Consultas",
              "IA Aplicada",
              "OpenAI API",
              "Aplicações com LLM",
              "Integração de Fontes de Conhecimento",
              "Engenharia de Prompt / Contexto",
              "Guardrails",
              "Desenvolvimento Assistido por IA",
              "Microsoft Copilot Interfaces"
            ]
          },
          {
            "title": "Engenharia de Software & Arquitetura",
            "description": "Arquitetura e desenvolvimento sustentável de aplicações, APIs, interfaces e integrações.",
            "items": [
              "Python",
              "APIs",
              "Desenvolvimento Backend",
              "React",
              "TypeScript",
              "Arquitetura de Sistemas",
              "Software Modular",
              "Integração de Sistemas",
              "JavaScript / TypeScript",
              "Git / GitHub",
              "Docker",
              "Supabase",
              "PostgreSQL / SQL",
              "Streamlit",
              "Jupyter Notebook"
            ]
          },
          {
            "title": "Engenharia de Dados & Otimização Matemática",
            "description": "Fluxos quantitativos reprodutíveis para bancos de dados, estatística, métodos numéricos e otimização.",
            "items": [
              "PostgreSQL",
              "SQL",
              "Engenharia de Dados",
              "Análise Estatística",
              "Métodos Numéricos",
              "Clustering",
              "Algoritmos em Grafos",
              "Otimização",
              "Pandas",
              "NumPy",
              "SciPy",
              "scikit-learn",
              "ETL / ELT",
              "Heurísticas",
              "Inferência Estatística",
              "Modelagem Estatística",
              "Análise Visual"
            ]
          },
          {
            "title": "Computação Quântica & Científica",
            "description": "Pesquisa, computação científica e modelagem como bases quantitativas para tecnologias emergentes.",
            "items": [
              "Computação Quântica",
              "Qiskit",
              "Computação Científica",
              "Modelagem Computacional",
              "Simulação Numérica",
              "Sensoriamento Híbrido",
              "Sensoriamento Quântico",
              "Fusão de Sensores",
              "Estimação de Estado",
              "Navegação GNSS-denied",
              "Econofísica",
              "Sistemas Embarcados"
            ]
          },
          {
            "title": "Sistemas Corporativos & Integração",
            "description": "Aplicações corporativas, ecossistema Microsoft, governança e sistemas interoperáveis.",
            "items": [
              "SharePoint",
              "SPFx",
              "Microsoft 365",
              "Integração Corporativa",
              "Governança",
              "Fluxos Automatizados",
              "Arquitetura de Soluções",
              "Análise de Requisitos",
              "Integração de Sistemas",
              "SharePoint Framework (SPFx)",
              "SharePoint CLI",
              "Power Apps",
              "Power Automate",
              "Dataverse"
            ]
          }
        ],
        "workProcess": [
          {
            "step": "01",
            "title": "Entender",
            "description": "Entender o problema, requisitos, restrições e critérios de sucesso."
          },
          {
            "step": "02",
            "title": "Estruturar",
            "description": "Decompor o sistema, definir interfaces e selecionar tecnologias adequadas."
          },
          {
            "step": "03",
            "title": "Construir",
            "description": "Implementar software, IA, pipelines de dados, integrações e protótipos."
          },
          {
            "step": "04",
            "title": "Validar & Iterar",
            "description": "Testar, validar, otimizar e refinar a solução com base em requisitos reais e feedback."
          }
        ]
      }
    }
  },
  "seo": {
    "siteTitle": "Leonardo Camargo Rossato | AI Engineering & Software Development",
    "metaDescription": "AI Engineer specializing in software development, intelligent systems architecture, LLM applications, RAG, hybrid retrieval, data engineering, mathematical optimization and quantum computing.",
    "ogTitle": "Leonardo Camargo Rossato | AI Engineering & Software Development",
    "ogDescription": "AI Engineer specializing in software development, intelligent systems architecture, LLM applications, RAG, hybrid retrieval, data engineering, mathematical optimization and quantum computing."
  }
} satisfies Pick<SiteContent,'home'|'about'|'siteSettings'|'seo'>
export const publishedContentSnapshot: SiteContent = {
  ...defaultContent,
  ...published,
  about: withOfficialProfile({...published.about,speakerPortfolioUrl:externalLinks.speaker}),
  cvUrl: officialCvUrl,
}
