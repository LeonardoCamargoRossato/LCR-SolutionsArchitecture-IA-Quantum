import type { Project } from '../types/project'

export const projects: Project[] = [
  {
    id: 'foton-hub',
    slug: 'foton-hub',
    title: 'Foton Hub',
    category: 'Institutional Digital Platform',
    description:
      'Institutional digital platform designed and developed for Instituto Foton, integrating people, projects, organizational resources, analytical environments and administrative tools within the Microsoft 365 ecosystem.',
    technologies: ['SharePoint', 'SPFx', 'React', 'TypeScript', 'Microsoft 365'],
    coverImage: './projects/foton-hub.svg',
    featured: true,
    badge: 'FEATURED',
    status: 'Private Platform',
    caseStudy: true,
    sections: {
      overview: {
        title: 'Overview',
        body: [
          'Foton Hub is an institutional digital platform designed to centralize environments, people, resources and operational tools used across Instituto Foton.',
          'The platform is built inside the Microsoft 365 ecosystem, combining SharePoint Framework with a React and TypeScript front end.',
        ],
      },
      challenge: {
        title: 'The Challenge',
        body: [
          'Institutional resources and operational areas can become fragmented across different pages, tools and repositories. The case study focuses on creating a clearer digital layer for navigating and organizing those environments.',
        ],
      },
      solution: {
        title: 'The Solution',
        body: [
          'A modular institutional hub was designed around reusable interface components and SharePoint-native integration, keeping the experience cohesive while respecting the Microsoft 365 environment.',
        ],
      },
      features: {
        title: 'Key Features',
        items: [
          'Ecosystem',
          'Members',
          'Administration',
          'Links Hub',
          'Analysis Lab',
          'Institutional resources',
        ],
      },
      architecture: {
        title: 'Architecture / Technologies',
        body: [
          'SharePoint Framework (SPFx) provides the institutional integration layer, while React and TypeScript structure the application interface and reusable components.',
        ],
      },
      role: {
        title: 'My Role',
        body: [
          'Platform architecture, interface design and front-end implementation across the institutional experience. Additional implementation details can be expanded as the case study evolves.',
        ],
      },
    },
    gallery: [
      { label: 'Dashboard' },
      { label: 'Members' },
      { label: 'Administration' },
      { label: 'Analysis Lab' },
    ],
  },
  {
    id: 'city-comparing',
    slug: 'city-comparing',
    title: 'City Comparing',
    subtitle: 'Econophysics & Socioeconomic Data Analysis Toolkit',
    category: 'Scientific Computing / Research Software',
    description:
      "Interactive research environment developed from my master's research to explore and compare socioeconomic datasets across cities, countries and macroregions using visual analytics, data science and econophysics techniques.",
    technologies: ['Python', 'Streamlit', 'Plotly', 'Jupyter', 'Data Science', 'Econophysics'],
    coverImage: './projects/city-comparing.svg',
    status: 'Live',
    caseStudy: true,
    links: [
      {
        label: 'Open Live Tool',
        url: 'https://analysis-socioeconomic-indicators.streamlit.app/',
        kind: 'primary',
      },
      { label: 'View Research', kind: 'secondary' },
      { label: 'View Repository', kind: 'secondary' },
    ],
    sections: {
      overview: {
        title: 'Overview',
        body: [
          "City Comparing is an interactive toolkit for comparative socioeconomic analysis, developed from master's research combining Econophysics, Visual Analytics and Data Science.",
        ],
      },
      challenge: {
        title: 'The Challenge',
        body: [
          'Comparing cities, countries and macroregions requires moving between heterogeneous data, numerical analysis and visual interpretation. The project explores how these layers can be combined into one research environment.',
        ],
      },
      solution: {
        title: 'The Solution',
        body: [
          'The toolkit organizes a research flow from data engineering to visual and numerical analysis, econophysics techniques and interactive comparison.',
          'Data → Data Engineering → Visual / Numerical Analysis → Econophysics Techniques → Interactive Visualization → Comparison.',
        ],
      },
      features: {
        title: 'Key Features',
        items: [
          'Comparing Cities',
          'Comparing Countries',
          'Comparing Macroregions',
          'Scatter-based visual analysis',
          'Clustering',
          'Graph-based analysis',
          'Interactive dashboards',
        ],
      },
      architecture: {
        title: 'Architecture / Technologies',
        body: [
          'Python supports the analysis workflow, Streamlit provides the interactive application layer, and Plotly/Jupyter support visual exploration and research-oriented iteration.',
        ],
      },
      role: {
        title: 'My Role',
        body: [
          'Research software design, data analysis workflow, interactive visualization and implementation of the comparative analysis environment.',
        ],
      },
    },
    gallery: [
      { label: 'Comparing Cities' },
      { label: 'Comparing Countries' },
      { label: 'Comparing Macroregions' },
      { label: 'Graph-based Analysis' },
    ],
  },
  {
    id: 'hamlet',
    slug: 'hamlet',
    title: 'Hamlet — Narrative Universe',
    category: 'Experimental Web Experience',
    description:
      'An experimental interactive narrative environment that explores literature, identity, characters and storytelling through a modern digital experience inspired by Hamlet.',
    technologies: ['React', 'Web Design', 'Interactive Experience', 'AI-assisted Development'],
    coverImage: './projects/hamlet.svg',
    status: 'Live',
    theme: 'dark',
    caseStudy: true,
    links: [
      {
        label: 'Explore Experience',
        url: 'https://hamlet-sociedade-ideal.lovable.app/',
        kind: 'primary',
      },
    ],
    sections: {
      overview: {
        title: 'Overview',
        body: [
          'Hamlet — Narrative Universe is an experimental web experience exploring literature and storytelling through a contemporary interactive interface.',
        ],
      },
      challenge: {
        title: 'The Challenge',
        body: [
          'The project investigates how a literary universe can be reorganized as an interactive digital experience without reducing the work to a conventional informational website.',
        ],
      },
      solution: {
        title: 'The Solution',
        body: [
          'A visual and narrative interface combines character exploration, library-like structures and story-oriented interactions in a web-native experience.',
        ],
      },
      features: {
        title: 'Key Features',
        items: ['Interactive narrative', 'Characters', 'Library', 'Storytelling', 'Visual design'],
      },
      architecture: {
        title: 'Architecture / Technologies',
        body: [
          'React structures the interactive experience, with a design system adapted to a darker, more atmospheric visual language.',
        ],
      },
      role: {
        title: 'My Role',
        body: [
          'Concept development, experience design and implementation with AI-assisted development as part of the creative workflow.',
        ],
      },
    },
    gallery: [
      { label: 'Home' },
      { label: 'Characters' },
      { label: 'Library' },
      { label: 'Narrative experiences' },
    ],
  },
  {
    id: 'speaker-portfolio',
    slug: 'speaker-portfolio',
    title: 'Speaker & Research Portfolio',
    category: 'Personal Digital Experience',
    description:
      'Personal website created to organize professional presentations, research activities, speaking engagements and selected work.',
    technologies: ['React', 'Web Design', 'Personal Branding'],
    coverImage: './projects/speaker-portfolio.svg',
    status: 'Live',
    caseStudy: true,
    links: [
      {
        label: 'Visit Website',
        url: 'https://leonardo-camargo-rossato.lovable.app/',
        kind: 'primary',
      },
    ],
    sections: {
      overview: {
        title: 'Overview',
        body: [
          'A personal digital experience designed to organize speaking activities, research communication and selected professional work.',
        ],
      },
      challenge: {
        title: 'The Challenge',
        body: [
          'Professional presentations, research activities and portfolio material need a clear public-facing structure that remains readable across different audiences.',
        ],
      },
      solution: {
        title: 'The Solution',
        body: [
          'A focused personal website brings together presentation, research and portfolio content in one visual narrative.',
        ],
      },
      features: {
        title: 'Key Features',
        items: ['Personal Branding', 'Research Communication', 'Speaking', 'Portfolio Design'],
      },
      architecture: {
        title: 'Architecture / Technologies',
        body: [
          'React-based web experience with emphasis on responsive layout, visual hierarchy and personal branding.',
        ],
      },
      role: {
        title: 'My Role',
        body: [
          'Information architecture, visual direction and implementation of the personal portfolio experience.',
        ],
      },
    },
    gallery: [
      { label: 'Homepage' },
      { label: 'Speaking' },
      { label: 'Research' },
      { label: 'Selected Work' },
    ],
  },
]

export const moreProjects: Project[] = [
  {
    id: 'esp32-control',
    slug: 'esp32-control',
    title: 'Embedded Control Platform',
    category: 'Embedded Systems',
    description: 'Web-connected control interfaces for embedded experimentation.',
    technologies: ['ESP32', 'HTML', 'CSS', 'JavaScript', 'Embedded Systems'],
    coverImage: './projects/embedded-control.svg',
    status: 'Case Study in Progress',
    caseStudy: false,
  },
  {
    id: 'scientific-analysis',
    slug: 'scientific-analysis',
    title: 'Scientific Analysis Toolkit',
    category: 'Scientific Computing',
    description: 'Research-oriented numerical and visual analysis utilities.',
    technologies: ['Python', 'Jupyter', 'Plotly', 'Interactive Widgets'],
    coverImage: './projects/scientific-analysis.svg',
    status: 'Case Study in Progress',
    caseStudy: false,
  },
  {
    id: 'streamlit-tools',
    slug: 'streamlit-tools',
    title: 'Streamlit Tools',
    category: 'Data Applications',
    description: 'Compact interactive tools for data exploration and technical workflows.',
    technologies: ['Python', 'Streamlit', 'Data Applications'],
    coverImage: './projects/streamlit-tools.svg',
    status: 'Coming Soon',
    caseStudy: false,
  },
  {
    id: 'power-platform',
    slug: 'power-platform',
    title: 'Enterprise Power Apps',
    category: 'Enterprise Applications',
    description: 'Enterprise workflows and applications built inside Microsoft ecosystems.',
    technologies: ['Power Apps', 'SharePoint', 'Power Automate', 'Microsoft 365'],
    coverImage: './projects/power-platform.svg',
    status: 'Case Study in Progress',
    caseStudy: false,
  },
  {
    id: 'webseer',
    slug: 'webseer',
    title: 'WebSeer',
    category: 'Text Analysis / Data Visualization',
    description: 'Interactive text analysis interfaces and comparison workflows.',
    technologies: ['React', 'Text Analysis', 'Data Visualization'],
    coverImage: './projects/webseer.svg',
    status: 'Case Study in Progress',
    caseStudy: false,
  },
]

export function getProjectBySlug(slug?: string) {
  if (!slug) return undefined
  return [...projects, ...moreProjects].find((project) => project.slug === slug)
}
