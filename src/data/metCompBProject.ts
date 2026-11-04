import type { Project } from '../domain/models/Project'

export const metCompBProject: Project = {
  id: 'metcompb-landing-page',
  slug: 'metcompb-landing-page',
  title: 'MetCompB — Scientific Computing Archive',
  subtitle: 'Video Lessons & Jupyter Notebooks Archive',
  category: 'Academic Archive / Scientific Computing',
  status: 'Academic Project',
  description: 'Landing page organizing video lessons and Jupyter notebooks produced for the Computational Methods B course taught at the UFRGS Institute of Physics during my master’s studies. The materials demonstrate advanced computational methods for solving and analyzing dynamical systems.',
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
      'MetCompB is a landing page that organizes video lessons and Jupyter notebooks produced for the Computational Methods B course taught at the Institute of Physics of the Federal University of Rio Grande do Sul (UFRGS) during my master’s studies.',
      'The materials demonstrate advanced computational methods used to solve and analyze dynamical systems with Python and Jupyter.',
    ],
    challenge: [
      'The course materials were distributed across repository folders, Jupyter notebooks, figures and video lessons.',
      'The goal was simply to create a clear index that preserved the original materials and made them easier to find and access.',
    ],
    solution: [
      'A static landing page was created with sections for video lessons, notebooks, computational examples and source files.',
      'Each page points back to the original academic repository or related video, without replacing or presenting the archive as a separate course.',
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
      'Preparation and delivery of the video lessons, organization of the Jupyter notebooks and curation of the computational examples used in the course.',
      'Information architecture, interface design and front-end implementation of the landing page that indexes the archive.',
    ],
    results: [
      'A public and organized index for the MetCompB video lessons, notebooks and codes, preserving their connection to the original UFRGS academic context.',
      'A maintainable static landing page with no backend, database, API key or paid service dependency.',
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
  institutionName: 'Universidade Federal do Rio Grande do Sul — UFRGS',
  academicContext: 'Computational Methods B — Institute of Physics, UFRGS',
  caseStudy: true,
  caseEnabled: true,
  translations: {
    'pt-BR': {
      title: 'MetCompB — Acervo de Computação Científica',
      subtitle: 'Acervo de Videoaulas e Notebooks Jupyter',
      category: 'Acervo Acadêmico / Computação Científica',
      status: 'Projeto Acadêmico',
      description: 'Landing page que organiza videoaulas e notebooks Jupyter produzidos para a disciplina de Métodos Computacionais B, ministrada no Instituto de Física da UFRGS durante o meu mestrado. Os materiais demonstram métodos computacionais avançados aplicados à resolução e à análise de sistemas dinâmicos.',
      academicContext: 'Métodos Computacionais B — Instituto de Física, UFRGS',
      sections: {
        overview: [
          'O MetCompB é uma landing page que organiza videoaulas e notebooks Jupyter produzidos para a disciplina de Métodos Computacionais B, ministrada no Instituto de Física da Universidade Federal do Rio Grande do Sul (UFRGS) durante o meu mestrado.',
          'Os materiais demonstram métodos computacionais avançados utilizados na resolução e na análise de sistemas dinâmicos com Python e Jupyter.',
        ],
        challenge: [
          'Os materiais da disciplina estavam distribuídos entre pastas do repositório, notebooks Jupyter, figuras e videoaulas.',
          'O objetivo era simplesmente criar um índice claro, preservar os materiais originais e facilitar sua localização e seu acesso.',
        ],
        solution: [
          'Foi criada uma landing page estática com seções para videoaulas, notebooks, exemplos computacionais e arquivos-fonte.',
          'Cada página direciona ao repositório acadêmico original ou ao vídeo relacionado, sem substituir ou apresentar o acervo como um curso independente.',
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
          'Preparação e apresentação das videoaulas, organização dos notebooks Jupyter e curadoria dos exemplos computacionais utilizados na disciplina.',
          'Arquitetura da informação, design da interface e implementação do front-end da landing page que indexa o acervo.',
        ],
        results: [
          'Um índice público e organizado para as videoaulas, notebooks e códigos do MetCompB, preservando sua ligação com o contexto acadêmico original da UFRGS.',
          'Uma landing page estática de fácil manutenção, sem dependência de backend, banco de dados, chaves de API ou serviços pagos.',
        ],
        technologies: ['React', 'TypeScript', 'Vite', 'React Router', 'GitHub Pages', 'Python', 'Jupyter', 'Métodos Numéricos'],
      },
    },
  },
}
