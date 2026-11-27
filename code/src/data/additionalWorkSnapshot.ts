import type { Project } from '../domain/models/Project'
import type { ProjectInstitution } from '../domain/models/ProjectInstitution'

/** Public, visible editorial fields exported read-only on 2026-11-26.
 * No hidden rows or private assets. Asset URLs are replaced by exact
 * inventoried versioned paths at export; no runtime backend dependency. */
export const additionalWorkSnapshot: readonly Project[] = [
  {
    "id": "hamlet",
    "slug": "hamlet",
    "title": "Hamlet — Narrative Universe",
    "subtitle": "RAG-Powered Knowledge & Content Platform",
    "category": "Applied AI / RAG / Knowledge Systems",
    "status": "Live Project",
    "description": "Full-stack literary knowledge platform combining React/TypeScript, Supabase content management and a contextual RAG chatbot with semantic retrieval and references.",
    "technologies": [
      "React",
      "TypeScript",
      "Supabase",
      "RAG",
      "AI Chatbot",
      "Semantic Retrieval",
      "Edge Functions",
      "Knowledge Integration"
    ],
    "coverImage": {
      "id": "remote-hamlet-cover",
      "url": "assets/projects/hamlet/WebP/1789395980082-0ecbb7cb-509a-4f32-af8d-8223936c54b2-Hamlet_CapaCard.webp",
      "path": "assets/projects/hamlet/PNG/1789395980082-0ecbb7cb-509a-4f32-af8d-8223936c54b2-Hamlet_CapaCard.png",
      "name": "hamlet-cover",
      "mimeType": "image/webp",
      "category": "Projects",
      "imageType": "real-screenshot",
      "cardUrl": "assets/projects/hamlet/WebP/1789395980082-0ecbb7cb-509a-4f32-af8d-8223936c54b2-Hamlet_CapaCard.webp",
      "thumbnailUrl": "assets/projects/hamlet/WebP/1789395980082-0ecbb7cb-509a-4f32-af8d-8223936c54b2-Hamlet_CapaCard.webp",
      "fullUrl": "assets/projects/hamlet/PNG/1789395980082-0ecbb7cb-509a-4f32-af8d-8223936c54b2-Hamlet_CapaCard.png"
    },
    "imageType": "real-screenshot",
    "sections": {
      "role": [
        "Full-stack architecture, frontend modularity, database and service integration, contextual AI knowledge interactions."
      ],
      "results": [
        "Repository-verified backend chatbot, source references and web-platform capabilities; no unverified commercial or accuracy metrics."
      ],
      "features": [
        "Contextual chatbot",
        "Knowledge ingestion and management",
        "Document and character catalog",
        "Semantic chunk retrieval",
        "Supabase integration",
        "Source references"
      ],
      "overview": [
        "Full-stack narrative knowledge platform built with React/TypeScript and Supabase, combining digital publications, characters, galleries, content management and a contextual AI chatbot.",
        "Independent of the Hamlet AI module built inside AnimeFinder."
      ],
      "solution": [
        "The hamlet-chat Edge Function detects intent, retrieves semantic knowledge chunks via match_knowledge, adds relevant publication and character catalog context, builds a grounded prompt and calls the model gateway.",
        "The response returns references to retrieved sources. Multi-agent systems and fine-tuning are not presented as shipped capabilities."
      ],
      "challenge": [
        "Keep contextual access to narrative documents and characters traceable to the source content."
      ],
      "architecture": {
        "body": [
          "Reader Query → Intent Detection → Semantic RAG (knowledge_chunks / match_knowledge) + Publication/Character Catalog → Contextual Prompt → Model Gateway → Reply with Sources."
        ],
        "items": [
          "React / TypeScript / Vite",
          "Supabase DB / Auth / Storage",
          "hamlet-chat Edge Function",
          "RAG Semantic Retrieval",
          "Admin Content Management",
          "Cited Sources"
        ]
      }
    },
    "links": {
      "liveUrl": "https://hamlet-sociedade-ideal.lovable.app/",
      "githubUrl": "https://github.com/LeonardoCamargoRossato/Hamlet-Digital-Platform"
    },
    "gallery": [],
    "order": 1,
    "sortOrder": 1,
    "visible": true,
    "placement": "more",
    "source": "main",
    "featured": false,
    "theme": "default",
    "caseStudy": true,
    "caseEnabled": true,
    "isAcademic": false,
    "translations": {
      "pt-BR": {
        "title": "Hamlet — Universo Narrativo",
        "subtitle": "Plataforma de Conhecimento e Conteúdo com RAG",
        "category": "IA Aplicada / RAG / Sistemas de Conhecimento",
        "status": "Live Project",
        "description": "Plataforma literária full-stack com React/TypeScript, gerenciamento Supabase e chatbot com RAG semântico, catálogo e referências de fontes.",
        "technologies": [
          "React",
          "TypeScript",
          "Supabase",
          "RAG",
          "AI Chatbot",
          "Semantic Retrieval",
          "Edge Functions",
          "Knowledge Integration"
        ],
        "sections": {
          "role": [
            "Arquitetura full-stack, frontend modular, integração de banco e serviços, IA contextual e conhecimento."
          ],
          "results": [
            "Back-end chatbot, referências e plataforma verificados no repositório, sem métricas comerciais ou de acurácia não comprovadas."
          ],
          "features": [
            "Chatbot contextual",
            "Ingestão e gestão de conhecimento",
            "Catálogo documental e de personagens",
            "Recuperação semântica",
            "Integração com Supabase",
            "Referências das fontes"
          ],
          "overview": [
            "Plataforma de conhecimento narrativo full-stack em React/TypeScript e Supabase, com publicações, personagens, galerias, gestão de conteúdo e chatbot contextual.",
            "Independente do módulo Hamlet AI desenvolvido dentro do AnimeFinder."
          ],
          "solution": [
            "A Edge Function hamlet-chat detecta intenção, recupera fragmentos semânticos com match_knowledge, acrescenta contexto do catálogo de publicações/personagens, compõe o prompt e consulta o gateway de IA.",
            "A resposta retorna referências das fontes. Sistemas multiagentes e fine-tuning não são apresentados como funcionalidades concluídas."
          ],
          "challenge": [
            "Permitir acesso contextual a documentos e personagens mantendo a rastreabilidade das fontes."
          ],
          "architecture": {
            "body": [
              "Pergunta → Detecção de Intenção → RAG Semântico (knowledge_chunks / match_knowledge) + Catálogo → Prompt Contextual → Modelo → Resposta com Fontes."
            ],
            "items": [
              "React / TypeScript / Vite",
              "Supabase DB / Auth / Storage",
              "Edge Function hamlet-chat",
              "RAG semântico",
              "Gerenciamento de Conteúdo",
              "Referências das Fontes"
            ]
          }
        }
      }
    }
  },
  {
    "id": "speaker-portfolio",
    "slug": "speaker-portfolio",
    "title": "Speaking Portfolio",
    "subtitle": "Leonardo Camargo Rossato",
    "category": "Scientific Communication / Professional Portfolio",
    "status": "Live Project",
    "description": "Professional speaking portfolio documenting 50+ in-person talks delivered from 2023–2026 across Brazil's five macro-regions, covering real-world quantum applications, AI and emerging technologies, security/PQC, decision-making and innovation ecosystems.",
    "technologies": [
      "React",
      "Modern Front-end",
      "Lovable",
      "Responsive Components",
      "Media Galleries",
      "Routes & Sections",
      "Modular Structure"
    ],
    "coverImage": {
      "id": "remote-speaker-portfolio-cover",
      "url": "assets/projects/speaker-portfolio/WebP/1789612243746-56327e21-536e-489e-a1e7-767a6bd6dcfb-PortifolioPalestras_CapaCard.webp",
      "path": "assets/projects/speaker-portfolio/PNG/1789612243746-56327e21-536e-489e-a1e7-767a6bd6dcfb-PortifolioPalestras_CapaCard.png",
      "name": "speaker-portfolio-cover",
      "mimeType": "image/webp",
      "category": "Projects",
      "imageType": "real-screenshot",
      "cardUrl": "assets/projects/speaker-portfolio/WebP/1789612243746-56327e21-536e-489e-a1e7-767a6bd6dcfb-PortifolioPalestras_CapaCard.webp",
      "thumbnailUrl": "assets/projects/speaker-portfolio/WebP/1789612243746-56327e21-536e-489e-a1e7-767a6bd6dcfb-PortifolioPalestras_CapaCard.webp",
      "fullUrl": "assets/projects/speaker-portfolio/PNG/1789612243746-56327e21-536e-489e-a1e7-767a6bd6dcfb-PortifolioPalestras_CapaCard.png"
    },
    "imageType": "real-screenshot",
    "sections": {
      "role": [
        "Scientific and technical communication connecting research, emerging technologies, industry and innovation ecosystems."
      ],
      "context": [
        "Topics include real-world quantum applications, AI and emerging technologies, security/PQC, decision-making and innovation ecosystem development."
      ],
      "results": {
        "items": [
          "Professional information consolidated into one public experience",
          "Easily shareable presentation for organizers and partners",
          "Integration of background, speaking, events and projects",
          "Richer presentation than a standalone biography or CV",
          "Direct path to professional contact and opportunities"
        ],
        "title": "Delivered Value"
      },
      "approach": {
        "body": "Content architecture was organized into clear sections for About, Topics, Events, Gallery, Projects and Contact. A high-contrast editorial identity connects scientific communication, technology and professional positioning.",
        "title": "Approach & Implementation"
      },
      "features": [
        "South Summit 2026 panel participation",
        "RNP Forum 2026 in Brasília",
        "Quantum talk at ALESP",
        "Invited keynote lectures",
        "Graduate-level classes at Brazilian universities",
        "15+ events / technical tracks organized, coordinated or curated"
      ],
      "overview": [
        "A professional speaking portfolio documenting scientific communication, technical talks, panels, invited lectures and event participation across Brazil.",
        "The broader speaking record includes 50+ in-person talks delivered from 2023–2026 across Brazil’s five macro-regions; the website gallery is a curated subset of that record."
      ],
      "solution": {
        "body": "The Speaker Portfolio organizes this professional presence into a unified digital experience. The site works simultaneously as a professional presentation, speaking portfolio and contact point for events, companies and institutions.",
        "title": "Solution"
      },
      "challenge": {
        "body": "Professional background, biography, speaking topics, events, imagery and projects are usually distributed across different files, platforms and profiles. The challenge was to transform this information into a single visual and easily shareable professional presentation.",
        "title": "Challenge"
      },
      "advantages": "Consolidates information that would otherwise be distributed across a CV, biography, image gallery, event list and project portfolio.",
      "experience": {
        "body": "The experience begins with a high-impact visual presentation and allows visitors to navigate professional background, topics, events, photographic records and projects. Calls to action provide direct paths for speaking engagements, workshops, consulting and collaborations.",
        "title": "User Experience"
      },
      "properties": "Professional presentation, events, topics, gallery, projects, calls to action and contact within a responsive web application.",
      "architecture": {
        "body": "The solution was built as a responsive React web application using modular components, route and section navigation and dedicated structures for galleries, events, projects and calls to action.",
        "items": [
          "Professional presentation",
          "Speaking topics",
          "Event history",
          "Responsive gallery",
          "Selected projects",
          "Professional calls to action",
          "Contact"
        ],
        "title": "Architecture & Scope"
      },
      "technologies": {
        "items": [
          "React",
          "TypeScript",
          "Vite",
          "Lovable",
          "Responsive Design",
          "Media Galleries",
          "Web Publishing"
        ],
        "title": "Technology Stack"
      },
      "userExperience": [
        "The experience begins with a strong visual presentation centered on a speaking image and an identity based on black, white and yellow/gold details.",
        "Visitors can navigate sections such as About, Topics, Events, Gallery, Projects and Contact.",
        "About presents the academic and professional trajectory; Events shows congresses, conferences, panels and academic activities; Gallery presents photographic records; Projects connects communication work to technical and scientific projects.",
        "Calls to action make it possible to get in touch for talks, workshops, consulting or collaborations."
      ],
      "technologiesUsed": [
        "React and modern front-end technologies inside the Lovable ecosystem, using responsive components, media galleries, route/section navigation, modular content organization and web publishing resources."
      ]
    },
    "links": {
      "liveUrl": "https://leonardo-camargo-rossato.lovable.app/"
    },
    "gallery": [],
    "order": 4,
    "sortOrder": 4,
    "visible": true,
    "placement": "main",
    "source": "main",
    "featured": false,
    "theme": "default",
    "caseStudy": true,
    "caseEnabled": true,
    "isAcademic": false,
    "translations": {
      "pt-BR": {
        "title": "Portfólio de Palestras",
        "subtitle": "Leonardo Camargo Rossato",
        "category": "Comunicação Científica / Portfólio Profissional",
        "status": "Live Project",
        "description": "Portfólio profissional de palestras documentando 50+ apresentações presenciais realizadas entre 2023–2026 nas cinco macrorregiões do Brasil, cobrindo aplicações quânticas reais, IA e tecnologias emergentes, segurança/PQC, tomada de decisão e ecossistemas de inovação.",
        "technologies": [
          "React",
          "Modern Front-end",
          "Lovable",
          "Responsive Components",
          "Media Galleries",
          "Routes & Sections",
          "Modular Structure"
        ],
        "sections": {
          "role": [
            "Comunicação científica e técnica conectando pesquisa, tecnologias emergentes, indústria e ecossistemas de inovação."
          ],
          "context": [
            "Os temas incluem aplicações quânticas reais, IA e tecnologias emergentes, segurança/PQC, tomada de decisão e desenvolvimento de ecossistemas de inovação."
          ],
          "results": {
            "items": [
              "Informações profissionais concentradas em uma única página pública",
              "Experiência facilmente compartilhável com organizadores e parceiros",
              "Integração entre trajetória, palestras, eventos e projetos",
              "Apresentação visual mais completa do que uma biografia ou currículo isolado",
              "Caminho direto para contato e oportunidades profissionais"
            ],
            "title": "Valor entregue"
          },
          "approach": {
            "body": "A arquitetura de conteúdo foi organizada em seções claras para Sobre, Temas, Eventos, Galeria, Projetos e Contato. Uma identidade editorial de alto contraste conecta comunicação científica, tecnologia e posicionamento profissional.",
            "title": "Abordagem e implementação"
          },
          "features": [
            "Painelista no South Summit 2026",
            "RNP Forum 2026 em Brasília",
            "Palestra sobre Quantum na ALESP",
            "Keynotes e palestras convidadas",
            "Aulas em nível de pós-graduação em universidades brasileiras",
            "15+ eventos / trilhas técnicas organizados, coordenados ou curados"
          ],
          "overview": [
            "Portfólio profissional de palestras que documenta comunicação científica, apresentações técnicas, painéis, aulas convidadas e participações em eventos pelo Brasil.",
            "O histórico mais amplo inclui 50+ palestras presenciais entre 2023–2026 nas cinco macrorregiões do país; a galeria do site representa apenas uma seleção desse histórico."
          ],
          "solution": {
            "body": "O Portfólio de Palestras organiza toda essa presença profissional em uma experiência digital única. O site funciona ao mesmo tempo como apresentação profissional, portfólio de palestras e ponto de contato para eventos, empresas e instituições.",
            "title": "Solução"
          },
          "challenge": {
            "body": "Trajetória profissional, biografia, temas de palestras, eventos, imagens e projetos normalmente ficam distribuídos entre diferentes arquivos, plataformas e perfis. O desafio foi transformar essas informações em uma apresentação única, visual e facilmente compartilhável.",
            "title": "Desafio"
          },
          "advantages": "Concentra informações que normalmente seriam apresentadas separadamente em currículo, biografia, galeria, lista de eventos e portfólio.",
          "experience": {
            "body": "A experiência começa com uma apresentação visual de impacto e permite navegar por trajetória profissional, temas, eventos, registros fotográficos e projetos. Chamadas de ação direcionam o visitante para contato relacionado a palestras, workshops, consultorias ou colaborações.",
            "title": "Experiência do usuário"
          },
          "properties": "Apresentação profissional, eventos, temas, galeria, projetos, chamadas de ação e contato em uma aplicação web responsiva.",
          "architecture": {
            "body": "A solução foi construída como uma aplicação web responsiva em React, utilizando componentes modulares, navegação por rotas e seções e estruturas específicas para galerias, eventos, projetos e chamadas de ação.",
            "items": [
              "Apresentação profissional",
              "Temas de palestras",
              "Histórico de eventos",
              "Galeria responsiva",
              "Projetos selecionados",
              "Chamadas para contratação",
              "Contato profissional"
            ],
            "title": "Arquitetura e escopo"
          },
          "technologies": {
            "items": [
              "React",
              "TypeScript",
              "Vite",
              "Lovable",
              "Responsive Design",
              "Media Galleries",
              "Web Publishing"
            ],
            "title": "Tecnologias utilizadas"
          },
          "userExperience": [
            "A experiência começa com uma apresentação visual de impacto, utilizando uma imagem de palestra como elemento central e uma identidade baseada em preto, branco e detalhes em amarelo/dourado.",
            "O visitante pode navegar por seções como Sobre, Temas, Eventos, Galeria, Projetos e Contato.",
            "A seção Sobre apresenta trajetória acadêmica e profissional. Em Eventos, é possível visualizar diferentes participações em congressos, conferências, painéis e atividades acadêmicas. A Galeria apresenta registros fotográficos de palestras e eventos.",
            "A seção Projetos conecta a atividade de comunicação com trabalhos técnicos e científicos desenvolvidos. Por fim, chamadas de ação permitem entrar em contato diretamente para palestras, workshops, consultorias ou colaborações."
          ],
          "technologiesUsed": [
            "Aplicação web desenvolvida com React e tecnologias modernas de front-end dentro do ecossistema Lovable. A plataforma utiliza componentes responsivos, galerias de mídia, navegação por rotas e seções, organização modular de conteúdo e recursos próprios de publicação web."
          ]
        }
      }
    }
  },
  {
    "id": "webseer",
    "slug": "webseer",
    "title": "WebSeer",
    "category": "Research Software / Decision Support",
    "status": "Case Study in Progress",
    "description": "Research-oriented software tool for structured data/text analysis, visualization and decision-support workflows.",
    "technologies": [
      "React",
      "Text Analysis",
      "Data Visualization"
    ],
    "coverImage": {
      "id": "remote-webseer-image",
      "url": "assets/projects/webseer/WebP/1789400307805-02852533-1924-4936-990b-85f91c19e663-WebSeer_CapaCard.webp",
      "path": "assets/projects/webseer/PNG/1789400307805-02852533-1924-4936-990b-85f91c19e663-WebSeer_CapaCard.png",
      "name": "webseer-image",
      "mimeType": "image/webp",
      "category": "Icons",
      "imageType": "real-screenshot",
      "cardUrl": "assets/projects/webseer/WebP/1789400307805-02852533-1924-4936-990b-85f91c19e663-WebSeer_CapaCard.webp",
      "thumbnailUrl": "assets/projects/webseer/WebP/1789400307805-02852533-1924-4936-990b-85f91c19e663-WebSeer_CapaCard.webp",
      "fullUrl": "assets/projects/webseer/PNG/1789400307805-02852533-1924-4936-990b-85f91c19e663-WebSeer_CapaCard.png"
    },
    "imageType": "real-screenshot",
    "sections": {},
    "links": {},
    "gallery": [],
    "order": 2,
    "sortOrder": 2,
    "visible": true,
    "placement": "more",
    "source": "more",
    "featured": false,
    "theme": "default",
    "caseStudy": false,
    "caseEnabled": true,
    "isAcademic": false,
    "translations": {
      "pt-BR": {
        "title": "WebSeer",
        "category": "Software de Pesquisa / Apoio à Decisão",
        "status": "Case Study in Progress",
        "description": "Ferramenta de software de pesquisa para análise estruturada de dados/texto, visualização e fluxos de apoio à decisão.",
        "technologies": [
          "React",
          "Text Analysis",
          "Data Visualization"
        ],
        "sections": {}
      }
    }
  },
  {
    "id": "embedded-control-platform",
    "slug": "embedded-control-platform",
    "title": "Embedded Control Platform",
    "category": "Embedded Systems / IoT",
    "status": "Case Study in Progress",
    "description": "Web-based system for controlling and monitoring sensors, actuators and electronic components, developed as part of a doctoral course at Instituto Tecnológico de Aeronáutica (ITA). The solution was built end-to-end, integrating physical hardware, ESP32 embedded logic, network communication and a web interface for real-time monitoring and control.",
    "technologies": [
      "ESP32",
      "Embedded Systems",
      "C/C++",
      "Arduino",
      "HTML",
      "CSS",
      "JavaScript",
      "WebServer",
      "PWM",
      "Sensors & Actuators"
    ],
    "coverImage": {
      "id": "remote-embedded-control-platform-image",
      "url": "assets/projects/embedded-control-platform/WebP/1789580925841-e27a4260-39a0-4581-baf2-fd9c2470f97a-EmbeddedWebServer_CapaCard.webp",
      "path": "assets/projects/embedded-control-platform/PNG/1789580925841-e27a4260-39a0-4581-baf2-fd9c2470f97a-EmbeddedWebServer_CapaCard.png",
      "name": "embedded-control-platform-image",
      "mimeType": "image/webp",
      "category": "Icons",
      "imageType": "real-screenshot",
      "cardUrl": "assets/projects/embedded-control-platform/WebP/1789580925841-e27a4260-39a0-4581-baf2-fd9c2470f97a-EmbeddedWebServer_CapaCard.webp",
      "thumbnailUrl": "assets/projects/embedded-control-platform/WebP/1789580925841-e27a4260-39a0-4581-baf2-fd9c2470f97a-EmbeddedWebServer_CapaCard.webp",
      "fullUrl": "assets/projects/embedded-control-platform/PNG/1789580925841-e27a4260-39a0-4581-baf2-fd9c2470f97a-EmbeddedWebServer_CapaCard.png"
    },
    "imageType": "real-screenshot",
    "sections": {
      "role": "The project was developed end-to-end. My work included hardware assembly and integration, electronic connections, ESP32 configuration, embedded control logic, firmware implementation, web interface development and integration between all system layers. The result was not only an interface or an electronic circuit, but a complete solution spanning hardware, firmware, software and user experience.",
      "context": "The project was developed in an academic context at Instituto Tecnológico de Aeronáutica (ITA), as part of a doctoral course related to electronics and embedded systems. It provided a practical environment for exploring hardware-software integration, microcontroller programming, control of physical devices, embedded architecture and interfaces for interacting with real systems.",
      "results": "The project resulted in a functional platform capable of transforming a collection of sensors, actuators and electronic components into a web-controlled system. The implementation demonstrates the practical integration of electronics, embedded programming and web development, providing an architecture that can be extended toward IoT applications, remote laboratories, automation, prototyping and monitoring systems.",
      "approach": "Development followed an incremental approach, starting with hardware assembly and individual validation of each electronic component. Devices were then incorporated into the ESP32 embedded logic. After the hardware and firmware layers were stabilized, the web layer was implemented to expose system information, controls, settings and status. Finally, all layers were integrated into a single control platform.",
      "features": [
        "Browser-based sensor and actuator control",
        "Web interface integrated with ESP32",
        "Monitoring dashboard",
        "Alarms and events area",
        "Settings interface",
        "LED and buzzer control",
        "Servo motor control",
        "Sensor and analog input monitoring",
        "Wi-Fi communication",
        "Real-time hardware interaction",
        "Multiple electronic component integration",
        "End-to-end hardware-software architecture"
      ],
      "hardware": "The physical layer was assembled using an ESP32 together with several sensors, actuators and electronic components. Elements include LEDs, buzzer, sensors, potentiometers, display, servo motor and other experimental modules. The work involved electrical connections, GPIO allocation, device power management and individual validation of each component.",
      "overview": "Embedded Control Platform is an experimental embedded systems platform designed to control and monitor electronic components through a web interface. Developed as part of a doctoral course at ITA, the project integrates electronics, embedded systems, software and user interface design into a single solution. Sensors and actuators physically connected to the ESP32 can be monitored and controlled directly from a web browser.",
      "solution": "The solution uses an ESP32 as the central processing and control unit. Sensors, LEDs, buzzer, servo motor, motors and other components are connected to the microcontroller, which executes the embedded logic and exposes a web application through the network. A connected user can therefore visualize system information, monitor device states and send commands to physical components directly from a browser.",
      "challenge": "The main challenge was to build a complete solution in which different electronic components could be integrated with a microcontroller and controlled through a network-accessible interface. This required working simultaneously with electronics assembly, input and output configuration, control logic, hardware-software communication and development of a visual layer that could operate the system without direct interaction with an IDE or terminal.",
      "integration": "A central aspect of the project is the interaction between hardware and the web interface. Commands triggered in the browser travel through the application layer to the ESP32 and are converted into physical actions. In the opposite direction, sensor values and hardware states are processed by the microcontroller and presented back to the interface, creating a complete interaction loop between user, software and physical system.",
      "architecture": "The architecture is organized into four main layers: Hardware, containing the physical sensors and actuators; Embedded Logic, executed on the ESP32 and responsible for device control; Network Layer, using Wi-Fi for communication; and Web Interface, providing a visual layer for monitoring, configuration and control. This separation transforms a collection of independent electronic components into an integrated system.",
      "technologies": [
        "ESP32",
        "Embedded Systems",
        "C/C++",
        "Arduino",
        "HTML",
        "CSS",
        "JavaScript",
        "WebServer",
        "Wi-Fi",
        "PWM",
        "GPIO",
        "Sensors",
        "Actuators"
      ],
      "web_interface": "The web interface was developed using HTML, CSS and JavaScript and serves as the central operating panel for the system. Users can visualize information, monitor sensors, activate components and navigate through dedicated application areas. The interface includes Dashboard, Alarms and Settings sections, reducing the need for direct interaction with source code or a terminal.",
      "embedded_logic": "The embedded logic runs on the ESP32 and is responsible for interpreting sensor inputs, controlling digital and analog outputs, executing commands on actuators and maintaining the overall system state. The firmware also acts as the bridge between the physical hardware and the web interface, allowing actions performed in the browser to produce real effects on connected devices."
    },
    "links": {
      "institutionUrl": "https://www.ita.br/"
    },
    "gallery": [],
    "order": 3,
    "sortOrder": 3,
    "visible": true,
    "placement": "more",
    "source": "more",
    "featured": false,
    "theme": "default",
    "caseStudy": false,
    "caseEnabled": true,
    "isAcademic": true,
    "institutionName": "Instituto Tecnológico de Aeronáutica — ITA",
    "reportTitle": "Technical Report — Electronics and Embedded Systems",
    "academicContext": "Project developed as part of a doctoral course at ITA — Instituto Tecnológico de Aeronáutica.",
    "translations": {
      "pt-BR": {
        "title": "Plataforma de Controle Embarcado",
        "category": "Sistemas Embarcados / IoT",
        "status": "Case Study in Progress",
        "description": "Sistema de controle e monitoramento de sensores, atuadores e componentes eletrônicos desenvolvido no contexto de uma disciplina do doutorado no Instituto Tecnológico de Aeronáutica (ITA). A solução foi construída de ponta a ponta, integrando hardware físico, lógica embarcada em ESP32, comunicação via rede e uma interface web para visualização e controle em tempo real.",
        "technologies": [
          "ESP32",
          "Embedded Systems",
          "C/C++",
          "Arduino",
          "HTML",
          "CSS",
          "JavaScript",
          "WebServer",
          "PWM",
          "Sensors & Actuators"
        ],
        "sections": {
          "role": "O projeto foi desenvolvido de ponta a ponta. Minha atuação incluiu montagem e integração do hardware, definição das conexões eletrônicas, configuração do ESP32, desenvolvimento da lógica embarcada, implementação das rotinas de controle, desenvolvimento da interface web e integração entre todas as camadas do sistema. O resultado não foi apenas uma interface ou apenas um circuito, mas uma solução completa envolvendo hardware, firmware, software e experiência de uso.",
          "context": "O projeto foi desenvolvido em contexto acadêmico no Instituto Tecnológico de Aeronáutica (ITA), dentro de uma disciplina do doutorado relacionada a eletrônica e sistemas embarcados. A proposta permitiu explorar na prática conceitos de integração hardware-software, programação de microcontroladores, controle de dispositivos físicos, arquitetura de sistemas embarcados e criação de interfaces para interação com sistemas reais.",
          "results": "O projeto resultou em uma plataforma funcional capaz de transformar um conjunto de sensores, atuadores e componentes eletrônicos em um sistema controlável pela web. A implementação demonstrou na prática a integração entre eletrônica, programação embarcada e desenvolvimento web, criando uma arquitetura que pode ser expandida para aplicações de IoT, laboratórios remotos, automação, prototipagem e sistemas de monitoramento.",
          "approach": "O desenvolvimento foi realizado de forma incremental, iniciando pela montagem e validação individual dos componentes eletrônicos. Em seguida, cada dispositivo foi incorporado à lógica embarcada do ESP32. Após a estabilização do hardware e do firmware, foi implementada a camada web responsável por apresentar informações, comandos, configurações e estados do sistema. Por fim, todas as camadas foram integradas em uma única plataforma de controle.",
          "features": [
            "Controle de sensores e atuadores pelo navegador",
            "Interface web hospedada e integrada ao ESP32",
            "Dashboard de monitoramento",
            "Área de alarmes e eventos",
            "Tela de configurações",
            "Controle de LEDs e buzzer",
            "Controle de servo motor",
            "Leitura de sensores e entradas analógicas",
            "Comunicação por Wi-Fi",
            "Interação em tempo real entre interface e hardware",
            "Integração de múltiplos componentes eletrônicos",
            "Arquitetura hardware-software integrada"
          ],
          "hardware": "A camada física foi montada com ESP32 e diferentes sensores, atuadores e componentes eletrônicos. Entre os elementos utilizados estão LEDs, buzzer, sensores, potenciômetros, display, servo motor e outros módulos de experimentação. O trabalho envolveu conexão elétrica, organização das portas GPIO, alimentação dos componentes e validação individual do comportamento de cada dispositivo.",
          "overview": "A Embedded Control Platform é uma plataforma experimental de sistemas embarcados criada para controlar e monitorar componentes eletrônicos por meio de uma interface web. O projeto foi desenvolvido como parte de uma disciplina do doutorado no ITA e teve como objetivo integrar, em uma única solução, eletrônica, sistemas embarcados, software e interface de usuário. A aplicação permite que sensores e atuadores conectados fisicamente ao ESP32 sejam monitorados e comandados diretamente pelo navegador.",
          "solution": "A solução desenvolvida utiliza um ESP32 como unidade central de processamento e controle. Sensores, LEDs, buzzer, servo motor, motores e outros componentes são conectados ao microcontrolador, que executa a lógica embarcada e disponibiliza uma aplicação web pela própria rede. Dessa forma, um usuário conectado pode visualizar informações do sistema, acompanhar estados dos dispositivos e enviar comandos aos componentes físicos diretamente pelo navegador.",
          "challenge": "O desafio principal era construir uma solução completa em que diferentes componentes eletrônicos pudessem ser integrados a um microcontrolador e controlados através de uma interface acessível pela rede. Isso exigiu trabalhar simultaneamente com montagem eletrônica, definição de entradas e saídas, lógica de controle, comunicação entre hardware e software e desenvolvimento de uma camada visual que permitisse operar o sistema sem depender diretamente do terminal ou da IDE.",
          "integration": "Um dos pontos centrais do projeto foi a integração entre hardware e interface. O comando realizado no navegador percorre a camada de aplicação, chega ao ESP32 e é convertido em uma ação física. No sentido inverso, valores e estados produzidos pelos sensores são processados pelo microcontrolador e apresentados novamente na interface. Isso cria um ciclo completo de interação entre usuário, software e sistema físico.",
          "architecture": "A arquitetura pode ser entendida em quatro camadas principais: Hardware, responsável pelos sensores e atuadores físicos; Embedded Logic, executada no ESP32 e responsável pelo controle dos dispositivos; Network Layer, utilizando Wi-Fi para comunicação; e Web Interface, que disponibiliza ao usuário uma camada visual para monitoramento, configuração e controle. Essa separação permitiu transformar um conjunto de componentes eletrônicos independentes em um sistema integrado.",
          "technologies": [
            "ESP32",
            "Embedded Systems",
            "C/C++",
            "Arduino",
            "HTML",
            "CSS",
            "JavaScript",
            "WebServer",
            "Wi-Fi",
            "PWM",
            "GPIO",
            "Sensors",
            "Actuators"
          ],
          "web_interface": "A interface web foi desenvolvida utilizando HTML, CSS e JavaScript e funciona como painel central de operação do sistema. Por meio dela, o usuário pode visualizar informações, acompanhar sensores, acionar componentes e navegar por áreas específicas da aplicação. A interface foi organizada em páginas e painéis de Dashboard, Alarmes e Configurações, reduzindo a necessidade de interação direta com o código ou com o terminal.",
          "embedded_logic": "A lógica embarcada foi implementada no ESP32 e é responsável por interpretar entradas dos sensores, controlar saídas digitais e analógicas, executar comandos sobre atuadores e atualizar o estado geral do sistema. O firmware também atua como ponte entre o hardware físico e a interface web, permitindo que ações realizadas no navegador produzam efeitos reais nos componentes conectados."
        },
        "reportTitle": "Relatório Técnico — Eletrônica e Sistemas Embarcados",
        "academicContext": "Projeto desenvolvido no contexto de uma disciplina do doutorado no ITA — Instituto Tecnológico de Aeronáutica."
      }
    }
  },
  {
    "id": "quantum-education-apps",
    "slug": "quantum-education-apps",
    "title": "Quantum Computing Educational Apps",
    "subtitle": "Interactive quantum computing education developed in academic environments",
    "category": "Educational Software / Quantum Computing",
    "status": "Academic Project",
    "description": "Collection of interactive quantum computing educational applications developed in academic contexts connected to UFRGS, LACQ Feynman and university teaching/outreach activities.",
    "technologies": [
      "Python",
      "Streamlit",
      "Jupyter Notebook",
      "Computação Quântica",
      "Software Educacional"
    ],
    "coverImage": {
      "id": "remote-quantum-education-apps-image",
      "url": "assets/projects/quantum-education-apps/WebP/1789577934619-2416ce1d-3b63-4edc-a7cd-c74989da990a-QuantumEduApps_CapaCard.webp",
      "path": "assets/projects/quantum-education-apps/PNG/1789577934619-2416ce1d-3b63-4edc-a7cd-c74989da990a-QuantumEduApps_CapaCard.png",
      "name": "quantum-education-apps-image",
      "mimeType": "image/webp",
      "category": "Icons",
      "imageType": "real-screenshot",
      "cardUrl": "assets/projects/quantum-education-apps/WebP/1789577934619-2416ce1d-3b63-4edc-a7cd-c74989da990a-QuantumEduApps_CapaCard.webp",
      "thumbnailUrl": "assets/projects/quantum-education-apps/WebP/1789577934619-2416ce1d-3b63-4edc-a7cd-c74989da990a-QuantumEduApps_CapaCard.webp",
      "fullUrl": "assets/projects/quantum-education-apps/PNG/1789577934619-2416ce1d-3b63-4edc-a7cd-c74989da990a-QuantumEduApps_CapaCard.png"
    },
    "imageType": "real-screenshot",
    "sections": {
      "role": [
        "Solution architecture",
        "Software development",
        "Scientific modeling",
        "Educational experience design",
        "Quantum technology communication"
      ],
      "context": [
        "This initiative brings together interactive educational applications developed and presented in academic contexts connected to UFRGS, LACQ Feynman and other university environments.",
        "The objective is to transform theoretical quantum concepts into software experiences that users can explore step by step."
      ],
      "results": [
        "Interactive visualization of quantum computing concepts.",
        "Step-by-step learning flow instead of a purely theoretical presentation.",
        "Reusable software demonstrations for classes, presentations and academic outreach.",
        "A foundation for expanding the collection into additional quantum education applications."
      ],
      "approach": [
        "The experience guides the user through state preparation, quantum circuit execution, measurement, classical communication, corrections and final verification.",
        "The interface was designed to reduce the abstraction barrier while preserving the conceptual sequence of the protocol."
      ],
      "features": [
        "Interactive quantum teleportation demonstration",
        "Alice-to-Bob educational workflow",
        "Quantum state selection",
        "Circuit execution and measurement",
        "Classical communication step",
        "Final-state verification"
      ],
      "solution": [
        "A collection of lightweight interactive applications was designed to combine conceptual explanations, visual feedback and executable demonstrations of quantum computing phenomena.",
        "The first application presents the quantum teleportation protocol through the interaction between Alice and Bob."
      ],
      "challenge": [
        "Quantum computing concepts are often introduced through highly abstract mathematical descriptions, which can make the first contact with the field difficult for students and non-specialist audiences."
      ],
      "experience": [
        "Users interact directly with parameters and follow the evolution of the quantum protocol instead of only reading a static explanation."
      ],
      "architecture": [
        "The solution combines Python-based computational logic with Streamlit interfaces and notebook-oriented experimentation.",
        "The applications are structured as independent educational modules that can be expanded to cover additional quantum algorithms, protocols and communication concepts."
      ],
      "technologies": [
        "Python",
        "Streamlit",
        "Jupyter Notebook",
        "Quantum Computing",
        "Educational Software"
      ]
    },
    "links": {
      "liveUrl": "https://teleport-quantum-communication.streamlit.app"
    },
    "gallery": [],
    "order": 5,
    "sortOrder": 5,
    "visible": true,
    "placement": "more",
    "source": "more",
    "featured": false,
    "theme": "default",
    "caseStudy": false,
    "caseEnabled": true,
    "isAcademic": false,
    "translations": {
      "pt-BR": {
        "title": "Apps Educacionais para Computação Quântica",
        "subtitle": "Educação interativa em computação quântica desenvolvida em ambientes acadêmicos",
        "category": "Software Educacional / Computação Quântica",
        "status": "Projeto Acadêmico",
        "description": "Coleção de aplicações educacionais interativas de computação quântica desenvolvidas em contextos acadêmicos ligados à UFRGS, à LACQ Feynman e a atividades universitárias de ensino e extensão.",
        "technologies": [
          "Python",
          "Streamlit",
          "Jupyter Notebook",
          "Computação Quântica",
          "Software Educacional"
        ],
        "sections": {
          "role": [
            "Arquitetura da solução",
            "Desenvolvimento de software",
            "Modelagem científica",
            "Design da experiência educacional",
            "Comunicação de tecnologias quânticas"
          ],
          "context": [
            "Esta iniciativa reúne aplicações educacionais interativas desenvolvidas e apresentadas em contextos acadêmicos ligados à UFRGS, ao LACQ Feynman e a outros ambientes universitários.",
            "O objetivo é transformar conceitos teóricos de computação quântica em experiências de software que possam ser exploradas passo a passo."
          ],
          "results": [
            "Visualização interativa de conceitos de computação quântica.",
            "Aprendizado passo a passo em vez de uma apresentação exclusivamente teórica.",
            "Demonstrações reutilizáveis em aulas, palestras e atividades acadêmicas.",
            "Base para expansão da coleção com novas aplicações de educação quântica."
          ],
          "approach": [
            "A experiência conduz o usuário pela preparação do estado, execução do circuito quântico, medição, comunicação clássica, aplicação das correções e verificação final.",
            "A interface foi projetada para reduzir a barreira de abstração sem perder a sequência conceitual do protocolo."
          ],
          "features": [
            "Demonstração interativa de teleporte quântico",
            "Fluxo educacional Alice → Bob",
            "Seleção do estado quântico",
            "Execução e medição do circuito",
            "Etapa de comunicação clássica",
            "Verificação do estado final"
          ],
          "solution": [
            "Foi desenvolvida uma coleção de aplicações interativas leves que combinam explicações conceituais, feedback visual e demonstrações executáveis de fenômenos da computação quântica.",
            "A primeira aplicação apresenta o protocolo de teleporte quântico por meio da interação entre Alice e Bob."
          ],
          "challenge": [
            "Conceitos de computação quântica normalmente são apresentados por meio de descrições matemáticas bastante abstratas, o que pode tornar o primeiro contato com a área difícil para estudantes e públicos não especializados."
          ],
          "experience": [
            "O usuário interage diretamente com parâmetros e acompanha a evolução do protocolo quântico, em vez de apenas consumir uma explicação estática."
          ],
          "architecture": [
            "A solução combina lógica computacional baseada em Python com interfaces Streamlit e experimentação orientada por notebooks.",
            "As aplicações são estruturadas como módulos educacionais independentes que podem ser expandidos para novos algoritmos, protocolos e conceitos de comunicação quântica."
          ],
          "technologies": [
            "Python",
            "Streamlit",
            "Jupyter Notebook",
            "Computação Quântica",
            "Software Educacional"
          ]
        }
      }
    }
  }
]
export const additionalInstitutionSnapshot: readonly ProjectInstitution[] = [
  {
    "id": "c71b072f-3b2d-4187-8413-cd38a108d76d",
    "projectId": "city-comparing",
    "projectSource": "projects",
    "institutionName": "Instituto de Física - UFRGS",
    "institutionLogoUrl": "assets/institutions/svg/instituto-fisica-ufrgs.svg",
    "institutionUrl": "https://www.if.ufrgs.br/",
    "sortOrder": 2,
    "visible": true
  },
  {
    "id": "2b85d8be-573b-42f6-9771-eef890c3b12b",
    "projectId": "city-comparing",
    "projectSource": "projects",
    "institutionName": "UFRGS",
    "institutionLogoUrl": "assets/institutions/svg/ufrgs.svg",
    "institutionUrl": "https://www.ufrgs.br/",
    "sortOrder": 3,
    "visible": true
  },
  {
    "id": "88c1f798-36ab-4848-9ee2-8e6a453edb30",
    "projectId": "embedded-control-platform",
    "projectSource": "more_projects",
    "institutionName": "ITA_logo",
    "institutionLogoUrl": "assets/institutions/svg/ita.svg",
    "sortOrder": 1,
    "visible": true
  },
  {
    "id": "e6aa90d6-1676-4f56-8179-92f5772bfe6f",
    "projectId": "quantum-education-apps",
    "projectSource": "more_projects",
    "institutionName": "LogoInstitutoPense+ (1000 X 200 Px) - 1",
    "institutionLogoUrl": "assets/institutions/svg/instituto-pense-mais.svg",
    "sortOrder": 1,
    "visible": true
  },
  {
    "id": "0202d5d6-b933-405f-a8b8-c1985545dc1f",
    "projectId": "quantum-education-apps",
    "projectSource": "more_projects",
    "institutionName": "Logo Foton - Azul",
    "institutionLogoUrl": "assets/institutions/svg/instituto-foton.svg",
    "sortOrder": 2,
    "visible": true
  },
  {
    "id": "51859eeb-1e4f-47e5-86c9-d33a31d43fb2",
    "projectId": "webseer",
    "projectSource": "more_projects",
    "institutionName": "ITA_logo",
    "institutionLogoUrl": "assets/institutions/svg/ita.svg",
    "sortOrder": 1,
    "visible": true
  },
  {
    "id": "422c43dc-1c18-4cf4-91d6-6af22b7e4bde",
    "projectId": "webseer",
    "projectSource": "more_projects",
    "institutionName": "Logo Foton - Azul",
    "institutionLogoUrl": "assets/institutions/svg/instituto-foton.svg",
    "sortOrder": 2,
    "visible": true
  }
]
