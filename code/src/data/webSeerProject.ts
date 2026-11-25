import type { Project, ProjectGalleryItem } from '../domain/models/Project'

const screenshots = [
  ['home', 'capa1.png', 'WebSeer home page and visual language map', 'Página inicial do WebSeer e mapa visual da linguagem'],
  ['word-tree-disse', 'capa2.png', 'Word tree for “disse” with contextual occurrences', 'Árvore de palavras de “disse” com ocorrências contextuais'],
  ['video-studio', 'capa3.png', 'Animated histogram video and YouTube publishing workspace', 'Ambiente de vídeo do histograma animado e publicação no YouTube'],
  ['video-library', 'capa4.png', 'Local video library and publishing history', 'Biblioteca local de vídeos e histórico de publicações'],
  ['phrase-net', 'capa6.png', 'Phrase network based on explicit textual patterns', 'Rede de frases baseada em padrões textuais explícitos'],
  ['word-tree-disse-context', 'capa7.png', 'Word tree for “disse” with a broader context selection', 'Árvore de palavras de “disse” com seleção ampliada de contextos'],
  ['word-tree-deus', 'capa8.png', 'Word tree for “Deus” across the Genesis corpus', 'Árvore de palavras de “Deus” no corpus de Gênesis'],
  ['word-cloud', 'capa9.png', 'Configurable word cloud generated from the Genesis corpus', 'Nuvem de palavras configurável gerada a partir do corpus de Gênesis'],
  ['document-corpus', 'capa10.png', 'Local document corpus preparation workspace', 'Ambiente de preparação do corpus documental local'],
] as const

const gallery: ProjectGalleryItem[] = screenshots.map(([id, file, caption, altText], index) => ({
  id: `webseer-${id}`,
  image: {
    id: `webseer-${id}-image`,
    url: `./projects/webseer-gallery/${file.replace('.png', '-card.webp')}`,
    path: `./projects/webseer-gallery/${file.replace('.png', '-card.webp')}`,
    name: caption,
    mimeType: 'image/webp',
    category: 'Projects',
    altText: caption,
    imageType: 'real-screenshot',
  },
  caption,
  captionPt: altText,
  altText: caption,
  altTextPt: altText,
  previewUrl: `./projects/webseer-gallery/${file.replace('.png', '-preview.webp')}`,
  thumbnailUrl: `./projects/webseer-gallery/${file.replace('.png', '-thumb.webp')}`,
  cardUrl: `./projects/webseer-gallery/${file.replace('.png', '-card.webp')}`,
  fullUrl: `./projects/webseer-gallery/${file.replace('.png', '-full.webp')}`,
  evidence: 'Screenshot provided in the public WebSeer repository.',
  imageClassification: 'real-screenshot',
  order: index + 1,
  sortOrder: index + 1,
  visible: true,
  placement: 'more',
  source: 'more',
}))

export const webSeerProject: Project = {
  id: 'webseer',
  slug: 'webseer',
  title: 'WebSeer',
  subtitle: 'Visual Text Analysis for Decision Research',
  category: 'Doctoral Research Software / Visual Text Analysis',
  status: 'Academic Project',
  description: 'Doctoral-level research software that began in a Naturalistic Decision Making course and supports an article in development on how business decision-makers evaluate quantum-technology adoption. WebSeer helps organize taxonomies and inspect text corpora through visual comparisons, graphs, frequencies and animated histograms.',
  technologies: ['React', 'TypeScript', 'D3.js', 'Text Analysis', 'Data Visualization', 'IndexedDB', 'WebCodecs'],
  coverImage: gallery[0].image,
  imageType: 'real-screenshot',
  sections: {
    overview: [
      'WebSeer began as a doctoral-level project in a Naturalistic Decision Making course and evolved into research software for visually examining text corpora.',
      'It supports an article currently in development about how business decision-makers evaluate whether to adopt quantum technologies. The platform helped organize the taxonomy used in the study; an international presentation or submission in London is planned for 2027, but has not yet been published or accepted.',
    ],
    challenge: [
      'Building a research taxonomy from interviews, documents and other textual evidence requires repeated comparison of terms, contexts and relationships. Manual reading alone makes those patterns difficult to trace consistently across a corpus.',
      'The project needed a focused environment for exploratory visual analysis without sending the research documents to an external server.',
    ],
    solution: [
      'WebSeer imports PDF, DOCX, TXT and Markdown files into a local browser corpus and provides linked views for comparison, word trees, phrase networks, frequencies, word clouds and reports.',
      'Its main purpose is visual text-data mining: helping the researcher inspect occurrences, continuations and explicit word relationships that can inform a taxonomy. These views support interpretation; they do not replace the researcher or imply causal relationships.',
    ],
    approach: [
      'The analytical views use occurrences, frequency counts and explicit textual patterns rather than semantic embeddings or generative-AI inference.',
      'Documents, searches and reports remain in the browser through IndexedDB, keeping the workflow reproducible and local to the researcher’s device.',
    ],
    architecture: {
      body: 'A React and TypeScript single-page application processes documents in the browser. PDF.js and Mammoth extract text, IndexedDB stores the local corpus and D3-based views render visual relationships. The histogram workflow can generate GIF/MP4 assets locally; YouTube publishing is available only when the required Google/YouTube API credentials are configured.',
      items: ['React + TypeScript + Vite', 'PDF.js / Mammoth', 'IndexedDB local corpus', 'D3 visualizations', 'GIF / MP4 generation', 'Optional YouTube API integration'],
    },
    features: [
      'Local corpus from PDF, DOCX, TXT and Markdown files',
      'Dashboard with corpus metrics and frequency overview',
      'Visual comparison of word continuations',
      'Word trees and phrase networks from explicit patterns',
      'Frequency charts and word clouds',
      'Saved searches, reports and local history',
      'Animated histograms with GIF, MP4 and CSV export',
      'Video metadata preparation and optional YouTube API workflow',
    ],
    role: [
      'Research framing, taxonomy workflow design, information architecture and implementation of the visual text-analysis application.',
      'Development of the local document pipeline, interactive analytical views, report history and animated-histogram export workflow.',
    ],
    results: [
      'A working research environment used to organize and inspect evidence for a taxonomy about business decisions concerning quantum-technology adoption.',
      'The related article remains in development. The software records analytical paths and exports visual material that can support research communication without claiming that the tool itself produces the study’s conclusions.',
    ],
    technologies: ['React', 'TypeScript', 'Vite', 'D3.js', 'PDF.js', 'Mammoth', 'IndexedDB', 'WebCodecs', 'GIF', 'YouTube Data API'],
  },
  links: {
    liveUrl: 'https://leonardocamargorossato.github.io/WebSeer/',
    githubUrl: 'https://github.com/LeonardoCamargoRossato/WebSeer',
  },
  gallery,
  order: 13,
  sortOrder: 13,
  placement: 'more',
  source: 'more',
  visible: true,
  isAcademic: true,
  academicContext: 'Doctoral research · Naturalistic Decision Making',
  caseStudy: true,
  caseEnabled: true,
  translations: {
    'pt-BR': {
      subtitle: 'Análise Visual de Textos para Pesquisa em Decisão',
      category: 'Software de Pesquisa Doutoral / Análise Visual de Textos',
      status: 'Projeto Acadêmico',
      description: 'Software de pesquisa em nível de doutorado iniciado em uma disciplina de Tomada de Decisão Naturalista e utilizado em um artigo em desenvolvimento sobre como empresários avaliam a adoção de tecnologias quânticas. O WebSeer apoia a organização de taxonomias e a análise de corpus textuais por comparações visuais, grafos, frequências e histogramas animados.',
      academicContext: 'Pesquisa doutoral · Tomada de Decisão Naturalista',
      sections: {
        overview: [
          'O WebSeer começou como um projeto em nível de doutorado em uma disciplina de Tomada de Decisão Naturalista e evoluiu para um software de pesquisa dedicado à exploração visual de corpus textuais.',
          'Ele apoia um artigo em desenvolvimento sobre como empresários avaliam a adoção ou não de tecnologias quânticas. A plataforma ajudou a organizar a taxonomia utilizada no estudo; há intenção de apresentação ou submissão internacional em Londres em 2027, mas o trabalho ainda não foi publicado nem aceito.',
        ],
        challenge: [
          'Construir uma taxonomia de pesquisa a partir de entrevistas, documentos e outras evidências textuais exige comparar repetidamente termos, contextos e relações. Apenas a leitura manual dificulta o rastreamento consistente desses padrões em todo o corpus.',
          'O projeto precisava de um ambiente focado em análise visual exploratória sem enviar os documentos de pesquisa a um servidor externo.',
        ],
        solution: [
          'O WebSeer importa arquivos PDF, DOCX, TXT e Markdown para um corpus local no navegador e oferece visualizações conectadas para comparação, árvores de palavras, redes de frases, frequências, nuvens de palavras e relatórios.',
          'Seu principal objetivo é a mineração visual de dados textuais: ajudar o pesquisador a inspecionar ocorrências, continuações e relações explícitas entre palavras que possam informar uma taxonomia. As visualizações apoiam a interpretação; não substituem o pesquisador nem indicam relações causais.',
        ],
        approach: [
          'As visualizações analíticas utilizam ocorrências, contagens de frequência e padrões textuais explícitos, sem inferência por embeddings semânticos ou IA generativa.',
          'Documentos, pesquisas e relatórios permanecem no navegador por meio do IndexedDB, mantendo o fluxo reproduzível e local no dispositivo do pesquisador.',
        ],
        architecture: {
          body: 'Uma aplicação de página única em React e TypeScript processa os documentos no navegador. PDF.js e Mammoth extraem os textos, o IndexedDB armazena o corpus local e visualizações baseadas em D3 apresentam relações textuais. O fluxo de histogramas gera GIF e MP4 localmente; a publicação no YouTube funciona apenas quando as credenciais necessárias das APIs Google/YouTube são configuradas.',
          items: ['React + TypeScript + Vite', 'PDF.js / Mammoth', 'Corpus local em IndexedDB', 'Visualizações D3', 'Geração de GIF / MP4', 'Integração opcional com a API do YouTube'],
        },
        features: [
          'Corpus local com arquivos PDF, DOCX, TXT e Markdown',
          'Dashboard com métricas do corpus e visão de frequências',
          'Comparação visual de continuações de palavras',
          'Árvores de palavras e redes de frases baseadas em padrões explícitos',
          'Gráficos de frequência e nuvens de palavras',
          'Pesquisas, relatórios e histórico salvos localmente',
          'Histogramas animados com exportação em GIF, MP4 e CSV',
          'Preparação de metadados de vídeo e fluxo opcional pela API do YouTube',
        ],
        role: [
          'Definição da pesquisa, desenho do fluxo de taxonomia, arquitetura da informação e implementação da aplicação de análise visual de textos.',
          'Desenvolvimento do processamento local de documentos, visualizações analíticas interativas, histórico de relatórios e fluxo de exportação dos histogramas animados.',
        ],
        results: [
          'Um ambiente funcional de pesquisa utilizado para organizar e examinar evidências de uma taxonomia sobre decisões empresariais relacionadas à adoção de tecnologias quânticas.',
          'O artigo relacionado continua em desenvolvimento. O software registra caminhos de análise e exporta material visual para comunicação da pesquisa, sem atribuir à ferramenta a produção das conclusões do estudo.',
        ],
        technologies: ['React', 'TypeScript', 'Vite', 'D3.js', 'PDF.js', 'Mammoth', 'IndexedDB', 'WebCodecs', 'GIF', 'YouTube Data API'],
      },
    },
  },
}
