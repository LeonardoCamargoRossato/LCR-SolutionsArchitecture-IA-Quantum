import type { Project } from '../domain/models/Project'

/**
 * Technical case curated from the AnimeFinder repository (November 2026).
 * The UI is account-restricted. Publish only owner-supplied, privacy-
 * reviewed screenshots. Original PNG/WebP assets are activated atomically
 * by the shared manifest gate; this fallback remains until they are deployed.
 * Browser-facing code and the deployed Edge Functions are verifiable; this
 * case does not claim unverified production throughput, model quality or ROI.
 */
export const animeFinderProject: Project = {
  id: 'animefinder',
  slug: 'animefinder',
  title: 'AnimeFinder',
  subtitle: 'AI-Powered Discovery & Hybrid Retrieval Platform',
  category: 'AI Engineering / RAG / Intelligent Search Systems',
  status: 'Live',
  description: 'An AI-powered discovery and personal knowledge platform combining LLMs, semantic retrieval, structured database queries, statistical analysis, and hybrid query routing. Its architecture integrates Gemini reasoning, Supabase/PostgreSQL, pgvector embeddings and evidence-grounded answers.',
  technologies: ['LLMs', 'RAG', 'Hybrid Retrieval', 'pgvector', 'Gemini API', 'React', 'TypeScript', 'Supabase', 'PostgreSQL', 'Edge Functions'],
  coverImage: {
    id: 'animefinder-brand-cover',
    url: './projects/animefinder/animefinder-brand.svg',
    path: './projects/animefinder/animefinder-brand.svg',
    name: 'AnimeFinder — branded cover, not an application screenshot',
    mimeType: 'image/svg+xml',
    category: 'Projects',
    imageType: 'illustrative-placeholder',
  },
  imageType: 'illustrative-placeholder',
  sections: {
    overview: [
      'AnimeFinder combines a private anime discovery/catalog interface with Hamlet AI, an AI-assisted conversation experience, and a personal Self-Knowledge engine. Public anime metadata comes from Jikan/MyAnimeList while private catalog data is held in Supabase.',
      'The codebase provides a React/TypeScript web interface and authenticated Supabase Edge Functions; the user interface requires authorized account access.',
    ],
    challenge: [
      'Different questions require different evidence: a structured catalog lookup, a statistical comparison of saved works, or semantic retrieval over personal notes and character descriptions. A single generic prompt cannot reliably provide all of these.',
      'Keep private preferences and conversations protected while giving the language model a bounded, traceable evidence package.',
    ],
    solution: [
      'A deterministic query classifier routes requests to structured, statistical, semantic or hybrid analysis. The SelfKnowledgeService calls an authenticated Edge Function, which builds evidence from the normalized personal catalog and derived semantic documents.',
      'The reasoning layer receives only bounded retrieved evidence. Anime discovery also uses a separate Hamlet search service that turns generated intent into real catalog queries, not invented recommendations.',
    ],
    architecture: {
      body: [
        '1. User Query → 2. Query Classification → 3. Structured / Statistical / Semantic Retrieval → 4. Evidence Package → 5. Gemini LLM → 6. Contextual Response.',
        'The browser-facing SelfKnowledgeService invokes the hamlet-self-knowledge Edge Function. Server-side orchestration connects normalized PostgreSQL master data, statistical aggregations and derived pgvector documents indexed by HNSW. The separate hamlet-ai Edge Function handles conversational intent and Gemini model fallbacks.',
      ],
      items: [
        'React + TypeScript / Vite frontend',
        'Supabase Auth and Edge Functions',
        'PostgreSQL normalized personal catalog',
        'Embeddings derived from personal knowledge',
        'pgvector + HNSW for semantic retrieval',
        'Structured, statistical, semantic and hybrid query routing',
        'Evidence package → Gemini generation',
      ],
    },
    features: [
      'Anime search with filters and watched exclusions',
      'Authenticated personal catalog and structured metadata',
      'Hamlet AI conversation and intent classification',
      'Self-Knowledge analysis of user-provided personal data',
      'Vector embeddings and semantic retrieval of derived documents',
      'Statistical analysis of rankings, statuses and preferences',
      'Source-linked evidence for contextual responses',
    ],
    role: [
      'System architecture, application development, Supabase integration, AI-assisted retrieval flows and iterative validation within the personal research/software project.',
    ],
    results: [
      'Repository evidence: React discovery workflow, authenticated catalog, search service and Self-Knowledge service/Edge Function are implemented.',
      'Supabase evidence: the hamlet-ai and hamlet-self-knowledge functions are deployed, and personal-knowledge database structures exist. This does not establish the accuracy or availability of any individual Gemini response.',
      'No fabricated performance, adoption or business metrics.',
    ],
  },
  links: {
    liveUrl: 'https://leonardocamargorossato.github.io/AnimeFinder/',
    githubUrl: 'https://github.com/LeonardoCamargoRossato/AnimeFinder',
  },
  gallery: [],
  order: 3,
  sortOrder: 3,
  placement: 'main',
  source: 'main',
  visible: true,
  featured: true,
  caseStudy: true,
  caseEnabled: true,
  translations: {
    'pt-BR': {
      title: 'AnimeFinder',
      subtitle: 'Plataforma de Descoberta com IA e Recuperação Híbrida',
      category: 'Engenharia de IA / RAG / Sistemas de Busca Inteligente',
      description: 'Plataforma inteligente de descoberta e conhecimento pessoal que combina LLMs, recuperação semântica, consultas estruturadas, análise estatística e roteamento híbrido de consultas. Sua arquitetura integra Gemini, Supabase/PostgreSQL, embeddings com pgvector e respostas fundamentadas em evidências.',
      technologies: ['LLMs', 'RAG', 'Recuperação Híbrida', 'pgvector', 'Gemini API', 'React', 'TypeScript', 'Supabase', 'PostgreSQL', 'Edge Functions'],
      sections: {
        overview: [
          'AnimeFinder combina uma interface privada de descoberta e catálogo de animes com o chatbot Hamlet AI e um motor de autoconhecimento. Os metadados públicos vêm do Jikan/MyAnimeList; o catálogo pessoal permanece no Supabase.',
          'O repositório disponibiliza interface React/TypeScript e Edge Functions autenticadas. O acesso à aplicação é restrito a contas autorizadas.',
        ],
        challenge: [
          'Perguntas diferentes exigem evidências diferentes: consultas estruturadas, análises estatísticas do acervo ou recuperação semântica sobre notas pessoais e personagens.',
          'É necessário proteger preferências e conversas privadas e fornecer ao modelo apenas evidências rastreáveis e limitadas.',
        ],
        solution: [
          'Um classificador determinístico encaminha consultas para análise estruturada, estatística, semântica ou híbrida. O SelfKnowledgeService chama uma Edge Function autenticada, que combina dados normalizados e documentos semânticos derivados.',
          'A resposta é gerada por um modelo Gemini a partir de um pacote de evidências. A descoberta de animes utiliza outro serviço, que traduz intenções em consultas reais ao catálogo.',
        ],
        architecture: {
          body: [
            '1. Pergunta do usuário → 2. Classificação → 3. Recuperação Estruturada / Estatística / Semântica → 4. Pacote de Evidências → 5. Gemini LLM → 6. Resposta Contextual.',
            'SelfKnowledgeService e Edge Function orquestram PostgreSQL, agregações estatísticas, documentos derivados com pgvector/HNSW e Gemini. A função separada hamlet-ai atende conversação, interpretação e fallback de modelos.',
          ],
          items: [
            'React + TypeScript / Vite',
            'Supabase Auth e Edge Functions',
            'Catálogo pessoal normalizado em PostgreSQL',
            'Embeddings de conhecimento pessoal',
            'pgvector e índice HNSW',
            'Roteamento estruturado, estatístico, semântico e híbrido',
            'Pacote de evidências e geração Gemini',
          ],
        },
        features: [
          'Busca de animes e filtros com exclusão de assistidos',
          'Catálogo privado autenticado',
          'Chatbot Hamlet AI e classificação de intenções',
          'Análise de autoconhecimento sobre dados pessoais',
          'Embeddings e recuperação semântica',
          'Análise estatística de rankings e preferências',
          'Evidências rastreáveis na geração de respostas',
        ],
        role: [
          'Concepção arquitetural, desenvolvimento do aplicativo, integração com Supabase, fluxos de recuperação com IA e validação iterativa.',
        ],
        results: [
          'Código verificado: descoberta, catálogo autenticado e serviços de busca/autoconhecimento implementados.',
          'Infraestrutura verificada: funções hamlet-ai e hamlet-self-knowledge ativas no Supabase e estruturas de conhecimento presentes; isso não comprova qualidade ou disponibilidade de cada resposta Gemini.',
          'Nenhuma métrica de desempenho ou negócios foi inventada.',
        ],
      },
    },
  },
}
