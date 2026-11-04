import type { Project } from '../domain/models/Project'

export const metCompBProject: Project = {
  id: 'metcompb-landing-page',
  slug: 'metcompb-landing-page',
  title: 'MetCompB Landing Page',
  subtitle: 'Scientific Computing Educational Archive',
  category: 'Educational Software / Scientific Computing',
  status: 'Academic Project',
  description: 'Multilingual educational portal that organizes video lessons, notebooks, exercises, simulations and academic files from Computational Methods B into a clear, navigable learning experience.',
  technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'Python', 'Jupyter', 'Scientific Computing'],
  coverImage: {
    id: 'default-metcompb-landing-page',
    url: './projects/metcompb-landing-page.png',
    path: './projects/metcompb-landing-page.png',
    name: 'MetCompB Landing Page',
    mimeType: 'image/png',
    category: 'Projects',
    imageType: 'real-screenshot',
  },
  imageType: 'real-screenshot',
  sections: {
    overview: [
      'MetCompB Landing Page is the modern presentation layer for an academic archive focused on Scientific Computing, Numerical Methods, Python and Jupyter.',
      'It transforms notebooks, exercises, exams, simulations and video lessons into an organized educational portal while keeping the original MetCompB repository as the source of truth.',
    ],
    challenge: [
      'The academic material was distributed across repository folders, notebooks, figures and external videos. Although technically rich, it was difficult to explore as a coherent learning path.',
      'The project needed to preserve direct access to the original sources while making the collection understandable to students and visitors.',
    ],
    solution: [
      'A responsive static application was created with dedicated areas for video lessons, thematic content, files and project context.',
      'Curated metadata connects each lesson to related computational material, allowing users to move from explanation to notebook, simulation or source file.',
    ],
    architecture: {
      body: 'The portal is a client-side React application deployed on GitHub Pages. Curated TypeScript datasets describe lessons, content and files, while HashRouter provides reliable navigation in a static hosting environment.',
      items: ['React + TypeScript', 'Vite', 'React Router / HashRouter', 'Curated content layer', 'GitHub Pages deployment', 'Links to Jupyter notebooks and academic sources'],
    },
    features: [
      'Nine curated video lessons',
      'Content organized by experiment and subject',
      'Searchable academic file library',
      'Connections between videos and related notebooks',
      'Navigation in Portuguese, English, German, French and Spanish',
      'Light and dark themes',
      'Direct links to the original academic repository and YouTube channel',
    ],
    role: [
      'Product conception, information architecture, content curation, interface design and full front-end implementation.',
      'Organization of the original scientific computing material into a reusable and accessible educational experience.',
    ],
    results: [
      'A public educational archive that makes the MetCompB material easier to discover, study and reuse without duplicating or disconnecting it from its original academic sources.',
      'A maintainable static platform with no backend, database, API key or paid service dependency.',
    ],
    technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'GitHub Pages', 'Python', 'Jupyter', 'Numerical Methods'],
  },
  links: {
    liveUrl: 'https://leonardocamargorossato.github.io/MetCompB-LandingPage/#/videoaulas',
    githubUrl: 'https://github.com/LeonardoCamargoRossato/MetCompB-LandingPage',
    researchUrl: 'https://github.com/LeonardoCamargoRossato/MetCompB',
  },
  gallery: [],
  order: 11,
  sortOrder: 11,
  placement: 'more',
  source: 'more',
  visible: true,
  isAcademic: true,
  institutionName: 'UFRGS',
  academicContext: 'Computational Methods B educational archive',
  caseStudy: true,
  caseEnabled: true,
  translations: {
    'pt-BR': {
      subtitle: 'Acervo Educacional de Computação Científica',
      category: 'Software Educacional / Computação Científica',
      status: 'Projeto Acadêmico',
      description: 'Portal educacional multilíngue que organiza videoaulas, notebooks, exercícios, simulações e arquivos acadêmicos de Métodos Computacionais B em uma experiência de aprendizagem clara e navegável.',
      academicContext: 'Acervo educacional de Métodos Computacionais B',
      sections: {
        overview: [
          'O MetCompB Landing Page é a camada moderna de apresentação de um acervo acadêmico voltado a Computação Científica, Métodos Numéricos, Python e Jupyter.',
          'Transforma notebooks, exercícios, provas, simulações e videoaulas em um portal educacional organizado, mantendo o repositório MetCompB original como fonte oficial dos materiais.',
        ],
        challenge: [
          'O material acadêmico estava distribuído entre pastas do repositório, notebooks, figuras e vídeos externos. Apesar da riqueza técnica, era difícil explorá-lo como uma trilha de aprendizagem coerente.',
          'O projeto precisava preservar o acesso direto às fontes originais e, ao mesmo tempo, tornar a coleção compreensível para estudantes e visitantes.',
        ],
        solution: [
          'Foi criada uma aplicação estática e responsiva com áreas dedicadas a videoaulas, conteúdos temáticos, arquivos e contexto do projeto.',
          'Metadados curados conectam cada aula aos materiais computacionais relacionados, permitindo avançar da explicação para o notebook, a simulação ou o arquivo-fonte.',
        ],
        architecture: {
          body: 'O portal é uma aplicação React executada no cliente e publicada no GitHub Pages. Conjuntos de dados em TypeScript descrevem aulas, conteúdos e arquivos, enquanto o HashRouter garante navegação confiável na hospedagem estática.',
          items: ['React + TypeScript', 'Vite', 'React Router / HashRouter', 'Camada de conteúdo curado', 'Publicação no GitHub Pages', 'Integração com notebooks Jupyter e fontes acadêmicas'],
        },
        features: [
          'Nove videoaulas curadas',
          'Conteúdos organizados por experimento e assunto',
          'Biblioteca pesquisável de arquivos acadêmicos',
          'Conexões entre vídeos e notebooks relacionados',
          'Navegação em português, inglês, alemão, francês e espanhol',
          'Temas claro e escuro',
          'Links diretos para o repositório acadêmico original e o canal no YouTube',
        ],
        role: [
          'Concepção do produto, arquitetura da informação, curadoria de conteúdo, design da interface e implementação completa do front-end.',
          'Organização dos materiais originais de computação científica em uma experiência educacional acessível e reutilizável.',
        ],
        results: [
          'Um acervo educacional público que facilita descobrir, estudar e reutilizar os materiais do MetCompB sem duplicá-los ou desconectá-los das fontes acadêmicas originais.',
          'Uma plataforma estática de fácil manutenção, sem dependência de backend, banco de dados, chaves de API ou serviços pagos.',
        ],
        technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'GitHub Pages', 'Python', 'Jupyter', 'Métodos Numéricos'],
      },
    },
  },
}
