-- LCR Portfolio — GitHub project selection update (2026)
-- Source of truth: Supabase. This patch does not make defaultProjects.ts editorially authoritative.
-- Review in a branch/PR first; execute in Supabase SQL Editor only after approval.

begin;

-- Keep the schema compatible with the current SupabaseProjectRepository mapping.
alter table public.more_projects add column if not exists subtitle_en text;
alter table public.more_projects add column if not exists subtitle_pt text;
alter table public.more_projects add column if not exists status_en text;
alter table public.more_projects add column if not exists status_pt text;
alter table public.more_projects add column if not exists sections_en jsonb not null default '{}'::jsonb;
alter table public.more_projects add column if not exists sections_pt jsonb not null default '{}'::jsonb;
alter table public.more_projects add column if not exists case_enabled boolean not null default true;
alter table public.more_projects add column if not exists image_url text;
alter table public.more_projects add column if not exists project_url text;
alter table public.more_projects add column if not exists github_url text;
alter table public.more_projects add column if not exists institution_url text;
alter table public.more_projects add column if not exists is_academic boolean not null default false;
alter table public.more_projects add column if not exists institution_name text;
alter table public.more_projects add column if not exists institution_logo_url text;
alter table public.more_projects add column if not exists report_pdf_url text;
alter table public.more_projects add column if not exists report_title_en text;
alter table public.more_projects add column if not exists report_title_pt text;
alter table public.more_projects add column if not exists academic_context_en text;
alter table public.more_projects add column if not exists academic_context_pt text;
alter table public.more_projects add column if not exists placement text not null default 'more';

-- -----------------------------------------------------------------------------
-- 1) Consolidate Cities Comparing as one case with two complementary components.
--    Analysis_SocioEconomic_Indicator = Python/Streamlit analytics application.
--    CitiesComparing_ResearchPlatform = React research portal (V0 static frontend;
--    Python backend/API is planned, not presented as completed).
-- -----------------------------------------------------------------------------

update public.projects
set
  title_en = 'Cities Comparing',
  title_pt = 'Cities Comparing',
  subtitle_en = 'Socioeconomic Analytics & Research Platform',
  subtitle_pt = 'Analytics Socioeconômico & Plataforma de Pesquisa',
  category_en = 'Data Engineering / Quantitative Analysis',
  category_pt = 'Engenharia de Dados / Análise Quantitativa',
  short_description_en = 'Research-derived socioeconomic analytics ecosystem combining a Python/Streamlit analysis application with a React research portal for notebooks, methods and project resources.',
  short_description_pt = 'Ecossistema de analytics socioeconômico derivado de pesquisa, combinando uma aplicação de análise em Python/Streamlit com um portal React para notebooks, métodos e recursos do projeto.',
  github_url = 'https://github.com/LeonardoCamargoRossato/Analysis_SocioEconomic_Indicator',
  research_url = 'https://github.com/LeonardoCamargoRossato/CitiesComparing_ResearchPlatform',
  sections_en = jsonb_build_object(
    'overview', jsonb_build_array(
      'Cities Comparing is a research-derived ecosystem for comparing socioeconomic indicators across cities, regions and countries.',
      'The ecosystem has two complementary components: Analysis_SocioEconomic_Indicator contains the Python/Streamlit analytical application and research methods; CitiesComparing_ResearchPlatform is the React portal that organizes notebooks, research resources and access to the analytical work.'
    ),
    'challenge', jsonb_build_array(
      'Socioeconomic datasets from different countries use different structures, scales and conventions, which makes direct comparison difficult without cleaning, standardization, validation and careful visual analysis.'
    ),
    'solution', jsonb_build_array(
      'The Python/Streamlit component provides interactive socioeconomic analysis with scatter-based workflows, binscatter techniques and graph-oriented analysis.',
      'The React research portal provides a browser-accessible structure for research pages, notebooks, analysis resources and documentation. Its current V0 is a static frontend; the Python computational backend/API is planned for future integration.'
    ),
    'architecture', jsonb_build_object(
      'body', 'A two-part research-software ecosystem: Python/Streamlit for the current analytical application and React/Vite for the research portal. The portal does not currently require a Python backend to run.',
      'items', jsonb_build_array('Python / Streamlit analytics', 'React / Vite research portal', 'Jupyter notebooks', 'CSV/data processing', 'Scatter and binscatter analysis', 'Graph-based methods')
    ),
    'features', jsonb_build_array(
      'Cross-country socioeconomic comparison',
      'Scatter-plot and binscatter workflows',
      'Graph-oriented analytical methods',
      'Interactive Streamlit exploration',
      'Research portal for notebooks and resources',
      'Clear separation between current frontend capabilities and planned backend integration'
    ),
    'role', jsonb_build_array(
      'Research-software development spanning data preparation, quantitative analysis, algorithm development, interactive visualization and the organization of research outputs into a web portal.'
    ),
    'results', jsonb_build_array(
      'A consolidated portfolio case that connects the underlying socioeconomic-analysis software with a dedicated research portal without presenting planned API work as already implemented.'
    ),
    'technologies', jsonb_build_array('Python', 'Streamlit', 'Jupyter', 'React', 'Vite', 'Data Visualization', 'Econophysics', 'Graph Analysis')
  ),
  sections_pt = jsonb_build_object(
    'overview', jsonb_build_array(
      'Cities Comparing é um ecossistema derivado de pesquisa para comparar indicadores socioeconômicos entre cidades, regiões e países.',
      'O ecossistema possui dois componentes complementares: Analysis_SocioEconomic_Indicator contém a aplicação analítica em Python/Streamlit e os métodos de pesquisa; CitiesComparing_ResearchPlatform é o portal React que organiza notebooks, recursos de pesquisa e acesso ao trabalho analítico.'
    ),
    'challenge', jsonb_build_array(
      'Bases socioeconômicas de diferentes países usam estruturas, escalas e convenções distintas, dificultando a comparação direta sem limpeza, padronização, validação e análise visual cuidadosa.'
    ),
    'solution', jsonb_build_array(
      'O componente Python/Streamlit oferece análise socioeconômica interativa com fluxos de scatter, técnicas de binscatter e análises orientadas a grafos.',
      'O portal React fornece uma estrutura web para páginas de pesquisa, notebooks, recursos analíticos e documentação. A V0 atual é um frontend estático; o backend/API computacional em Python está planejado para integração futura.'
    ),
    'architecture', jsonb_build_object(
      'body', 'Ecossistema de software de pesquisa em duas partes: Python/Streamlit para a aplicação analítica atual e React/Vite para o portal de pesquisa. O portal atualmente não depende de backend Python para funcionar.',
      'items', jsonb_build_array('Analytics em Python / Streamlit', 'Portal de pesquisa React / Vite', 'Notebooks Jupyter', 'Processamento CSV/dados', 'Scatter e binscatter', 'Métodos baseados em grafos')
    ),
    'features', jsonb_build_array(
      'Comparação socioeconômica entre países',
      'Fluxos de scatter e binscatter',
      'Métodos analíticos orientados a grafos',
      'Exploração interativa em Streamlit',
      'Portal de pesquisa para notebooks e recursos',
      'Separação clara entre capacidades atuais e integração futura de backend'
    ),
    'role', jsonb_build_array(
      'Desenvolvimento de software de pesquisa cobrindo preparação de dados, análise quantitativa, desenvolvimento de algoritmos, visualização interativa e organização dos resultados em um portal web.'
    ),
    'results', jsonb_build_array(
      'Um case consolidado que conecta o software de análise socioeconômica ao portal de pesquisa sem apresentar a API planejada como funcionalidade já implementada.'
    ),
    'technologies', jsonb_build_array('Python', 'Streamlit', 'Jupyter', 'React', 'Vite', 'Visualização de Dados', 'Econofísica', 'Análise de Grafos')
  ),
  technologies = array['Python','Streamlit','Jupyter','React','Vite','Data Visualization','Econophysics','Graph Analysis'],
  updated_at = now()
where id = 'city-comparing' or slug in ('city-comparing','cities-comparing');

-- -----------------------------------------------------------------------------
-- 2) Hamlet TTS Service — additional case. No illustrative image is inserted.
-- -----------------------------------------------------------------------------

insert into public.more_projects (
  id, slug, title_en, title_pt, subtitle_en, subtitle_pt,
  description_en, description_pt, category_en, category_pt,
  technologies, status_en, status_pt, sections_en, sections_pt,
  case_enabled, image_url, project_url, github_url, visible, placement,
  sort_order, updated_at
) values (
  'hamlet-tts-service',
  'hamlet-tts-service',
  'Hamlet TTS Service',
  'Hamlet TTS Service',
  'Authenticated Speech Synthesis Backend',
  'Backend Autenticado de Síntese de Voz',
  'Authenticated FastAPI service for Brazilian Portuguese speech synthesis with Piper, WAV/MP3 output, FFmpeg conversion and Docker deployment.',
  'Serviço FastAPI autenticado para síntese de voz em português brasileiro com Piper, saída WAV/MP3, conversão via FFmpeg e deploy com Docker.',
  'Backend / Applied AI Infrastructure',
  'Backend / Infraestrutura de IA Aplicada',
  array['Python','FastAPI','Piper TTS','FFmpeg','Docker','REST API'],
  'Backend Service',
  'Serviço Backend',
  jsonb_build_object(
    'overview', jsonb_build_array('Dedicated TTS backend for Hamlet, separating speech synthesis from the frontend behind an authenticated HTTP service.'),
    'challenge', jsonb_build_array('Speech synthesis needs binary media handling, service authentication, voice/model configuration and deployment concerns that should not live inside the browser application.'),
    'solution', jsonb_build_array('FastAPI exposes a protected POST /tts endpoint and GET /health endpoint, delegates PT-BR synthesis to Piper and optionally converts WAV output to MP3 with FFmpeg.'),
    'architecture', jsonb_build_object('body','Hamlet frontend → secure edge/service layer → bearer-authenticated FastAPI service → Piper synthesis → optional FFmpeg conversion → binary audio response.','items',jsonb_build_array('Authenticated API','Piper PT-BR synthesis','WAV/MP3','FFmpeg','Docker','Health check')),
    'role', jsonb_build_array('Backend/API design, containerization, authentication-by-secret, media processing and integration-oriented service architecture.'),
    'results', jsonb_build_array('A small deployable service that isolates speech synthesis as a reusable backend capability for the Hamlet platform.'),
    'technologies', jsonb_build_array('Python','FastAPI','Piper TTS','FFmpeg','Docker')
  ),
  jsonb_build_object(
    'overview', jsonb_build_array('Backend dedicado de TTS para o Hamlet, separando a síntese de voz do frontend por meio de um serviço HTTP autenticado.'),
    'challenge', jsonb_build_array('Síntese de voz envolve mídia binária, autenticação entre serviços, configuração de vozes/modelos e questões de deploy que não devem ficar acopladas à aplicação no navegador.'),
    'solution', jsonb_build_array('FastAPI expõe POST /tts protegido e GET /health, delega a síntese PT-BR ao Piper e pode converter WAV para MP3 com FFmpeg.'),
    'architecture', jsonb_build_object('body','Frontend Hamlet → camada segura/edge → FastAPI autenticado por bearer token → Piper → conversão opcional FFmpeg → resposta binária de áudio.','items',jsonb_build_array('API autenticada','Síntese PT-BR com Piper','WAV/MP3','FFmpeg','Docker','Health check')),
    'role', jsonb_build_array('Projeto de backend/API, containerização, autenticação por segredo, processamento de mídia e arquitetura orientada à integração.'),
    'results', jsonb_build_array('Um serviço pequeno e implantável que isola síntese de voz como capacidade reutilizável da plataforma Hamlet.'),
    'technologies', jsonb_build_array('Python','FastAPI','Piper TTS','FFmpeg','Docker')
  ),
  true, null, null,
  'https://github.com/LeonardoCamargoRossato/hamlet-tts-service',
  true, 'more', 20, now()
)
on conflict (id) do update set
  slug = excluded.slug,
  title_en = excluded.title_en,
  title_pt = excluded.title_pt,
  subtitle_en = excluded.subtitle_en,
  subtitle_pt = excluded.subtitle_pt,
  description_en = excluded.description_en,
  description_pt = excluded.description_pt,
  category_en = excluded.category_en,
  category_pt = excluded.category_pt,
  technologies = excluded.technologies,
  status_en = excluded.status_en,
  status_pt = excluded.status_pt,
  sections_en = excluded.sections_en,
  sections_pt = excluded.sections_pt,
  case_enabled = excluded.case_enabled,
  github_url = excluded.github_url,
  visible = excluded.visible,
  placement = excluded.placement,
  sort_order = excluded.sort_order,
  updated_at = now();

-- -----------------------------------------------------------------------------
-- 3) US123 Telemetry Decoder — academic case. Uses simulated packets; SCADE
--    integration is explicitly described as future work.
-- -----------------------------------------------------------------------------

insert into public.more_projects (
  id, slug, title_en, title_pt, subtitle_en, subtitle_pt,
  description_en, description_pt, category_en, category_pt,
  technologies, status_en, status_pt, sections_en, sections_pt,
  case_enabled, image_url, project_url, github_url,
  is_academic, institution_name, academic_context_en, academic_context_pt,
  visible, placement, sort_order, updated_at
) values (
  'us123-telemetry-decoder',
  'us123-telemetry-decoder',
  'US123 Telemetry Decoder',
  'US123 Telemetry Decoder',
  'Telemetry Processing & Validation Demo',
  'Demo de Processamento & Validação de Telemetria',
  'Academic telemetry-processing demo with React/TypeScript visualization, simulated satellite packets, range/sequence validation and a standalone C pipeline.',
  'Demonstrador acadêmico de processamento de telemetria com visualização React/TypeScript, pacotes simulados, validação de faixa/sequência e pipeline C independente.',
  'Real-Time Systems / Embedded Software',
  'Sistemas de Tempo Real / Software Embarcado',
  array['React','TypeScript','C','Telemetry','Data Validation','GitHub Pages'],
  'Academic Project',
  'Projeto Acadêmico',
  jsonb_build_object(
    'overview', jsonb_build_array('Academic demonstrator developed for ITA CE-235 and the SPRB-TR/BD Ground Segment work around US123.'),
    'challenge', jsonb_build_array('Represent the receive → parse → validate → visualize telemetry flow in a testable browser demo before later integration work with the wider real-time-system toolchain.'),
    'solution', jsonb_build_array('The React/TypeScript application reads 180 simulated telemetry packets, performs parsing plus sequence/range checks and presents the results for inspection. A standalone C implementation preserves the processing logic independently of the UI.'),
    'architecture', jsonb_build_object('body','Simulated JSONL telemetry → TypeScript parsing/validation → React visualization, with a separate C processing implementation. The I/O layer is separated to support future SCADE/imported-operator integration; that integration is not presented as completed.','items',jsonb_build_array('180 simulated packets','Sequence validation','Range validation','React visualization','Standalone C logic','Future SCADE integration')),
    'role', jsonb_build_array('Academic software implementation, validation logic, UI visualization and separation of processing logic from future integration layers.'),
    'results', jsonb_build_array('A working academic demonstrator and a documented processing reference for the US123 telemetry task.'),
    'technologies', jsonb_build_array('React','TypeScript','C','Telemetry','Data Validation')
  ),
  jsonb_build_object(
    'overview', jsonb_build_array('Demonstrador acadêmico desenvolvido para a CE-235 no ITA e para o trabalho do Segmento Ground do projeto SPRB-TR/BD relacionado à US123.'),
    'challenge', jsonb_build_array('Representar o fluxo recepção → parsing → validação → visualização de telemetria em um demonstrador testável antes de integrações futuras com a cadeia de sistemas de tempo real.'),
    'solution', jsonb_build_array('A aplicação React/TypeScript lê 180 pacotes simulados de telemetria, executa parsing, verifica sequência e faixas e apresenta os resultados. Uma implementação C independente preserva a lógica de processamento fora da UI.'),
    'architecture', jsonb_build_object('body','Telemetria JSONL simulada → parsing/validação TypeScript → visualização React, com implementação C separada. A camada de I/O foi separada para futura integração com SCADE/imported operators; essa integração não é apresentada como concluída.','items',jsonb_build_array('180 pacotes simulados','Validação de sequência','Validação de faixa','Visualização React','Lógica C independente','Integração SCADE futura')),
    'role', jsonb_build_array('Implementação acadêmica do software, lógica de validação, visualização e separação do processamento das camadas futuras de integração.'),
    'results', jsonb_build_array('Um demonstrador acadêmico funcional e uma referência documentada de processamento para a tarefa de telemetria US123.'),
    'technologies', jsonb_build_array('React','TypeScript','C','Telemetria','Validação de Dados')
  ),
  true, null,
  'https://leonardocamargorossato.github.io/US123-Telemetry-Decoder/',
  'https://github.com/LeonardoCamargoRossato/US123-Telemetry-Decoder',
  true, 'Instituto Tecnológico de Aeronáutica — ITA',
  'CE-235 — Real-Time Systems doctoral coursework; complementary documentation is available in the CE235-Sistemas-Tempo-Real repository.',
  'Disciplina de doutorado CE-235 — Sistemas de Tempo Real; documentação complementar está disponível no repositório CE235-Sistemas-Tempo-Real.',
  true, 'more', 21, now()
)
on conflict (id) do update set
  slug = excluded.slug,
  title_en = excluded.title_en,
  title_pt = excluded.title_pt,
  subtitle_en = excluded.subtitle_en,
  subtitle_pt = excluded.subtitle_pt,
  description_en = excluded.description_en,
  description_pt = excluded.description_pt,
  category_en = excluded.category_en,
  category_pt = excluded.category_pt,
  technologies = excluded.technologies,
  status_en = excluded.status_en,
  status_pt = excluded.status_pt,
  sections_en = excluded.sections_en,
  sections_pt = excluded.sections_pt,
  case_enabled = excluded.case_enabled,
  project_url = excluded.project_url,
  github_url = excluded.github_url,
  is_academic = excluded.is_academic,
  institution_name = excluded.institution_name,
  academic_context_en = excluded.academic_context_en,
  academic_context_pt = excluded.academic_context_pt,
  visible = excluded.visible,
  placement = excluded.placement,
  sort_order = excluded.sort_order,
  updated_at = now();

-- -----------------------------------------------------------------------------
-- 4) PI Controller Design Study — coursework case grounded in the files under
--    Code_Courses_I-ve_takenAt_Universities/Engenharia de Sistemas.
-- -----------------------------------------------------------------------------

insert into public.more_projects (
  id, slug, title_en, title_pt, subtitle_en, subtitle_pt,
  description_en, description_pt, category_en, category_pt,
  technologies, status_en, status_pt, sections_en, sections_pt,
  case_enabled, image_url, project_url, github_url,
  is_academic, academic_context_en, academic_context_pt,
  visible, placement, sort_order, updated_at
) values (
  'pi-controller-design-study',
  'pi-controller-design-study',
  'PI Controller Design Study',
  'Estudo de Projeto de Controlador PI',
  'MATLAB, Multicriteria Selection & Plotly',
  'MATLAB, Seleção Multicritério & Plotly',
  'Systems-engineering study of PI-controller design using Kp/Ki parameter sweeps, performance indicators, multicriteria filtering, the Kreisselmeier-Steinhäuser criterion and interactive Plotly visualizations.',
  'Estudo de engenharia de sistemas para projeto de controlador PI usando varredura Kp/Ki, indicadores de desempenho, filtragem multicritério, critério de Kreisselmeier-Steinhäuser e visualizações interativas em Plotly.',
  'Control Systems / Optimization',
  'Sistemas de Controle / Otimização',
  array['MATLAB','Control Systems','Python','Plotly','Pandas','Multicriteria Analysis','Optimization'],
  'Academic Study',
  'Estudo Acadêmico',
  jsonb_build_object(
    'overview', jsonb_build_array('Systems-engineering coursework focused on comparing PI-controller gain combinations through quantitative performance indicators and multicriteria trade-offs.'),
    'challenge', jsonb_build_array('Explore a large Kp/Ki design space while balancing rise time, overshoot, undershoot and ramp steady-state error under stability and performance constraints.'),
    'solution', jsonb_build_array('MATLAB scripts sweep candidate gains, calculate performance indicators, filter unstable or out-of-limit solutions and apply the Kreisselmeier-Steinhäuser criterion. Python/Plotly scripts complement the analysis with interactive parallel-coordinate visualizations and progressive filtering.'),
    'architecture', jsonb_build_object('body','MATLAB control-system simulation and indicator generation → CSV outputs → multicriteria/KS ranking → Python/Plotly interactive visualization for trade-off exploration.','items',jsonb_build_array('Kp/Ki sweeps','Performance indicators','Stability filtering','KS criterion','Parallel coordinates','Interactive Plotly filtering')),
    'role', jsonb_build_array('Implemented and documented the analysis workflow, indicator calculation, multicriteria selection and complementary interactive visualization.'),
    'results', jsonb_build_array('A traceable workflow for comparing candidate PI-controller gains quantitatively and visually rather than selecting gains from a single metric.'),
    'technologies', jsonb_build_array('MATLAB','Control System Toolbox','Python','Pandas','Plotly','Kaleido')
  ),
  jsonb_build_object(
    'overview', jsonb_build_array('Trabalho de Engenharia de Sistemas focado em comparar combinações de ganhos de controlador PI por meio de indicadores quantitativos de desempenho e trade-offs multicritério.'),
    'challenge', jsonb_build_array('Explorar um grande espaço de projeto Kp/Ki equilibrando tempo de subida, overshoot, undershoot e erro de regime para rampa sob restrições de estabilidade e desempenho.'),
    'solution', jsonb_build_array('Scripts MATLAB varrem os ganhos candidatos, calculam indicadores, filtram soluções instáveis ou fora dos limites e aplicam o critério de Kreisselmeier-Steinhäuser. Scripts Python/Plotly complementam a análise com coordenadas paralelas interativas e filtragem progressiva.'),
    'architecture', jsonb_build_object('body','Simulação e geração de indicadores em MATLAB → arquivos CSV → ranking multicritério/KS → visualização interativa Python/Plotly para explorar trade-offs.','items',jsonb_build_array('Varredura Kp/Ki','Indicadores de desempenho','Filtro de estabilidade','Critério KS','Coordenadas paralelas','Filtragem interativa Plotly')),
    'role', jsonb_build_array('Implementei e documentei o fluxo de análise, cálculo de indicadores, seleção multicritério e visualização interativa complementar.'),
    'results', jsonb_build_array('Um fluxo rastreável para comparar ganhos candidatos do controlador PI de forma quantitativa e visual, em vez de selecionar ganhos por uma única métrica.'),
    'technologies', jsonb_build_array('MATLAB','Control System Toolbox','Python','Pandas','Plotly','Kaleido')
  ),
  true, null,
  'https://github.com/LeonardoCamargoRossato/Code_Courses_I-ve_takenAt_Universities/tree/main/Engenharia%20de%20Sistemas',
  'https://github.com/LeonardoCamargoRossato/Code_Courses_I-ve_takenAt_Universities',
  true,
  'Systems Engineering coursework — PI controller analysis and multicriteria trade-off study.',
  'Trabalho da disciplina de Engenharia de Sistemas — análise de controlador PI e estudo de trade-off multicritério.',
  true, 'more', 22, now()
)
on conflict (id) do update set
  slug = excluded.slug,
  title_en = excluded.title_en,
  title_pt = excluded.title_pt,
  subtitle_en = excluded.subtitle_en,
  subtitle_pt = excluded.subtitle_pt,
  description_en = excluded.description_en,
  description_pt = excluded.description_pt,
  category_en = excluded.category_en,
  category_pt = excluded.category_pt,
  technologies = excluded.technologies,
  status_en = excluded.status_en,
  status_pt = excluded.status_pt,
  sections_en = excluded.sections_en,
  sections_pt = excluded.sections_pt,
  case_enabled = excluded.case_enabled,
  project_url = excluded.project_url,
  github_url = excluded.github_url,
  is_academic = excluded.is_academic,
  academic_context_en = excluded.academic_context_en,
  academic_context_pt = excluded.academic_context_pt,
  visible = excluded.visible,
  placement = excluded.placement,
  sort_order = excluded.sort_order,
  updated_at = now();

commit;

-- Intentionally no image URLs are inserted. Add real screenshots/identified diagrams
-- later through Admin/Storage rather than presenting generated illustrations as product captures.
