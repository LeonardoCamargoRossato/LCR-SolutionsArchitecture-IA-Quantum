import type { Project } from '../domain/models/Project'
import type { ProjectInstitution } from '../domain/models/ProjectInstitution'

// Read-only export of the three visible public rows and four visible affiliations,
// 2026-11-26. Raw editorial text retained for provenance; approved main override
// applied separately. No private data, credentials or runtime network lookup.
export const selectedCaseSnapshot: readonly Project[] = [
  {
    "id": "foton-hub",
    "slug": "foton-hub",
    "title": "Foton Hub",
    "subtitle": "End-to-End Enterprise Platform",
    "category": "Enterprise Software / Microsoft Ecosystem",
    "status": "Private Platform",
    "description": "End-to-end enterprise platform for organizational governance, data and analytics, developed with React/TypeScript, SharePoint Framework (SPFx), SharePoint CLI, SharePoint data repositories, APIs and automated workflows.",
    "technologies": [
      "React",
      "TypeScript",
      "SPFx",
      "SharePoint Framework",
      "SharePoint CLI",
      "Microsoft 365",
      "SharePoint",
      "SharePoint Lists / Libraries",
      "APIs",
      "Automated Workflows",
      "GPT Integrations"
    ],
    "sections": {
      "role": [
        "End-to-end solution architecture and implementation across the application layer, Microsoft ecosystem integration, data access patterns, reusable components and AI-assisted knowledge access."
      ],
      "context": {
        "body": "Instituto Foton brings together people, organizations, projects, documents, links, tools and analytical environments. As this ecosystem grows, relying only on native Microsoft 365 interfaces makes navigation less intuitive and information increasingly dispersed.",
        "title": "Context"
      },
      "results": [
        "A unified institutional environment that reduces information fragmentation and supports modular expansion across governance, data, analytics and knowledge workflows."
      ],
      "approach": {
        "body": "The solution combines React and TypeScript front-end components with SharePoint Framework (SPFx) and native Microsoft 365 resources. Its modular implementation allows new pages, tools and integrations to be introduced without rebuilding the entire platform.",
        "title": "Approach & Implementation"
      },
      "features": [
        "Organizational governance",
        "People and organization management",
        "Projects and document access",
        "Links and internal tools",
        "Analytics environments",
        "Enterprise data and knowledge access",
        "Controlled GPT-assisted knowledge access"
      ],
      "overview": [
        "Foton Hub is an end-to-end enterprise platform for organizational governance, data and analytics inside the Microsoft ecosystem.",
        "It centralizes people, organizations, projects, documents, links, tools, analytics environments and institutional knowledge in a unified application layer over SharePoint and Microsoft 365."
      ],
      "solution": [
        "The platform creates a modular React/TypeScript and SPFx experience over SharePoint data repositories, APIs and automated workflows, hiding infrastructure complexity behind a coherent web interface.",
        "Controlled GPT integrations provide AI-assisted access to organizational knowledge and platform data."
      ],
      "challenge": [
        "Institutional information was distributed across multiple SharePoint lists, libraries, pages and internal resources, making navigation, governance and knowledge access harder for users."
      ],
      "advantages": "The solution reduces institutional information fragmentation and creates an organized application layer over the Microsoft 365 ecosystem.",
      "experience": {
        "body": "The homepage organizes navigation into major modules such as Ecosystem, Hub of Links, Administration and Analysis Lab. Users interact with filters, search, profiles, cards, QR Codes, tables, indicators and charts without dealing directly with SharePoint's underlying structure.",
        "title": "User Experience"
      },
      "properties": "Modular architecture, search, filters, profiles, member management, SharePoint lists, link library, QR Codes, analytical dashboards and administrative components.",
      "architecture": {
        "body": "The solution combines a React/TypeScript front end, SPFx integration, SharePoint lists and libraries, Microsoft 365 services, APIs, automated workflows and controlled GPT integrations.",
        "items": [
          "React / TypeScript",
          "SPFx / SharePoint Framework",
          "SharePoint CLI",
          "SharePoint data repositories",
          "APIs",
          "Automated workflows",
          "GPT integrations"
        ]
      },
      "technologies": [
        "React",
        "TypeScript",
        "SPFx",
        "SharePoint Framework",
        "SharePoint CLI",
        "Microsoft 365",
        "SharePoint",
        "APIs",
        "Automated Workflows",
        "GPT Integrations"
      ]
    },
    "links": {
      "institutionUrl": "https://institutofoton.com.br/"
    },
    "gallery": [],
    "order": 1,
    "sortOrder": 1,
    "visible": true,
    "placement": "main",
    "source": "main",
    "featured": true,
    "badge": "FEATURED",
    "theme": "default",
    "caseStudy": true,
    "caseEnabled": true,
    "isAcademic": false,
    "translations": {
      "pt-BR": {
        "title": "Foton Hub",
        "subtitle": "Plataforma Corporativa End-to-End",
        "category": "Software Corporativo / Ecossistema Microsoft",
        "status": "Private Platform",
        "description": "Plataforma corporativa end-to-end para governança organizacional, dados e analytics, desenvolvida com React/TypeScript, SharePoint Framework (SPFx), SharePoint CLI, repositórios de dados SharePoint, APIs e fluxos automatizados.",
        "technologies": [
          "React",
          "TypeScript",
          "SPFx",
          "SharePoint Framework",
          "SharePoint CLI",
          "Microsoft 365",
          "SharePoint",
          "SharePoint Lists / Libraries",
          "APIs",
          "Automated Workflows",
          "GPT Integrations"
        ],
        "sections": {
          "role": [
            "Arquitetura e implementação end-to-end da solução, incluindo camada de aplicação, integração com o ecossistema Microsoft, padrões de acesso a dados, componentes reutilizáveis e acesso ao conhecimento assistido por IA."
          ],
          "context": {
            "body": "O Instituto Foton reúne pessoas, organizações, projetos, documentos, links, ferramentas e ambientes de análise. À medida que o ecossistema cresce, organizar esses recursos apenas pelas interfaces nativas do Microsoft 365 torna a navegação menos intuitiva e aumenta a dispersão das informações.",
            "title": "Contexto"
          },
          "results": [
            "Um ambiente institucional unificado que reduz fragmentação de informações e permite expansão modular em governança, dados, analytics e fluxos de conhecimento."
          ],
          "approach": {
            "body": "A solução combina componentes front-end em React e TypeScript com o SharePoint Framework (SPFx) e os recursos nativos do Microsoft 365. A implementação foi organizada de maneira modular, permitindo que novas páginas, ferramentas e integrações sejam adicionadas sem reconstruir toda a plataforma.",
            "title": "Abordagem e implementação"
          },
          "features": [
            "Governança organizacional",
            "Gestão de pessoas e organizações",
            "Projetos e documentos",
            "Links e ferramentas internas",
            "Ambientes analíticos",
            "Dados corporativos e acesso ao conhecimento",
            "Acesso ao conhecimento assistido por GPT"
          ],
          "overview": [
            "O Foton Hub é uma plataforma corporativa end-to-end para governança organizacional, dados e analytics no ecossistema Microsoft.",
            "Centraliza pessoas, organizações, projetos, documentos, links, ferramentas, ambientes analíticos e conhecimento institucional em uma camada de aplicação unificada sobre SharePoint e Microsoft 365."
          ],
          "solution": [
            "A plataforma cria uma experiência modular em React/TypeScript e SPFx sobre repositórios de dados SharePoint, APIs e fluxos automatizados, escondendo a complexidade da infraestrutura atrás de uma interface web coerente.",
            "Integrações controladas com GPT oferecem acesso assistido por IA ao conhecimento organizacional e aos dados da plataforma."
          ],
          "challenge": [
            "As informações institucionais estavam distribuídas em múltiplas listas, bibliotecas, páginas e recursos internos do SharePoint, dificultando navegação, governança e acesso ao conhecimento."
          ],
          "advantages": "A solução reduz a fragmentação das informações institucionais e cria uma camada de aplicação organizada sobre o ecossistema Microsoft 365.",
          "experience": {
            "body": "A página inicial organiza a navegação em grandes módulos como Ecossistema, Hub de Links, Administração e Lab de Análises. O usuário interage com filtros, pesquisas, perfis, cards, QR Codes, tabelas, indicadores e gráficos sem precisar lidar diretamente com a estrutura técnica do SharePoint.",
            "title": "Experiência do usuário"
          },
          "properties": "Estrutura modular, busca, filtros, perfis, gestão de membros, listas SharePoint, biblioteca de links, QR Codes, dashboards analíticos e componentes administrativos.",
          "architecture": {
            "body": "A solução combina front-end React/TypeScript, integração SPFx, listas e bibliotecas SharePoint, serviços Microsoft 365, APIs, fluxos automatizados e integrações controladas com GPT.",
            "items": [
              "React / TypeScript",
              "SPFx / SharePoint Framework",
              "SharePoint CLI",
              "Repositórios SharePoint",
              "APIs",
              "Fluxos automatizados",
              "Integrações GPT"
            ]
          },
          "technologies": [
            "React",
            "TypeScript",
            "SPFx",
            "SharePoint Framework",
            "SharePoint CLI",
            "Microsoft 365",
            "SharePoint",
            "APIs",
            "Fluxos Automatizados",
            "Integrações GPT"
          ]
        }
      }
    }
  },
  {
    "id": "city-comparing",
    "slug": "cities-comparing",
    "title": "Cities Comparing",
    "subtitle": "Quantitative & Data Platform",
    "category": "Data Engineering / Quantitative Analysis",
    "status": "Research Software",
    "description": "Full-stack quantitative and data platform derived from MSc research for socioeconomic analysis, combining data engineering, PostgreSQL/SQL and CRUD, clustering, quantitative methods, statistical analysis and interactive visualization.",
    "technologies": [
      "Python",
      "PostgreSQL",
      "SQL",
      "CRUD",
      "Pandas",
      "Streamlit",
      "Jupyter",
      "scikit-learn",
      "Clustering",
      "Graph Algorithms",
      "Statistical Analysis",
      "Plotly",
      "Data Engineering"
    ],
    "sections": {
      "role": [
        "End-to-end research software development covering data preparation, quantitative analysis, algorithm development, validation and interactive visualization."
      ],
      "context": {
        "body": "The project originated from work developed during a Master's degree in Physics, particularly in econophysics, data analysis and complex systems. Part of this research required comparing cities, states, countries and macroregions from different statistical perspectives.",
        "title": "Context"
      },
      "results": [
        "A reusable analytical platform that transforms heterogeneous socioeconomic data into comparable, inspectable and reproducible quantitative workflows."
      ],
      "approach": [
        "The research workflow covered ETL, cleaning, standardization, integration, validation/QA, statistical modeling and reproducible analysis pipelines.",
        "Analytical methods included clustering, graph-based clustering, statistical inference and visual analytics."
      ],
      "features": [
        "Cross-country socioeconomic comparison",
        "Heterogeneous dataset integration",
        "Scatter and distribution analysis",
        "Clustering and graph-based methods",
        "Interactive visual analytics",
        "Reproducible research workflows"
      ],
      "overview": [
        "Cities Comparing is a quantitative and data platform derived from MSc research at UFRGS for socioeconomic analysis across heterogeneous datasets from Brazil, the United States and Latin America.",
        "It combines data engineering, quantitative methods, clustering, statistical analysis and interactive visualization in a browser-accessible analytical environment."
      ],
      "solution": {
        "body": "Cities Comparing transforms this research workflow into an interactive exploratory analysis platform. Different comparison and visualization methods are brought into a single interface so socioeconomic indicators can be investigated directly in the browser.",
        "title": "Solution"
      },
      "challenge": [
        "Socioeconomic datasets from different countries use different structures, scales and conventions, which makes direct comparison difficult without substantial cleaning, standardization, integration and validation."
      ],
      "advantages": "The platform makes complex socioeconomic datasets visually explorable and enables rapid switching between different analytical methods.",
      "experience": {
        "body": "Users choose the analysis type, locations and indicators and can change axes, variables and visualization methods. Scatter plots, binscatters, histograms, boxplots and regional analysis turn the application into a compact data-analysis laboratory accessible from the browser.",
        "title": "User Experience"
      },
      "properties": "Geographic comparison, scatter plots, binscatters, histograms, boxplots, DataFrames and scientific modules developed with Python and Jupyter Notebook.",
      "architecture": {
        "body": "The project connects Python/Jupyter research workflows to data processing, PostgreSQL/SQL and CRUD where implemented, and an interactive Streamlit interface for exploration and comparison.",
        "items": [
          "ETL / preprocessing",
          "PostgreSQL / SQL",
          "CRUD",
          "Clustering",
          "Graph-based methods",
          "Statistical analysis",
          "Streamlit / Plotly"
        ]
      },
      "technologies": [
        "Python",
        "PostgreSQL",
        "SQL",
        "CRUD",
        "Pandas",
        "Streamlit",
        "Jupyter",
        "scikit-learn",
        "Clustering",
        "Graph Algorithms",
        "Statistical Analysis",
        "Plotly",
        "Data Engineering"
      ]
    },
    "links": {
      "liveUrl": "https://analysis-socioeconomic-indicators.streamlit.app/",
      "githubUrl": "https://github.com/LeonardoCamargoRossato/Analysis_SocioEconomic_Indicator"
    },
    "gallery": [],
    "order": 2,
    "sortOrder": 2,
    "visible": true,
    "placement": "main",
    "source": "main",
    "featured": false,
    "theme": "default",
    "caseStudy": true,
    "caseEnabled": true,
    "isAcademic": false,
    "translations": {
      "pt-BR": {
        "title": "Cities Comparing",
        "subtitle": "Plataforma Quantitativa & de Dados",
        "category": "Engenharia de Dados / Análise Quantitativa",
        "status": "Research Software",
        "description": "Plataforma full-stack quantitativa e de dados derivada da pesquisa de mestrado para análise socioeconômica, combinando engenharia de dados, PostgreSQL/SQL e CRUD, clustering, métodos quantitativos, análise estatística e visualização interativa.",
        "technologies": [
          "Python",
          "PostgreSQL",
          "SQL",
          "CRUD",
          "Pandas",
          "Streamlit",
          "Jupyter",
          "scikit-learn",
          "Clustering",
          "Graph Algorithms",
          "Statistical Analysis",
          "Plotly",
          "Data Engineering"
        ],
        "sections": {
          "role": [
            "Desenvolvimento end-to-end do software de pesquisa, cobrindo preparação de dados, análise quantitativa, desenvolvimento de algoritmos, validação e visualização interativa."
          ],
          "context": {
            "body": "O projeto surgiu de trabalhos realizados durante o mestrado em Física, especialmente nas áreas de econofísica, análise de dados e sistemas complexos. Parte dessas análises precisava comparar cidades, estados, países e macrorregiões por diferentes perspectivas estatísticas.",
            "title": "Contexto"
          },
          "results": [
            "Uma plataforma analítica reutilizável que transforma dados socioeconômicos heterogêneos em fluxos quantitativos comparáveis, inspecionáveis e reprodutíveis."
          ],
          "approach": [
            "O fluxo de pesquisa envolveu ETL, limpeza, padronização, integração, validação/QA, modelagem estatística e pipelines reprodutíveis de análise.",
            "Os métodos analíticos incluem clustering, clustering baseado em grafos, inferência estatística e análise visual."
          ],
          "features": [
            "Comparação socioeconômica entre países",
            "Integração de bases heterogêneas",
            "Análises de dispersão e distribuição",
            "Clustering e métodos baseados em grafos",
            "Análise visual interativa",
            "Fluxos reprodutíveis de pesquisa"
          ],
          "overview": [
            "O Cities Comparing é uma plataforma quantitativa e de dados derivada da pesquisa de mestrado na UFRGS para análise socioeconômica de bases heterogêneas do Brasil, Estados Unidos e América Latina.",
            "Combina engenharia de dados, métodos quantitativos, clustering, análise estatística e visualização interativa em um ambiente analítico acessível pelo navegador."
          ],
          "solution": {
            "body": "Cities Comparing transforma esse fluxo de pesquisa em uma plataforma interativa de análise exploratória. A ferramenta reúne diferentes formas de comparação e visualização em uma mesma interface, permitindo investigar indicadores socioeconômicos diretamente pelo navegador.",
            "title": "Solução"
          },
          "challenge": [
            "Bases socioeconômicas de diferentes países usam estruturas, escalas e convenções distintas, dificultando comparações diretas sem limpeza, padronização, integração e validação."
          ],
          "advantages": "A plataforma permite explorar bases socioeconômicas complexas visualmente e alternar rapidamente entre diferentes métodos de análise.",
          "experience": {
            "body": "O usuário escolhe o tipo de análise, seleciona localidades e indicadores e pode modificar eixos, variáveis e métodos de visualização. Scatter plots, binscatters, histogramas, boxplots e análises regionais transformam a aplicação em um pequeno laboratório de análise de dados acessível pelo navegador.",
            "title": "Experiência do usuário"
          },
          "properties": "Comparação geográfica, scatter plots, binscatters, histogramas, boxplots, DataFrames e módulos científicos desenvolvidos em Python e Jupyter Notebook.",
          "architecture": {
            "body": "O projeto conecta fluxos de pesquisa em Python/Jupyter ao processamento de dados, PostgreSQL/SQL e CRUD onde implementados, além de uma interface Streamlit interativa para exploração e comparação.",
            "items": [
              "ETL / pré-processamento",
              "PostgreSQL / SQL",
              "CRUD",
              "Clustering",
              "Métodos baseados em grafos",
              "Análise estatística",
              "Streamlit / Plotly"
            ]
          },
          "technologies": [
            "Python",
            "PostgreSQL",
            "SQL",
            "CRUD",
            "Pandas",
            "Streamlit",
            "Jupyter",
            "scikit-learn",
            "Clustering",
            "Algoritmos em Grafos",
            "Análise Estatística",
            "Plotly",
            "Engenharia de Dados"
          ]
        }
      }
    }
  },
  {
    "id": "animefinder",
    "slug": "animefinder",
    "title": "AnimeFinder",
    "subtitle": "AI-Powered Discovery & Hybrid Retrieval Platform",
    "category": "AI Engineering / RAG / Intelligent Search Systems",
    "status": "Live",
    "description": "An AI-powered discovery and personal knowledge platform combining LLMs, semantic retrieval, structured database queries, statistical analysis, and hybrid query routing. Built around Gemini-based reasoning, Supabase/PostgreSQL, pgvector embeddings and evidence-grounded responses.",
    "technologies": [
      "LLMs",
      "RAG",
      "Hybrid Retrieval",
      "pgvector",
      "Gemini API",
      "React",
      "TypeScript",
      "Supabase",
      "PostgreSQL",
      "Edge Functions"
    ],
    "sections": {
      "role": [
        "Solution architecture, implementation of the web application, Supabase integration, search/routing flows and AI-assisted validation."
      ],
      "results": [
        "Repository contains the described frontend and Edge Function implementations. Both Edge Functions are deployed and Self-Knowledge tables exist; end-to-end model accuracy, throughput and business metrics were not independently measured."
      ],
      "features": [
        "Private catalog and watched exclusions",
        "Search filters and provider-based recommendations",
        "Hamlet AI conversational intent",
        "Self-Knowledge query classification and statistical analysis",
        "Derived embeddings and semantic retrieval",
        "Authenticated Edge Functions and bounded evidence"
      ],
      "overview": [
        "AnimeFinder is a private anime discovery/catalog and personal knowledge platform built with React/TypeScript and Supabase; Jikan/MyAnimeList provides public anime metadata.",
        "Its AI layer consists of Hamlet AI conversational intent and a Self-Knowledge retrieval engine backed by authenticated Edge Functions."
      ],
      "solution": [
        "Classify questions into structured, statistical, semantic or hybrid routes. The authenticated SelfKnowledgeService and Supabase Edge Function build bounded evidence from normalized master data and derived semantic documents.",
        "The separate Hamlet AI search service translates model intent into real provider queries and watched exclusions."
      ],
      "challenge": [
        "Combine structured catalog information, personal statistics, semantic notes and language-model reasoning while keeping private content protected."
      ],
      "architecture": {
        "body": [
          "User Query → Query Classification → Structured / Statistical / Semantic Retrieval → Evidence Package → Gemini LLM → Contextual Response.",
          "PostgreSQL master data plus derived pgvector/HNSW knowledge index; Supabase Edge Functions hamlet-ai and hamlet-self-knowledge provide secure AI orchestration."
        ],
        "items": [
          "React / TypeScript / Vite",
          "Supabase Auth / Edge Functions",
          "PostgreSQL and pgvector/HNSW",
          "Embeddings / Semantic Retrieval",
          "Statistical Analysis / Hybrid Query Routing",
          "Gemini LLM",
          "Evidence-grounded Response"
        ]
      }
    },
    "links": {
      "liveUrl": "https://leonardocamargorossato.github.io/AnimeFinder/",
      "githubUrl": "https://github.com/LeonardoCamargoRossato/AnimeFinder"
    },
    "gallery": [],
    "order": 3,
    "sortOrder": 3,
    "visible": true,
    "placement": "main",
    "source": "main",
    "featured": true,
    "theme": "default",
    "caseStudy": true,
    "caseEnabled": true,
    "isAcademic": false,
    "translations": {
      "pt-BR": {
        "title": "AnimeFinder",
        "subtitle": "Plataforma de Descoberta com IA e Recuperação Híbrida",
        "category": "Engenharia de IA / RAG / Sistemas de Busca Inteligente",
        "status": "Live",
        "description": "Plataforma inteligente de descoberta e conhecimento pessoal que combina LLMs, recuperação semântica, consultas estruturadas em bancos de dados, análise estatística e roteamento híbrido de consultas. Sua arquitetura integra Gemini, Supabase/PostgreSQL, embeddings com pgvector e respostas fundamentadas em evidências.",
        "technologies": [
          "LLMs",
          "RAG",
          "Hybrid Retrieval",
          "pgvector",
          "Gemini API",
          "React",
          "TypeScript",
          "Supabase",
          "PostgreSQL",
          "Edge Functions"
        ],
        "sections": {
          "role": [
            "Concepção arquitetural, implementação web, integração Supabase, fluxos de busca/roteamento e validação assistida por IA."
          ],
          "results": [
            "Repositório contém frontend e Edge Functions descritos. As funções estão implantadas e as tabelas de autoconhecimento existem; acurácia, capacidade de resposta e métricas comerciais não foram aferidas de ponta a ponta."
          ],
          "features": [
            "Catálogo privado e exclusão de assistidos",
            "Filtros e recomendações de catálogo real",
            "Hamlet AI e classificação de intenções",
            "Autoconhecimento e análise estatística",
            "Embeddings derivados e busca semântica",
            "Edge Functions autenticadas e evidências limitadas"
          ],
          "overview": [
            "AnimeFinder combina descoberta e catálogo privado de animes com um sistema de conhecimento pessoal, usando React/TypeScript, Supabase e metadados públicos Jikan/MyAnimeList.",
            "A camada de IA reúne Hamlet AI para intenções conversacionais e um mecanismo de autoconhecimento via Edge Functions autenticadas."
          ],
          "solution": [
            "Classificar questões em rotas estruturadas, estatísticas, semânticas ou híbridas. SelfKnowledgeService e Edge Function montam evidências limitadas a partir de dados normalizados e documentos derivados.",
            "O serviço separado de descoberta traduz intenções em buscas reais e exclui animes assistidos."
          ],
          "challenge": [
            "Integrar dados estruturados, estatísticas pessoais, notas semânticas e respostas com LLMs protegendo o conteúdo privado."
          ],
          "architecture": {
            "body": [
              "Pergunta → Classificação → Recuperação Estruturada / Estatística / Semântica → Pacote de Evidências → Gemini LLM → Resposta Contextual.",
              "Dados PostgreSQL e índice de conhecimento pgvector/HNSW; Edge Functions hamlet-ai e hamlet-self-knowledge orquestram chamadas seguras de IA."
            ],
            "items": [
              "React / TypeScript / Vite",
              "Supabase Auth / Edge Functions",
              "PostgreSQL e pgvector/HNSW",
              "Embeddings / Recuperação Semântica",
              "Análise Estatística / Roteamento Híbrido",
              "Gemini LLM",
              "Resposta Fundamentada em Evidências"
            ]
          }
        }
      }
    }
  }
]
export const selectedInstitutionSnapshot: readonly ProjectInstitution[] = [
  {
    "id": "7431ac59-62e3-46f0-acf7-a9d9c4dc28d4",
    "projectId": "city-comparing",
    "projectSource": "projects",
    "institutionName": "Instituto Pense+",
    "institutionLogoUrl": "assets/institutions/svg/instituto-pense-mais.svg",
    "institutionUrl": "https://institutopensemais.com/",
    "sortOrder": 1,
    "visible": true
  },
  {
    "id": "c71b072f-3b2d-4187-8413-cd38a108d76d",
    "projectId": "city-comparing",
    "projectSource": "projects",
    "institutionName": "Instituto de Física - UFRGS",
    "institutionLogoUrl": "assets/institutions/svg/instituto-fisica-ufrgs.svg",
    "institutionUrl": "https://www.if.ufrgs.br/",
    "sortOrder": 2,
    "visible": true
  },
  {
    "id": "2b85d8be-573b-42f6-9771-eef890c3b12b",
    "projectId": "city-comparing",
    "projectSource": "projects",
    "institutionName": "UFRGS",
    "institutionLogoUrl": "assets/institutions/svg/ufrgs.svg",
    "institutionUrl": "https://www.ufrgs.br/",
    "sortOrder": 3,
    "visible": true
  },
  {
    "id": "667e9371-48a9-4510-b9a2-2903e7216d21",
    "projectId": "foton-hub",
    "projectSource": "projects",
    "institutionName": "Logo Foton - Azul",
    "institutionLogoUrl": "assets/institutions/svg/instituto-foton.svg",
    "sortOrder": 1,
    "visible": true
  }
]
