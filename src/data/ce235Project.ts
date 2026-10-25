import type { Project } from '../domain/models/Project'

export const ce235Project: Project = {
  id: 'ce235-real-time-systems',
  slug: 'ce235-real-time-systems',
  title: 'CE235 — Real-Time Systems & Telemetry',
  subtitle: 'Academic Project · ITA',
  category: 'Real-Time Systems / Academic Software',
  status: 'Academic Project',
  isAcademic: true,
  academicContext: 'CE-235 — Real-Time Systems · ITA',
  institutionName: 'Instituto Tecnológico de Aeronáutica',
  description: 'Academic portal and telemetry demonstrator developed for CE-235 at ITA. Connects course activities, ANSYS SCADE laboratories and the SPRB-TR/BD project, highlighting the US123 Telemetry Decoder contribution to Team 2 — Ground Segment.',
  technologies: ['React', 'TypeScript', 'Vite', 'Telemetry', 'C', 'ANSYS SCADE', 'GitHub Pages'],
  coverImage: {
    id: 'ce235-cover', url: './projects/ce235-telemetry.webp', path: './projects/ce235-telemetry.webp',
    name: 'CE235 satellite and telemetry visual', mimeType: 'image/webp', category: 'Projects',
    imageType: 'illustrative-placeholder',
  },
  imageType: 'illustrative-placeholder',
  links: {
    liveUrl: 'https://leonardocamargorossato.github.io/CE235-Sistemas-Tempo-Real/#/',
    researchUrl: 'https://leonardocamargorossato.github.io/US123-Telemetry-Decoder/',
    githubUrl: 'https://github.com/LeonardoCamargoRossato/CE235-Sistemas-Tempo-Real',
  },
  sections: {
    overview: [
      'An academic portal and technical portfolio developed for CE-235 — Real-Time Systems at ITA. It brings course assignments, laboratory reports, technical artifacts and sprint deliverables into one navigable environment.',
      'Within the collaborative SPRB-TR/BD project, the Sprint 1 contribution focused on US123 in Team 2 — Ground Segment: studying, receiving, parsing, validating and visualizing telemetry.',
    ],
    challenge: ['Make the telemetry reception and validation workflow understandable and inspectable while organizing evidence and deliverables from a collaborative real-time systems course project.'],
    solution: [
      'A React/TypeScript academic portal connects the course journey to the technical project, its sprint documentation and the published US123 Telemetry Decoder demonstrator.',
      'The demonstrator uses simulated data to expose parsing, range checks, sequence validation and visualization. It is an academic demonstration, rather than a deployed satellite telemetry system.',
    ],
    approach: ['Sprint 1 organized the work around the US123 user story and subsprint #70. The demonstrator makes the path from raw telemetry to validated data visible, with an independent C implementation prepared as a reference for future SCADE/imported-operator integration.'],
    architecture: {
      body: 'The course portal uses React, Vite, TypeScript and hash-based routing on GitHub Pages. The US123 demonstrator is a separate linked application. ANSYS SCADE activities and the C reference belong to the academic engineering workflow; future integration is distinguished from the current simulated demonstration.',
      items: ['Academic portal: React / TypeScript / Vite', 'Simulated raw telemetry', 'Parsing and range checks', 'Sequence validation and visualization', 'Independent C reference implementation', 'Future SCADE integration'],
    },
    features: ['Course assignments and laboratory documentation', 'ANSYS SCADE learning activities', 'Sprint 1 evidence and technical artifacts', 'Simulated telemetry parsing and validation', 'Links to the demonstrator, source code and project issues'],
    role: ['Development and organization of the academic portal and the US123 demonstrator, documenting the contribution to Team 2 — Ground Segment within the collaborative course project.'],
    results: ['A published academic portfolio connecting the course deliverables to a functional demonstration of telemetry reception, parsing, validation and visualization using simulated data.'],
    future: ['Use the independent C implementation as a reference for future integration with SCADE/imported operators and continue documenting subsequent course deliverables.'],
    technologies: ['Web portal: React, TypeScript, Vite and GitHub Pages.', 'Academic engineering context: telemetry, independent C implementation and ANSYS SCADE laboratories.'],
  },
  translations: {
    'pt-BR': {
      title: 'CE235 — Sistemas de Tempo Real & Telemetria',
      subtitle: 'Projeto Acadêmico · ITA',
      category: 'Sistemas de Tempo Real / Software Acadêmico',
      status: 'Projeto Acadêmico',
      academicContext: 'CE-235 — Sistemas de Tempo Real · ITA',
      description: 'Portal acadêmico e demonstrador de telemetria desenvolvidos na disciplina CE-235 do ITA. Reúne atividades, laboratórios com ANSYS SCADE e o projeto SPRB-TR/BD, destacando a contribuição US123 — Telemetry Decoder no Time 2 — Segmento Ground.',
      technologies: ['React', 'TypeScript', 'Vite', 'Telemetria', 'C', 'ANSYS SCADE', 'GitHub Pages'],
      sections: {
        overview: [
          'Portal acadêmico e portfólio técnico desenvolvido para a disciplina CE-235 — Sistemas de Tempo Real, no ITA. Centraliza listas de exercícios, relatórios de laboratório, artefatos técnicos e entregas das sprints em um ambiente navegável.',
          'No projeto colaborativo SPRB-TR/BD, a contribuição da Sprint 1 concentrou-se na US123 do Time 2 — Segmento Ground: estudo, recepção, parsing, validação e visualização de telemetria.',
        ],
        challenge: ['Tornar o fluxo de recepção e validação de telemetria compreensível e inspecionável, organizando as evidências e entregas de um projeto colaborativo da disciplina de Sistemas de Tempo Real.'],
        solution: [
          'Um portal acadêmico em React/TypeScript conecta a trajetória da disciplina ao projeto técnico, à documentação das sprints e ao demonstrador publicado US123 — Telemetry Decoder.',
          'O demonstrador utiliza dados simulados para apresentar parsing, validação de faixa e sequência e visualização. Trata-se de uma demonstração acadêmica, e não de um sistema operacional de telemetria de satélites.',
        ],
        approach: ['A Sprint 1 organizou o trabalho em torno da história US123 e da subsprint #70. O demonstrador torna visível o caminho da telemetria bruta aos dados validados, com uma implementação C independente preparada como referência para integração futura com SCADE/imported operators.'],
        architecture: {
          body: 'O portal da disciplina utiliza React, Vite, TypeScript e rotas hash no GitHub Pages. O demonstrador US123 é uma aplicação separada, acessível por link. As atividades com ANSYS SCADE e a referência em C integram o fluxo acadêmico de engenharia; a integração futura é distinta da demonstração simulada atual.',
          items: ['Portal acadêmico: React / TypeScript / Vite', 'Telemetria bruta simulada', 'Parsing e validação de faixa', 'Validação de sequência e visualização', 'Implementação C independente de referência', 'Integração futura com SCADE'],
        },
        features: ['Listas de exercícios e documentação dos laboratórios', 'Atividades de aprendizagem com ANSYS SCADE', 'Evidências e artefatos técnicos da Sprint 1', 'Parsing e validação de telemetria simulada', 'Links para demonstração, código-fonte e issues do projeto'],
        role: ['Desenvolvimento e organização do portal acadêmico e do demonstrador US123, documentando a contribuição ao Time 2 — Segmento Ground no projeto colaborativo da disciplina.'],
        results: ['Um portfólio acadêmico publicado que conecta as entregas da disciplina a uma demonstração funcional de recepção, parsing, validação e visualização de telemetria com dados simulados.'],
        future: ['Utilizar a implementação C independente como referência para futura integração com SCADE/imported operators e continuar documentando as próximas entregas da disciplina.'],
        technologies: ['Portal web: React, TypeScript, Vite e GitHub Pages.', 'Contexto acadêmico de engenharia: telemetria, implementação C independente e laboratórios com ANSYS SCADE.'],
      },
    },
  },
  gallery: [], order: 9, sortOrder: 9, placement: 'more', source: 'more',
  visible: true, caseStudy: false, caseEnabled: true,
}
