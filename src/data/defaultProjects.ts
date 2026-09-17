import type { Project } from '../domain/models/Project'

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
    category: 'Institutional Digital Platform',
    status: 'Private Platform',
    description: 'Institutional platform that centralizes people, organizations, projects, documents, links, tools and analysis environments from Instituto Foton in a single interface.',
    technologies: ['Microsoft SharePoint', 'SPFx', 'React', 'TypeScript', 'Microsoft 365', 'SharePoint APIs', 'SharePoint Lists', 'SharePoint Libraries'],
    coverImage: ph('foton-hub', './projects/foton-hub.svg'),
    imageType: 'illustrative-placeholder',
    sections: {
      overview: [
        'Foton Hub is an institutional platform developed to centralize people, organizations, projects, documents, links, tools and analysis environments from Instituto Foton in a single interface.',
        'The proposal was to transform different structures of the Microsoft 365 ecosystem into a more organized and user-friendly experience, avoiding the need for users to navigate directly through isolated SharePoint lists, libraries and pages.',
        'The project combines front-end development with integration to native Microsoft 365 resources, creating its own application layer on top of SharePoint.',
      ],
      advantages: [
        'Foton Hub reduces fragmentation of institutional information by concentrating resources that could otherwise be spread across different lists, pages and systems.',
        'Its main benefits include centralizing member and partner information, simplifying navigation among internal systems, providing quick access through the Links Hub and making analysis tools available directly inside the institutional environment.',
        'Its modular architecture also allows the platform to evolve by adding new capabilities without rebuilding the entire system.',
      ],
      userExperience: [
        'The user enters a simple home page organized into major modules: Ecosystem, Links Hub, Administration and Analysis Lab.',
        'In Ecosystem, users can browse members, researchers, board members, enthusiasts and partner organizations using filters, search and profile views.',
        'The Links Hub centralizes important systems and services in cards with direct access and QR Codes. In the Analysis Lab, users can select data sources, apply filters, inspect tables, visualize indicators and automatically generate charts.',
        'The experience was designed to hide SharePoint complexity and present an interface closer to a traditional web application.',
      ],
      properties: [
        'Modular structure, search and filters, profile pages, member management, SharePoint List integration, institutional partner management, link library, QR Codes, analytical dashboards and administrative components.',
        'Custom member identification rules, profile image handling, permissions, interfaces for different user groups and reusable components were also implemented.',
      ],
      technologiesUsed: [
        'Microsoft SharePoint, SharePoint Framework (SPFx), React, TypeScript, Microsoft 365, SharePoint APIs and services, SharePoint Lists and Libraries, plus custom data visualization and administration components.',
      ],
    },
    links: { institutionUrl: 'https://institutofoton.com.br/' },
    gallery: [],
    order: 1,
    featured: true,
    badge: 'FEATURED',
    caseStudy: true,
    translations: {
      'pt-BR': {
        category: 'Plataforma Digital Institucional',
        description: 'Plataforma institucional que centraliza pessoas, organizações, projetos, documentos, links, ferramentas e ambientes de análise do Instituto Foton em uma única interface.',
        sections: {
          overview: [
            'O Foton Hub é uma plataforma institucional desenvolvida para centralizar pessoas, organizações, projetos, documentos, links, ferramentas e ambientes de análise do Instituto Foton em uma única interface.',
            'A proposta foi transformar diferentes estruturas do ecossistema Microsoft 365 em uma experiência mais organizada e amigável, evitando que o usuário precise navegar diretamente por listas, bibliotecas e páginas isoladas do SharePoint.',
            'O projeto combina desenvolvimento front-end com integração aos recursos nativos do Microsoft 365, criando uma camada de aplicação própria sobre o SharePoint.',
          ],
          advantages: [
            'O Foton Hub reduz a fragmentação de informações institucionais ao concentrar em um único ambiente recursos que antes poderiam estar distribuídos entre diferentes listas, páginas e sistemas.',
            'Entre seus principais benefícios estão a centralização das informações de membros e parceiros, navegação simplificada entre sistemas internos, acesso rápido a recursos por meio do Hub de Links e disponibilização de ferramentas de análise diretamente dentro do ambiente institucional.',
            'A arquitetura também permite evoluir a plataforma de maneira modular, adicionando novas funcionalidades sem necessidade de reconstruir todo o sistema.',
          ],
          userExperience: [
            'O usuário entra em uma página inicial simples, organizada em grandes módulos: Ecossistema, Hub de Links, Administração e Lab de Análises.',
            'No Ecossistema, é possível consultar membros, pesquisadores, diretoria, entusiastas e organizações parceiras, utilizando filtros, pesquisas e visualização de perfis.',
            'No Hub de Links, sistemas e serviços importantes ficam centralizados em cards, com acesso direto e QR Codes. No Lab de Análises, o usuário consegue selecionar fontes de dados, aplicar filtros, consultar tabelas, visualizar indicadores e gerar gráficos automaticamente.',
            'A experiência foi pensada para esconder a complexidade do SharePoint e apresentar ao usuário uma interface semelhante a uma aplicação web tradicional.',
          ],
          properties: [
            'O sistema possui estrutura modular, busca e filtros, páginas de perfil, gerenciamento de membros, integração com listas SharePoint, gestão de parceiros institucionais, biblioteca de links, QR Codes, dashboards analíticos e componentes administrativos.',
            'Também foram implementadas regras próprias de identificação de membros, tratamento de imagens de perfil, permissões, interfaces específicas para diferentes grupos de usuários e componentes reutilizáveis.',
          ],
          technologiesUsed: [
            'Microsoft SharePoint, SharePoint Framework — SPFx, React, TypeScript, Microsoft 365, APIs e serviços do SharePoint, listas e bibliotecas SharePoint, além de componentes personalizados para visualização e administração de dados.',
          ],
        },
      },
    },
  },
  {
    id: 'city-comparing',
    slug: 'cities-comparing',
    title: 'Cities Comparing',
    subtitle: 'Socioeconomic Analysis Toolkit',
    category: 'Scientific Computing / Research Software',
    status: 'Live',
    description: "Exploratory analysis platform developed from master's work in Physics, especially in econophysics, data analysis and complex systems.",
    technologies: ['Python', 'Streamlit', 'Jupyter Notebook', 'Pandas', 'Plotly', 'Scientific Libraries', 'Graph-based Methods'],
    coverImage: ph('city-comparing', './projects/city-comparing.svg'),
    imageType: 'illustrative-placeholder',
    sections: {
      overview: [
        "Cities Comparing is an exploratory analysis platform developed from work carried out during a master's degree in Physics, especially in econophysics, data analysis and complex systems.",
        'The project allows socioeconomic indicators to be compared among cities, countries, states and macroregions through different forms of statistical visualization.',
        'More than a dashboard, the tool works as an experimental environment for investigating how indicators with very different scales can be compared and interpreted.',
      ],
      advantages: [
        'Its main advantage is enabling complex socioeconomic datasets to be explored visually without writing code for each new analysis.',
        'The system combines different methods in one interface, allowing rapid switching among geographic comparisons, scatter plots, distributions, clustering and tabular analyses.',
        'This reduces the time required to explore hypotheses and helps reveal patterns that are difficult to identify from tables alone.',
      ],
      userExperience: [
        'The user starts by choosing the desired analysis type, including comparisons among cities, countries or regions.',
        'For city comparisons, the user can select country, state and municipality on each side of the screen and inspect their indicators in parallel.',
        'Axes and socioeconomic variables can be changed and the visualization method can be switched among scatter plots, binscatters, distribution analyses, comparative charts and region-segmented views.',
        'The experience behaves like a compact data analysis laboratory available directly in the browser.',
      ],
      properties: [
        'Dynamic selection of countries, states and municipalities; comparison among locations; population and socioeconomic indicator analysis; scatter plots; binscatters; histograms; boxplots; DataFrame visualization; and analyses segmented by country, state or macroregion.',
        'The project also includes more complete modules originally developed in Jupyter Notebook for deeper experimental analysis, while the Streamlit version provides a simplified web interface.',
      ],
      technologiesUsed: [
        'Python, Streamlit, Jupyter Notebook, Pandas, scientific and statistical visualization libraries, Plotly, custom tools developed during the master’s research and graph-based analysis methods.',
      ],
    },
    links: {
      liveUrl: 'https://analysis-socioeconomic-indicators.streamlit.app/',
      githubUrl: 'https://github.com/LeonardoCamargoRossato/Analysis_SocioEconomic_Indicator',
    },
    gallery: [],
    order: 2,
    caseStudy: true,
    translations: {
      'pt-BR': {
        title: 'Cities Comparing',
        subtitle: 'Socioeconomic Analysis Toolkit',
        category: 'Computação Científica / Software de Pesquisa',
        description: 'Plataforma de análise exploratória desenvolvida a partir de trabalhos realizados durante o mestrado em Física, especialmente em econofísica, análise de dados e sistemas complexos.',
        sections: {
          overview: [
            'O Cities Comparing é uma plataforma de análise exploratória desenvolvida a partir de trabalhos realizados durante o mestrado em Física, especialmente nas áreas de econofísica, análise de dados e sistemas complexos.',
            'O projeto permite comparar indicadores socioeconômicos entre cidades, países, estados e macrorregiões utilizando diferentes formas de visualização estatística.',
            'Mais do que um dashboard, a ferramenta funciona como um ambiente experimental para investigar como indicadores de escalas muito diferentes podem ser comparados e interpretados.',
          ],
          advantages: [
            'A principal vantagem da plataforma é permitir que bases socioeconômicas complexas sejam exploradas visualmente sem necessidade de escrever código a cada nova análise.',
            'O sistema reúne diferentes métodos de análise dentro de uma mesma interface, permitindo alternar rapidamente entre comparações geográficas, gráficos de dispersão, distribuições, agrupamentos e análises tabulares.',
            'Isso reduz significativamente o tempo necessário para explorar hipóteses e facilita a identificação de padrões que seriam difíceis de perceber observando apenas tabelas.',
          ],
          userExperience: [
            'O usuário começa escolhendo o tipo de análise que deseja realizar, podendo comparar cidades, países ou regiões.',
            'Na comparação entre cidades, por exemplo, é possível escolher país, estado e município em cada lado da tela e visualizar os respectivos indicadores de forma paralela.',
            'A interface permite alterar os eixos analisados, selecionar variáveis socioeconômicas e alternar entre diferentes métodos de visualização.',
            'Entre os modos disponíveis estão scatter plots, binscatters, análises de distribuição, gráficos comparativos e visualizações segmentadas por regiões. A experiência se aproxima de um pequeno laboratório de análise de dados acessível diretamente pelo navegador.',
          ],
          properties: [
            'A plataforma inclui seleção dinâmica de países, estados e municípios, comparação entre diferentes localidades, análise de indicadores populacionais e socioeconômicos, scatter plots, binscatters, histogramas, boxplots, visualização de DataFrames e análises segmentadas por país, estado ou macrorregião.',
            'O projeto possui ainda módulos desenvolvidos originalmente em Jupyter Notebook, permitindo análises mais profundas e experimentais, enquanto a versão em Streamlit funciona como uma interface simplificada e acessível pela web.',
          ],
          technologiesUsed: [
            'Python, Streamlit, Jupyter Notebook, Pandas, bibliotecas de visualização científica e estatística, Plotly, além de ferramentas próprias desenvolvidas durante a pesquisa de mestrado. O repositório também concentra diferentes módulos de análise ligados a econofísica, visualização de dados e métodos baseados em grafos.',
          ],
        },
      },
    },
  },
  {
    id: 'hamlet',
    slug: 'hamlet',
    title: 'Hamlet — Narrative Universe',
    category: 'Experimental Web Experience',
    status: 'Live',
    description: 'Experimental web platform combining literature, experience design, multimedia content and artificial intelligence to transform a narrative work into an explorable digital environment.',
    technologies: ['React', 'Modern Front-end', 'Lovable', 'Document Viewer', 'Media Playback', 'Content Management', 'Conversational AI'],
    coverImage: ph('hamlet', './projects/hamlet.svg'),
    imageType: 'illustrative-placeholder',
    sections: {
      overview: [
        'Hamlet — Narrative Universe is an experimental web platform that combines literature, experience design, multimedia content and artificial intelligence to transform a narrative work into an explorable digital environment.',
        'Instead of presenting only a book or static text, the platform creates a universe in which visitors can navigate stories, characters, images, documents, music and interactive dialogue.',
        'The project explores the idea of transforming literary content into an immersive digital experience.',
      ],
      advantages: [
        'Its main advantage is bringing different content formats into one narrative experience.',
        'Text, image, audio, documents and interaction stop acting as independent elements and become parts of the same environment, allowing visitors to choose different exploration paths.',
        'The project also demonstrates how web interfaces and artificial intelligence can be used in cultural, educational and experimental applications.',
      ],
      userExperience: [
        'The site opens with a visual atmosphere inspired by Hamlet, using black, dark tones, gold and cinematic elements.',
        'The Library provides books and documents related to the narrative universe, while the Gallery contributes imagery that builds the atmosphere of the work.',
        'Documents can be read inside the site through an integrated viewer. In Talk to Hamlet, the visitor interacts with a digital representation of the character through a conversational interface.',
        'Audio and soundtrack elements are also integrated into the environment to reinforce immersion.',
      ],
      properties: [
        'Narrative home page, digital library, document viewer, image gallery, navigation among characters and content, audio playback, multimedia elements and a conversational interface.',
        'The platform also includes an administrative area for managing content and operates as an experiment in the convergence of narrative, web interfaces, artificial intelligence and digital experience.',
      ],
      technologiesUsed: [
        'React, modern front-end components and infrastructure managed through the Lovable ecosystem, with resources for document visualization, media playback, content management and AI-based conversational interfaces.',
      ],
    },
    links: { liveUrl: 'https://hamlet-sociedade-ideal.lovable.app/' },
    gallery: [],
    order: 3,
    caseStudy: true,
    translations: {
      'pt-BR': {
        title: 'Hamlet — Universo Narrativo',
        category: 'Experiência Web Experimental',
        description: 'Plataforma web experimental que combina literatura, design de experiência, conteúdo multimídia e inteligência artificial para transformar uma obra narrativa em um ambiente digital explorável.',
        sections: {
          overview: [
            'O Hamlet — Universo Narrativo é uma plataforma web experimental que combina literatura, design de experiência, conteúdo multimídia e inteligência artificial para transformar uma obra narrativa em um ambiente digital explorável.',
            'Em vez de apresentar apenas um livro ou texto estático, a plataforma cria um universo no qual o visitante pode navegar por histórias, personagens, imagens, documentos, música e diálogos interativos.',
            'O projeto explora a ideia de transformar conteúdo literário em uma experiência digital imersiva.',
          ],
          advantages: [
            'A principal vantagem é unir diferentes formatos de conteúdo em uma única experiência narrativa.',
            'Texto, imagem, áudio, documentos e interação deixam de funcionar como elementos independentes e passam a compor um mesmo ambiente.',
            'Isso permite que o visitante escolha diferentes caminhos de exploração, tornando a experiência mais próxima de um universo narrativo do que de um site convencional. O projeto também demonstra como interfaces web e inteligência artificial podem ser utilizadas em aplicações culturais, educacionais e experimentais.',
          ],
          userExperience: [
            'Ao acessar o site, o visitante encontra uma atmosfera visual inspirada no universo de Hamlet, utilizando preto, tons escuros, dourado e elementos cinematográficos.',
            'Na Biblioteca, o usuário pode acessar livros e documentos relacionados ao universo narrativo. Na Galeria, encontra imagens que ajudam a construir visualmente o ambiente e a atmosfera da obra.',
            'Em seções específicas, documentos podem ser lidos diretamente dentro do próprio site por meio de um visualizador integrado. Já em Fale com Hamlet, o usuário pode interagir com uma representação digital do personagem por meio de uma interface conversacional.',
            'Há ainda elementos de áudio e trilha sonora integrados ao ambiente, reforçando a dimensão imersiva da experiência.',
          ],
          properties: [
            'O projeto possui página inicial narrativa, biblioteca digital, visualizador de documentos, galeria de imagens, sistema de navegação entre personagens e conteúdos, reprodução de áudio, elementos multimídia e interface conversacional.',
            'Também existe uma área administrativa para gerenciamento dos conteúdos da plataforma. O projeto funciona como um experimento de convergência entre narrativa, interface web, inteligência artificial e experiência digital.',
          ],
          technologiesUsed: [
            'Aplicação web construída utilizando React, componentes front-end modernos e infraestrutura gerenciada através do ecossistema Lovable. O projeto também utiliza recursos para visualização de documentos, reprodução de mídia, gerenciamento de conteúdo e integração de interfaces conversacionais baseadas em inteligência artificial.',
          ],
        },
      },
    },
  },
  {
    id: 'speaker-portfolio',
    slug: 'speaker-portfolio',
    title: 'Speaking Portfolio',
    subtitle: 'Leonardo Camargo Rossato',
    category: 'Personal Digital Experience',
    status: 'Live',
    description: 'Personal platform created to present professional work as a speaker, researcher and technology professional, serving as a personal site, professional portfolio and commercial presentation for events.',
    technologies: ['React', 'Modern Front-end', 'Lovable', 'Responsive Components', 'Media Galleries', 'Routes & Sections', 'Modular Structure'],
    coverImage: ph('speaker-portfolio', './projects/speaker-portfolio.svg'),
    imageType: 'illustrative-placeholder',
    sections: {
      overview: [
        'The Speaking Portfolio is a personal platform created to present professional work as a speaker, researcher and technology professional.',
        'It organizes professional trajectory, speaking topics, past events, image galleries, technical projects and contact options in a single experience.',
        'The proposal is to work simultaneously as a personal site, professional portfolio and commercial presentation for events, companies and institutions.',
      ],
      advantages: [
        'Its main benefit is concentrating different dimensions of professional activity into one public and easily shareable page.',
        'Instead of sending a résumé, photos, event list, biography and projects separately, the site integrates these materials visually.',
        'The structure also helps event organizers, companies and potential partners quickly understand areas of activity, experience and presentation history.',
      ],
      userExperience: [
        'The experience begins with a strong visual presentation centered on a speaking image and an identity based on black, white and yellow/gold details.',
        'Visitors can navigate sections such as About, Topics, Events, Gallery, Projects and Contact.',
        'About presents the academic and professional trajectory; Events shows congresses, conferences, panels and academic activities; Gallery presents photographic records; Projects connects communication work to technical and scientific projects.',
        'Calls to action make it possible to get in touch for talks, workshops, consulting or collaborations.',
      ],
      properties: [
        'Section-based navigation, professional presentation, event history, filters or participation categories, responsive image gallery, projects area, hiring calls to action and contact section.',
        'The site was also designed as a responsive digital showcase for both desktop and mobile, with an editorial and technological identity combining science, research, innovation and communication.',
      ],
      technologiesUsed: [
        'React and modern front-end technologies inside the Lovable ecosystem, using responsive components, media galleries, route/section navigation, modular content organization and web publishing resources.',
      ],
    },
    links: { liveUrl: 'https://leonardo-camargo-rossato.lovable.app/' },
    gallery: [],
    order: 4,
    caseStudy: true,
    translations: {
      'pt-BR': {
        title: 'Portfólio de Palestras',
        subtitle: 'Leonardo Camargo Rossato',
        category: 'Experiência Digital Pessoal',
        description: 'Plataforma pessoal criada para apresentar a atuação profissional como palestrante, pesquisador e profissional de tecnologia, funcionando como site pessoal, portfólio profissional e apresentação comercial para eventos.',
        sections: {
          overview: [
            'O Portfólio de Palestras é uma plataforma pessoal criada para apresentar atuação profissional como palestrante, pesquisador e profissional de tecnologia.',
            'O site organiza em uma única experiência informações sobre trajetória profissional, temas de palestras, eventos realizados, galeria de imagens, projetos técnicos e formas de contato.',
            'A proposta é funcionar simultaneamente como site pessoal, portfólio profissional e apresentação comercial para eventos, empresas e instituições.',
          ],
          advantages: [
            'O principal benefício é concentrar diferentes dimensões da atuação profissional em uma única página pública e facilmente compartilhável.',
            'Em vez de enviar separadamente currículo, fotos, lista de eventos, biografia e projetos, o site apresenta essas informações de maneira integrada e visual.',
            'A estrutura também facilita a avaliação por organizadores de eventos, empresas e potenciais parceiros, permitindo entender rapidamente áreas de atuação, experiência e histórico de apresentações.',
          ],
          userExperience: [
            'A experiência começa com uma apresentação visual de impacto, utilizando uma imagem de palestra como elemento central e uma identidade baseada em preto, branco e detalhes em amarelo/dourado.',
            'O visitante pode navegar por seções como Sobre, Temas, Eventos, Galeria, Projetos e Contato.',
            'A seção Sobre apresenta trajetória acadêmica e profissional. Em Eventos, é possível visualizar diferentes participações em congressos, conferências, painéis e atividades acadêmicas. A Galeria apresenta registros fotográficos de palestras e eventos.',
            'A seção Projetos conecta a atividade de comunicação com trabalhos técnicos e científicos desenvolvidos. Por fim, chamadas de ação permitem entrar em contato diretamente para palestras, workshops, consultorias ou colaborações.',
          ],
          properties: [
            'O site possui navegação por seções, apresentação profissional, histórico de eventos, filtros ou categorias de participação, galeria responsiva de imagens, área de projetos, chamadas para contratação e seção de contato.',
            'Também foi pensado para funcionar como uma vitrine digital responsiva, podendo ser acessado tanto em desktop quanto em dispositivos móveis. A identidade visual utiliza elementos editoriais e tecnológicos para criar uma imagem profissional que mistura ciência, pesquisa, inovação e comunicação.',
          ],
          technologiesUsed: [
            'Aplicação web desenvolvida com React e tecnologias modernas de front-end dentro do ecossistema Lovable. A plataforma utiliza componentes responsivos, galerias de mídia, navegação por rotas e seções, organização modular de conteúdo e recursos próprios de publicação web.',
          ],
        },
      },
    },
  },
]

export const defaultMoreProjects: Project[] = [
  ['esp32-control', 'Embedded Control Platform', 'Embedded Systems', ['ESP32', 'HTML', 'CSS', 'JavaScript', 'Embedded Systems'], 'embedded-control.png'],
  ['scientific-analysis', 'Scientific Analysis Toolkit', 'Scientific Computing', ['Python', 'Jupyter', 'Plotly', 'Interactive Widgets'], 'scientific-analysis.png'],
  ['streamlit-tools', 'Streamlit Tools', 'Data Applications', ['Python', 'Streamlit', 'Data Applications'], 'streamlit-tools.png'],
  ['webseer', 'WebSeer', 'Text Analysis / Data Visualization', ['React', 'Text Analysis', 'Data Visualization'], 'webseer.png'],
].map((item, index) => ({
  id: item[0] as string,
  slug: item[0] as string,
  title: item[1] as string,
  category: item[2] as string,
  status: 'Case Study in Progress',
  description: 'Additional project being prepared as a future case study.',
  technologies: item[3] as string[],
  coverImage: ph(item[0] as string, `./projects/${item[4]}`),
  imageType: 'illustrative-placeholder',
  sections: {},
  links: {},
  gallery: [],
  order: 10 + index,
  caseStudy: false,
}))
