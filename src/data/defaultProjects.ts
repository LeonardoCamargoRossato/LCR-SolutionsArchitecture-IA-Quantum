import type { Project } from '../domain/models/Project'
import { citiesComparingContent } from './citiesComparing'
import { animeFinderProject } from './animeFinderProject'
import { ce235Project } from './ce235Project'
import { metCompBProject } from './metCompBProject'
import { embeddedControlProject } from './embeddedControlProject'
import { webSeerProject } from './webSeerProject'

const ph = (name: string, url: string) => ({
  id: `default-${name}`,
  url,
  path: url,
  name,
  mimeType: url.endsWith('.png') ? 'image/png' : 'image/svg+xml',
  category: 'Projects' as const,
  imageType: 'illustrative-placeholder' as const,
})

export const defaultProjects: Project[] = [
  {
    id: 'foton-hub',
    slug: 'foton-hub',
    title: 'Foton Hub',
    subtitle: 'End-to-End Enterprise Platform',
    category: 'Enterprise Software / Microsoft Ecosystem',
    status: 'Private Platform',
    description: 'End-to-end enterprise platform for organizational governance, data and analytics, developed with React/TypeScript, SharePoint Framework (SPFx), SharePoint CLI, SharePoint data repositories, APIs and automated workflows.',
    technologies: ['React', 'TypeScript', 'SPFx', 'SharePoint Framework', 'SharePoint CLI', 'Microsoft 365', 'SharePoint', 'SharePoint Lists / Libraries', 'APIs', 'Automated Workflows', 'GPT Integrations'],
    coverImage: ph('foton-hub', './projects/foton-hub.svg'),
    imageType: 'illustrative-placeholder',
    sections: {
      overview: [
        'Foton Hub is an end-to-end enterprise platform for organizational governance, data and analytics inside the Microsoft ecosystem.',
        'It centralizes people, organizations, projects, documents, links, tools, analytics environments and institutional knowledge in a unified application layer over SharePoint and Microsoft 365.',
      ],
      challenge: [
        'Institutional information was distributed across multiple SharePoint lists, libraries, pages and internal resources, making navigation, governance and knowledge access harder for users.',
      ],
      solution: [
        'The platform creates a modular React/TypeScript and SPFx experience over SharePoint data repositories, APIs and automated workflows, hiding infrastructure complexity behind a coherent web interface.',
        'Controlled GPT integrations provide AI-assisted access to organizational knowledge and platform data.',
      ],
      architecture: {
        body: 'The solution combines a React/TypeScript front end, SPFx integration, SharePoint lists and libraries, Microsoft 365 services, APIs, automated workflows and controlled GPT integrations.',
        items: ['React / TypeScript', 'SPFx / SharePoint Framework', 'SharePoint CLI', 'SharePoint data repositories', 'APIs', 'Automated workflows', 'GPT integrations'],
      },
      features: [
        'Organizational governance',
        'People and organization management',
        'Projects and document access',
        'Links and internal tools',
        'Analytics environments',
        'Enterprise data and knowledge access',
        'Controlled GPT-assisted knowledge access',
      ],
      role: [
        'End-to-end solution architecture and implementation across the application layer, Microsoft ecosystem integration, data access patterns, reusable components and AI-assisted knowledge access.',
      ],
      results: [
        'A unified institutional environment that reduces information fragmentation and supports modular expansion across governance, data, analytics and knowledge workflows.',
      ],
      technologies: ['React', 'TypeScript', 'SPFx', 'SharePoint Framework', 'SharePoint CLI', 'Microsoft 365', 'SharePoint', 'APIs', 'Automated Workflows', 'GPT Integrations'],
    },
    links: { institutionUrl: 'https://institutofoton.com.br/' },
    gallery: [],
    order: 1,
    sortOrder: 1,
    placement: 'main',
    source: 'main',
    visible: true,
    featured: true,
    badge: 'FEATURED',
    caseStudy: true,
    caseEnabled: true,
    translations: {
      'pt-BR': {
        subtitle: 'Plataforma Corporativa End-to-End',
        category: 'Software Corporativo / Ecossistema Microsoft',
        description: 'Plataforma corporativa end-to-end para governança organizacional, dados e analytics, desenvolvida com React/TypeScript, SharePoint Framework (SPFx), SharePoint CLI, repositórios de dados SharePoint, APIs e fluxos automatizados.',
        sections: {
          overview: [
            'O Foton Hub é uma plataforma corporativa end-to-end para governança organizacional, dados e analytics no ecossistema Microsoft.',
            'Centraliza pessoas, organizações, projetos, documentos, links, ferramentas, ambientes analíticos e conhecimento institucional em uma camada de aplicação unificada sobre SharePoint e Microsoft 365.',
          ],
          challenge: [
            'As informações institucionais estavam distribuídas em múltiplas listas, bibliotecas, páginas e recursos internos do SharePoint, dificultando navegação, governança e acesso ao conhecimento.',
          ],
          solution: [
            'A plataforma cria uma experiência modular em React/TypeScript e SPFx sobre repositórios de dados SharePoint, APIs e fluxos automatizados, escondendo a complexidade da infraestrutura atrás de uma interface web coerente.',
            'Integrações controladas com GPT oferecem acesso assistido por IA ao conhecimento organizacional e aos dados da plataforma.',
          ],
          architecture: {
            body: 'A solução combina front-end React/TypeScript, integração SPFx, listas e bibliotecas SharePoint, serviços Microsoft 365, APIs, fluxos automatizados e integrações controladas com GPT.',
            items: ['React / TypeScript', 'SPFx / SharePoint Framework', 'SharePoint CLI', 'Repositórios SharePoint', 'APIs', 'Fluxos automatizados', 'Integrações GPT'],
          },
          features: [
            'Governança organizacional',
            'Gestão de pessoas e organizações',
            'Projetos e documentos',
            'Links e ferramentas internas',
            'Ambientes analíticos',
            'Dados corporativos e acesso ao conhecimento',
            'Acesso ao conhecimento assistido por GPT',
          ],
          role: [
            'Arquitetura e implementação end-to-end da solução, incluindo camada de aplicação, integração com o ecossistema Microsoft, padrões de acesso a dados, componentes reutilizáveis e acesso ao conhecimento assistido por IA.',
          ],
          results: [
            'Um ambiente institucional unificado que reduz fragmentação de informações e permite expansão modular em governança, dados, analytics e fluxos de conhecimento.',
          ],
          technologies: ['React', 'TypeScript', 'SPFx', 'SharePoint Framework', 'SharePoint CLI', 'Microsoft 365', 'SharePoint', 'APIs', 'Fluxos Automatizados', 'Integrações GPT'],
        },
      },
    },
  },

  {
    id: 'city-comparing',
    slug: 'cities-comparing',
    title: 'Cities Comparing',
    ...citiesComparingContent,
    status: 'Live',
    coverImage: {
      id: 'cities-comparing-graphical-abstract',
      url: './projects/cities-comparing/graphical-abstract-card.webp',
      path: './projects/cities-comparing/graphical-abstract-card.webp',
      name: 'Cities Comparing graphical abstract',
      mimeType: 'image/webp',
      category: 'Projects',
      altText: 'Graphical abstract for the Cities Comparing research platform',
      imageType: 'real-screenshot',
      previewUrl: './projects/cities-comparing/graphical-abstract-preview.webp',
      thumbnailUrl: './projects/cities-comparing/graphical-abstract-thumb.webp',
      cardUrl: './projects/cities-comparing/graphical-abstract-card.webp',
      fullUrl: './projects/cities-comparing/graphical-abstract-full.webp',
    },
    imageType: 'real-screenshot',
    gallery: [],
    order: 2,
    sortOrder: 2,
    placement: 'main',
    source: 'main',
    visible: true,
    caseStudy: true,
    caseEnabled: true,
  },

  animeFinderProject,

  {
    id: 'hamlet',
    slug: 'hamlet',
    title: 'Hamlet — Narrative Universe',
    subtitle: 'RAG-Powered Knowledge & Content Platform',
    category: 'Applied AI / RAG / Knowledge Systems',
    status: 'Live',
    description: 'Full-stack literary knowledge platform combining React/TypeScript, Supabase content management and a contextual AI chatbot. A dedicated Edge Function retrieves relevant knowledge chunks, adds verified catalog context and returns source references.',
    technologies: ['React', 'TypeScript', 'Supabase', 'RAG', 'AI Chatbot', 'Semantic Retrieval', 'Edge Functions', 'Knowledge Integration'],
    coverImage: ph('hamlet', './projects/hamlet.svg'),
    imageType: 'illustrative-placeholder',
    sections: {
      overview: [
        'Hamlet — Sociedade Ideal is a full-stack platform for digital publications, characters, media galleries, content management and contextual AI-assisted reader interactions.',
        'This is a separate system from the Hamlet AI module inside AnimeFinder; their repositories and data stores are independent.',
      ],
      challenge: [
        'Make narrative documents, characters, content and references accessible without losing their relationship to verified sources.',
      ],
      solution: [
        'React/TypeScript interfaces connect to Supabase database, storage and protected administration. The hamlet-chat Edge Function uses a semantic match_knowledge retrieval step and injects relevant publication/character catalog items before sending a bounded prompt to the AI gateway.',
        'The response includes source references, allowing the reader to follow the retrieved evidence. This description reflects the implemented code; experimental multi-agent/fine-tuning work is not claimed as shipped.',
      ],
      architecture: {
        body: 'Reader question → intent detection → semantic retrieval (knowledge_chunks / match_knowledge) + relevant publication/character catalog → grounded prompt → model gateway → response with source references.',
        items: ['React / TypeScript / Vite', 'Supabase Auth / DB / Storage', 'hamlet-chat Edge Function', 'Semantic RAG + catalog enrichment', 'AI model gateway', 'Source references', 'Admin knowledge/content management'],
      },
      features: [
        'Contextual chatbot and retrieval of narrative knowledge',
        'Knowledge ingestion and content administration',
        'Document / booklet library, character catalog and galleries',
        'Semantic retrieval through match_knowledge',
        'Supabase integration and protected administration',
        'Source references attached to the chatbot response',
      ],
      role: [
        'Full-stack platform architecture, modular frontend, data/service integration and AI-enabled knowledge interactions.',
      ],
      results: [
        'Repository-verified web platform and chatbot integration with source-aware response contracts. No unsupported accuracy or commercial metrics are claimed.',
      ],
      technologies: ['React', 'TypeScript', 'Supabase', 'RAG', 'Semantic Retrieval', 'Edge Functions'],
    },
    links: {
      liveUrl: 'https://hamlet-sociedade-ideal.lovable.app/',
      githubUrl: 'https://github.com/LeonardoCamargoRossato/Hamlet-Digital-Platform',
    },
    gallery: [],
    order: 1,
    sortOrder: 1,
    placement: 'more',
    source: 'main',
    visible: true,
    caseStudy: true,
    caseEnabled: true,
    translations: {
      'pt-BR': {
        title: 'Hamlet — Universo Narrativo',
        subtitle: 'Plataforma de Conhecimento e Conteúdo com RAG',
        category: 'IA Aplicada / RAG / Sistemas de Conhecimento',
        description: 'Plataforma literária full-stack com React/TypeScript, gerenciamento de conteúdo no Supabase e chatbot contextual. Uma Edge Function recupera fragmentos de conhecimento, complementa o contexto do catálogo e devolve referências das fontes.',
        sections: {
          overview: [
            'Hamlet — Sociedade Ideal é uma plataforma de publicações digitais, personagens, galerias, gerenciamento de conteúdo e interações contextualizadas com IA.',
            'Este é um sistema independente do módulo Hamlet AI presente no AnimeFinder; os repositórios e bancos não são compartilhados.',
          ],
          challenge: [
            'Permitir acesso contextual a documentos, personagens e referências da narrativa, mantendo vínculos com fontes verificáveis.',
          ],
          solution: [
            'Interfaces React/TypeScript utilizam banco, storage e administração protegida do Supabase. A função hamlet-chat consulta match_knowledge e adiciona contexto do catálogo de personagens/publicações ao prompt antes de chamar o modelo.',
            'O retorno possui referências às fontes recuperadas. Não são apresentados agentes multiagentes ou fine-tuning experimentais como funcionalidades concluídas.',
          ],
          architecture: {
            body: 'Pergunta → detecção de intenção → recuperação semântica (knowledge_chunks / match_knowledge) + catálogo → prompt contextualizado → modelo de IA → resposta com referências.',
            items: ['React / TypeScript / Vite', 'Supabase Auth / Banco / Storage', 'Edge Function hamlet-chat', 'RAG semântico e catálogo', 'Gateway de IA', 'Referências das fontes', 'Administração de conteúdo'],
          },
          features: [
            'Chatbot contextualizado com recuperação de conhecimento',
            'Ingestão e gestão de conhecimento',
            'Biblioteca de publicações e catálogo de personagens',
            'Busca semântica por match_knowledge',
            'Integração Supabase e administração protegida',
            'Resposta com referências das fontes',
          ],
          role: ['Arquitetura full-stack, frontend modular, integração de dados/serviços e interações com IA e conhecimento.'],
          results: ['Plataforma web e contrato de resposta com fontes verificados no código, sem métricas comerciais ou de acurácia não comprovadas.'],
          technologies: ['React', 'TypeScript', 'Supabase', 'RAG', 'Recuperação Semântica', 'Edge Functions'],
        },
      },
    },
  },

  {
    id: 'speaker-portfolio',
    slug: 'speaker-portfolio',
    title: 'Speaking Portfolio',
    subtitle: 'Leonardo Camargo Rossato',
    category: 'Scientific Communication / Professional Portfolio',
    status: 'Live',
    description: 'Professional speaking portfolio documenting 50+ in-person talks delivered from 2023–2026 across Brazil’s five macro-regions, covering real-world quantum applications, AI and emerging technologies, security/PQC, decision-making and innovation ecosystems.',
    technologies: ['React', 'Responsive Web', 'Media Galleries', 'Content Management', 'Professional Portfolio'],
    coverImage: ph('speaker-portfolio', './projects/speaker-portfolio.svg'),
    imageType: 'illustrative-placeholder',
    sections: {
      overview: [
        'A professional speaking portfolio documenting scientific communication, technical talks, panels, invited lectures and event participation across Brazil.',
        'The broader speaking record includes 50+ in-person talks delivered from 2023–2026 across Brazil’s five macro-regions; the website gallery is a curated subset of that record.',
      ],
      context: [
        'Topics include real-world quantum applications, AI and emerging technologies, security/PQC, decision-making and innovation ecosystem development.',
      ],
      features: [
        'South Summit 2026 panel participation',
        'RNP Forum 2026 in Brasília',
        'Quantum talk at ALESP',
        'Invited keynote lectures',
        'Graduate-level classes at Brazilian universities',
        '15+ events / technical tracks organized, coordinated or curated',
      ],
      role: [
        'Scientific and technical communication connecting research, emerging technologies, industry and innovation ecosystems.',
      ],
      technologies: ['React', 'Responsive Web', 'Media Galleries', 'Content Management', 'Professional Portfolio'],
    },
    links: { liveUrl: 'https://leonardocamargorossato.github.io/LCR-Speaking-Portfolio/' },
    gallery: [],
    order: 4,
    sortOrder: 4,
    placement: 'more',
    source: 'main',
    visible: true,
    caseStudy: true,
    caseEnabled: true,
    translations: {
      'pt-BR': {
        title: 'Portfólio de Palestras',
        subtitle: 'Leonardo Camargo Rossato',
        category: 'Comunicação Científica / Portfólio Profissional',
        description: 'Portfólio profissional de palestras documentando 50+ apresentações presenciais realizadas entre 2023–2026 nas cinco macrorregiões do Brasil, cobrindo aplicações quânticas reais, IA e tecnologias emergentes, segurança/PQC, tomada de decisão e ecossistemas de inovação.',
        sections: {
          overview: [
            'Portfólio profissional de palestras que documenta comunicação científica, apresentações técnicas, painéis, aulas convidadas e participações em eventos pelo Brasil.',
            'O histórico mais amplo inclui 50+ palestras presenciais entre 2023–2026 nas cinco macrorregiões do país; a galeria do site representa apenas uma seleção desse histórico.',
          ],
          context: [
            'Os temas incluem aplicações quânticas reais, IA e tecnologias emergentes, segurança/PQC, tomada de decisão e desenvolvimento de ecossistemas de inovação.',
          ],
          features: [
            'Painelista no South Summit 2026',
            'RNP Forum 2026 em Brasília',
            'Palestra sobre Quantum na ALESP',
            'Keynotes e palestras convidadas',
            'Aulas em nível de pós-graduação em universidades brasileiras',
            '15+ eventos / trilhas técnicas organizados, coordenados ou curados',
          ],
          role: [
            'Comunicação científica e técnica conectando pesquisa, tecnologias emergentes, indústria e ecossistemas de inovação.',
          ],
          technologies: ['React', 'Web Responsiva', 'Galerias de Mídia', 'Gestão de Conteúdo', 'Portfólio Profissional'],
        },
      },
    },
  },
]

export const defaultMoreProjects: Project[] = [
  ce235Project,
  embeddedControlProject,
  {
    id: 'streamlit-tools',
    slug: 'streamlit-tools',
    title: 'Streamlit Tools',
    category: 'Data Utilities',
    status: 'Case Study in Progress',
    description: 'Collection of focused Python/Streamlit utilities for data processing, analysis and small interactive workflows.',
    technologies: ['Python', 'Streamlit', 'Data Applications'],
    coverImage: ph('streamlit-tools', './projects/streamlit-tools.png'),
    imageType: 'illustrative-placeholder',
    sections: {},
    links: {},
    gallery: [],
    order: 12,
    sortOrder: 12,
    placement: 'more',
    source: 'more',
    visible: true,
    caseStudy: false,
    caseEnabled: true,
  },
  webSeerProject,
  metCompBProject,
]
