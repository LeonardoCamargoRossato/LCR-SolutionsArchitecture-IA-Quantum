import type { Project } from '../domain/models/Project'

export const embeddedControlProject: Project = {
  id: 'embedded-control-platform',
  slug: 'embedded-control-platform',
  title: 'Embedded Control Platform',
  subtitle: 'Academic Embedded Systems Project',
  category: 'Embedded Systems / IoT / Academic Project',
  status: 'Academic Project',
  description: 'Academic project developed for an Embedded Systems course. It documents the construction of a web server for sending web commands to an ESP32 in an IoT context; the published website is a landing page and project archive, rather than a commercial control platform.',
  technologies: ['ESP32', 'C/C++', 'Arduino', 'Web Server', 'HTML', 'CSS', 'JavaScript', 'IoT'],
  coverImage: {
    id: 'default-embedded-control-platform',
    url: './projects/embedded-control.png',
    path: './projects/embedded-control.png',
    name: 'Embedded Control Platform',
    mimeType: 'image/png',
    category: 'Projects',
    imageType: 'illustrative-placeholder',
  },
  imageType: 'illustrative-placeholder',
  sections: {
    overview: [
      'An academic project developed in an Embedded Systems course to explore communication between a web interface and an ESP32.',
      'The published website is a landing page that organizes the project context, implementation and supporting material. It is not a deployed commercial IoT platform.',
    ],
    challenge: [
      'Build and document a simple way to send commands from a browser to an ESP32 through a web server, connecting web interaction to embedded behavior.',
    ],
    solution: [
      'A web server receives commands from a browser interface and forwards the requested actions to the ESP32.',
      'The landing page presents the academic exercise and preserves the implementation as a portfolio record of the course activity.',
    ],
    architecture: {
      body: 'The academic prototype connects a browser interface, HTTP requests, a web server and the ESP32 embedded logic. The landing page documents this flow and the technologies used in the exercise.',
      items: ['Browser controls', 'HTTP commands', 'Web server', 'ESP32', 'Embedded C/C++ logic', 'IoT communication flow'],
    },
    features: [
      'Web interface for sending commands',
      'Web server communication with ESP32',
      'Embedded command handling',
      'Academic documentation landing page',
    ],
    role: [
      'Implementation and documentation of the academic web-server-to-ESP32 control exercise developed for the Embedded Systems course.',
    ],
    results: [
      'A documented academic prototype demonstrating how web commands can interact with an ESP32 through a web server in an IoT context.',
    ],
    technologies: ['ESP32', 'C/C++', 'Arduino', 'Web Server', 'HTML', 'CSS', 'JavaScript', 'IoT'],
  },
  links: {},
  gallery: [],
  order: 99,
  sortOrder: 99,
  placement: 'more',
  source: 'more',
  visible: true,
  isAcademic: true,
  institutionName: 'Instituto Tecnológico de Aeronáutica',
  academicContext: 'Embedded Systems course project · ITA',
  caseStudy: true,
  caseEnabled: true,
  translations: {
    'pt-BR': {
      subtitle: 'Projeto Acadêmico de Sistemas Embarcados',
      category: 'Sistemas Embarcados / IoT / Projeto Acadêmico',
      status: 'Projeto Acadêmico',
      description: 'Projeto acadêmico desenvolvido em uma disciplina de Sistemas Embarcados. Documenta a construção de um web server para enviar comandos web a um ESP32 no contexto de IoT; o site publicado é uma landing page e um arquivo do projeto, não uma plataforma comercial de controle.',
      academicContext: 'Projeto da disciplina de Sistemas Embarcados · ITA',
      technologies: ['ESP32', 'C/C++', 'Arduino', 'Web Server', 'HTML', 'CSS', 'JavaScript', 'IoT'],
      sections: {
        overview: [
          'Projeto acadêmico desenvolvido em uma disciplina de Sistemas Embarcados para explorar a comunicação entre uma interface web e um ESP32.',
          'O site publicado é uma landing page que organiza o contexto, a implementação e os materiais do projeto. Não se trata de uma plataforma comercial de IoT em produção.',
        ],
        challenge: [
          'Construir e documentar uma forma simples de enviar comandos de um navegador para um ESP32 por meio de um web server, conectando a interação web ao comportamento embarcado.',
        ],
        solution: [
          'Um web server recebe comandos enviados pela interface no navegador e encaminha as ações solicitadas ao ESP32.',
          'A landing page apresenta o exercício acadêmico e preserva a implementação como registro das atividades da disciplina.',
        ],
        architecture: {
          body: 'O protótipo acadêmico conecta uma interface no navegador, requisições HTTP, um web server e a lógica embarcada do ESP32. A landing page documenta esse fluxo e as tecnologias utilizadas no exercício.',
          items: ['Controles no navegador', 'Comandos HTTP', 'Web server', 'ESP32', 'Lógica embarcada em C/C++', 'Fluxo de comunicação IoT'],
        },
        features: [
          'Interface web para envio de comandos',
          'Comunicação do web server com o ESP32',
          'Tratamento embarcado dos comandos',
          'Landing page de documentação acadêmica',
        ],
        role: [
          'Implementação e documentação do exercício acadêmico de controle entre web server e ESP32 desenvolvido para a disciplina de Sistemas Embarcados.',
        ],
        results: [
          'Um protótipo acadêmico documentado que demonstra como comandos web podem interagir com um ESP32 por meio de um web server em um contexto de IoT.',
        ],
        technologies: ['ESP32', 'C/C++', 'Arduino', 'Web Server', 'HTML', 'CSS', 'JavaScript', 'IoT'],
      },
    },
  },
}
