import type { Project } from '../domain/models/Project'

/** Approved editorial content shared by bundled defaults and Supabase-loaded projects. */
export const citiesComparingContent = {
  subtitle: 'Econophysics, Visual Analytics & Data Science',
  category: 'Scientific Computing / Research Software',
  description: 'Research platform derived from MSc research at UFRGS, bringing together Econophysics, Visual Analytics and Data Science to explore and compare socioeconomic indicators across cities, regions and countries.',
  technologies: ['React', 'Vite', 'Python', 'Jupyter', 'Pandas', 'Plotly', 'Streamlit', 'Econophysics', 'Visual Analytics', 'Binscatter', 'B-GCA', 'Data Engineering'],
  links: {
    liveUrl: 'https://leonardocamargorossato.github.io/CitiesComparing_ResearchPlatform/',
    researchUrl: 'https://analysis-socioeconomic-indicators.streamlit.app/',
    githubUrl: 'https://github.com/LeonardoCamargoRossato/CitiesComparing_ResearchPlatform',
  },
  sections: {
    overview: [
      'Cities Comparing is a research platform derived from MSc research at UFRGS, combining Econophysics, Visual Analytics and Data Science to compare socioeconomic indicators across cities, regions and countries.',
      'The current platform brings together scientific publications, the dissertation, datasets, presentations and research notebooks, alongside documentation of the original Streamlit Alpha application.',
    ],
    challenge: [
      'Comparing small and medium-sized cities across countries is difficult because indicator definitions, administrative structures and data collection practices differ. The research organizes visual and quantitative methods to make these comparisons more transparent and reproducible.',
    ],
    solution: [
      'A research platform organized around three paths: Research Hub for scientific materials, Analysis Toolkit for analytical methods, and Scientific Notebooks for the code and research workflows.',
      'The original 2023 Streamlit Alpha remains accessible as an earlier stage of the project, alongside the current research platform.',
    ],
    approach: [
      'The research workflow covers data engineering, preparation and standardization of socioeconomic datasets from Brazil, the United States and other Latin American countries.',
      'Normal Scatter explores relationships between variables; Binscatter groups dense distributions to reveal trends; B-GCA / ScatterGraph represents proximity relationships as graphs for structural and statistical comparison.',
    ],
    architecture: {
      body: 'The current research platform is a static React/Vite frontend with React Router, hosted on GitHub Pages. Scientific methods are implemented in Python/Jupyter notebooks; the original interactive application uses Streamlit. A Python Engine and REST API are planned and are not connected to the current frontend.',
      items: ['React / Vite / React Router', 'Static hosting on GitHub Pages', 'Python / Jupyter research notebooks', 'Data engineering and visual analytics', 'Normal Scatter / Binscatter / B-GCA', 'Streamlit Alpha — original 2023 application'],
    },
    features: [
      'Research Hub with publications, dissertation, presentations and supplementary materials',
      'Access to socioeconomic datasets and research source code',
      'Scientific notebook catalog covering data preparation and analytical methods',
      'Normal Scatter, Binscatter and B-GCA / ScatterGraph method documentation',
      'Comparative research across cities, regions and countries',
      'Access to the original 2023 Streamlit Alpha application',
    ],
    role: [
      'Research and software development spanning data preparation, quantitative methods, algorithm development, validation, visualization and organization of scientific materials in a web platform.',
    ],
    results: [
      'A central entry point to explore the research, consult its data and code, and access materials for reproducing socioeconomic comparison methods. Notebook execution takes place outside the current static platform.',
    ],
    future: [
      'Connect the React frontend to a Python analytical engine through a planned REST API. Direct notebook execution within the platform is also in development.',
    ],
    technologies: [
      'Current platform: React, Vite, React Router and CSS, hosted on GitHub Pages.',
      'Scientific workflows: Python, Jupyter, Pandas and Plotly; Normal Scatter, Binscatter and B-GCA.',
      'Original application: Streamlit Alpha (2023). Python Engine / API: planned integration.',
    ],
  },
  translations: {
    'pt-BR': {
      subtitle: 'Econofísica, Visual Analytics & Ciência de Dados',
      category: 'Computação Científica / Software de Pesquisa',
      description: 'Plataforma de pesquisa derivada do mestrado na UFRGS que reúne Econofísica, Visual Analytics e Ciência de Dados para explorar e comparar indicadores socioeconômicos de cidades, regiões e países.',
      technologies: ['React', 'Vite', 'Python', 'Jupyter', 'Pandas', 'Plotly', 'Streamlit', 'Econofísica', 'Visual Analytics', 'Binscatter', 'B-GCA', 'Engenharia de Dados'],
      sections: {
        overview: [
          'O Cities Comparing é uma plataforma de pesquisa derivada do mestrado na UFRGS que combina Econofísica, Visual Analytics e Ciência de Dados para comparar indicadores socioeconômicos de cidades, regiões e países.',
          'A plataforma atual reúne publicações científicas, dissertação, datasets, apresentações e notebooks de pesquisa, além da documentação da aplicação original Alpha em Streamlit.',
        ],
        challenge: [
          'Comparar cidades pequenas e médias entre países é difícil porque os critérios de cálculo dos indicadores, as estruturas administrativas e os padrões de coleta de dados variam. A pesquisa organiza métodos visuais e quantitativos para tornar essas comparações mais transparentes e reprodutíveis.',
        ],
        solution: [
          'Uma plataforma de pesquisa organizada em três caminhos: Research Hub para materiais científicos, ferramentas de análise para os métodos e notebooks científicos para o código e os fluxos da pesquisa.',
          'A versão Alpha original em Streamlit, de 2023, permanece acessível como uma etapa anterior do projeto, ao lado da plataforma de pesquisa atual.',
        ],
        approach: [
          'O fluxo da pesquisa abrange engenharia de dados, preparação e padronização de bases socioeconômicas do Brasil, Estados Unidos e outros países da América Latina.',
          'Normal Scatter explora relações entre variáveis; Binscatter agrupa distribuições densas para revelar tendências; B-GCA / ScatterGraph representa relações de proximidade como grafos para comparação estrutural e estatística.',
        ],
        architecture: {
          body: 'A plataforma de pesquisa atual é um frontend estático em React/Vite com React Router, hospedado no GitHub Pages. Os métodos científicos estão implementados em notebooks Python/Jupyter; a aplicação interativa original utiliza Streamlit. A integração com uma Engine Python e uma API REST está planejada e ainda não está conectada ao frontend atual.',
          items: ['React / Vite / React Router', 'Hospedagem estática no GitHub Pages', 'Notebooks de pesquisa Python / Jupyter', 'Engenharia de dados e análise visual', 'Normal Scatter / Binscatter / B-GCA', 'Streamlit Alpha — aplicação original de 2023'],
        },
        features: [
          'Research Hub com publicações, dissertação, apresentações e materiais suplementares',
          'Acesso a datasets socioeconômicos e ao código-fonte da pesquisa',
          'Catálogo de notebooks científicos de preparação de dados e métodos analíticos',
          'Documentação de Normal Scatter, Binscatter e B-GCA / ScatterGraph',
          'Pesquisa comparativa entre cidades, regiões e países',
          'Acesso à aplicação Alpha original em Streamlit de 2023',
        ],
        role: [
          'Pesquisa e desenvolvimento de software, abrangendo preparação de dados, métodos quantitativos, desenvolvimento de algoritmos, validação, visualização e organização de materiais científicos em uma plataforma web.',
        ],
        results: [
          'Um ponto central para explorar a pesquisa, consultar seus dados e código e acessar materiais para reproduzir os métodos de comparação socioeconômica. A execução dos notebooks ocorre fora da plataforma estática atual.',
        ],
        future: [
          'Conectar o frontend React a uma engine analítica Python por meio de uma API REST planejada. A execução direta de notebooks na plataforma também está em desenvolvimento.',
        ],
        technologies: [
          'Plataforma atual: React, Vite, React Router e CSS, com hospedagem no GitHub Pages.',
          'Fluxos científicos: Python, Jupyter, Pandas e Plotly; Normal Scatter, Binscatter e B-GCA.',
          'Aplicação original: Streamlit Alpha (2023). Engine Python / API: integração planejada.',
        ],
      },
    },
  },
} satisfies Pick<Project, 'subtitle' | 'category' | 'description' | 'technologies' | 'links' | 'sections' | 'translations'>
