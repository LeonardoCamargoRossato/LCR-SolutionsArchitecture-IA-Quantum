
-- Portfólio Apps LCR — Supabase-only migration
-- Authentication mode: Supabase Email + Password (no Google OAuth).
-- Execute no SQL Editor do Supabase.

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id text primary key,
  slug text unique not null,
  sort_order integer not null default 0,
  title_en text not null default '',
  title_pt text not null default '',
  subtitle_en text,
  subtitle_pt text,
  category_en text not null default '',
  category_pt text not null default '',
  short_description_en text not null default '',
  short_description_pt text not null default '',
  full_description_en text not null default '',
  full_description_pt text not null default '',
  sections_en jsonb not null default '{}'::jsonb,
  sections_pt jsonb not null default '{}'::jsonb,
  technologies text[] not null default '{}',
  external_url text,
  github_url text,
  research_url text,
  institution_url text,
  cover_url text,
  status text not null default 'Live',
  visible boolean not null default true,
  featured boolean not null default false,
  badge text,
  year text,
  gallery jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.more_projects (
  id text primary key,
  slug text unique,
  title_en text not null default '',
  title_pt text not null default '',
  description_en text not null default '',
  description_pt text not null default '',
  category_en text not null default '',
  category_pt text not null default '',
  icon_url text,
  technologies text[] not null default '{}',
  status text not null default 'Case Study in Progress',
  visible boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.about (
  id text primary key default 'main',
  description_en text not null default '',
  description_pt text not null default '',
  profile_image_url text,
  cv_url text,
  content_en jsonb not null default '{}'::jsonb,
  content_pt jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.social_links (
  id text primary key,
  platform text not null,
  label text,
  url text not null,
  icon text,
  sort_order integer not null default 0,
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id text primary key default 'main',
  hero_name text not null default 'LEONARDO ROSSATO',
  hero_title_en text not null default '',
  hero_title_pt text not null default '',
  hero_subtitle_en text not null default '',
  hero_subtitle_pt text not null default '',
  default_language text not null default 'en-US',
  default_theme text not null default 'light',
  home_en jsonb not null default '{}'::jsonb,
  home_pt jsonb not null default '{}'::jsonb,
  research_en jsonb not null default '{}'::jsonb,
  research_pt jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.seo (
  id text primary key default 'main',
  site_title text not null default '',
  meta_description text not null default '',
  og_title text not null default '',
  og_description text not null default '',
  og_image text,
  updated_at timestamptz not null default now()
);

-- Helper: somente o email administrador pode escrever.
create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'leo.c.rossato@gmail.com';
$$;

grant execute on function public.is_portfolio_admin() to anon, authenticated;

alter table public.projects enable row level security;
alter table public.more_projects enable row level security;
alter table public.about enable row level security;
alter table public.social_links enable row level security;
alter table public.site_settings enable row level security;
alter table public.seo enable row level security;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'projects','more_projects','about','social_links','site_settings','seo'
  ]
  loop
    execute format('drop policy if exists "public read" on public.%I', tbl);
    execute format(
      'create policy "public read" on public.%I for select using (true)',
      tbl
    );

    execute format('drop policy if exists "admin insert" on public.%I', tbl);
    execute format(
      'create policy "admin insert" on public.%I for insert to authenticated with check (public.is_portfolio_admin())',
      tbl
    );

    execute format('drop policy if exists "admin update" on public.%I', tbl);
    execute format(
      'create policy "admin update" on public.%I for update to authenticated using (public.is_portfolio_admin()) with check (public.is_portfolio_admin())',
      tbl
    );

    execute format('drop policy if exists "admin delete" on public.%I', tbl);
    execute format(
      'create policy "admin delete" on public.%I for delete to authenticated using (public.is_portfolio_admin())',
      tbl
    );
  end loop;
end $$;

-- Bucket público.
insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do update set public = true;

drop policy if exists "portfolio media public read" on storage.objects;
create policy "portfolio media public read"
on storage.objects
for select
using (bucket_id = 'portfolio-media');

drop policy if exists "portfolio media admin insert" on storage.objects;
create policy "portfolio media admin insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'portfolio-media'
  and public.is_portfolio_admin()
);

drop policy if exists "portfolio media admin update" on storage.objects;
create policy "portfolio media admin update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'portfolio-media'
  and public.is_portfolio_admin()
)
with check (
  bucket_id = 'portfolio-media'
  and public.is_portfolio_admin()
);

drop policy if exists "portfolio media admin delete" on storage.objects;
create policy "portfolio media admin delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'portfolio-media'
  and public.is_portfolio_admin()
);

-- Valores iniciais mínimos. O frontend mantém defaults completos como fallback.
insert into public.site_settings (
  id, hero_name, hero_title_en, hero_title_pt,
  hero_subtitle_en, hero_subtitle_pt, default_language, default_theme
) values (
  'main',
  'LEONARDO ROSSATO',
  'Building software for complex problems.',
  'Construindo software para problemas complexos.',
  'Scientific computing, data visualization, AI, research software and digital systems.',
  'Computação científica, visualização de dados, IA, software de pesquisa e sistemas digitais.',
  'en-US',
  'light'
)
on conflict (id) do nothing;

insert into public.about (id)
values ('main')
on conflict (id) do nothing;

insert into public.seo (
  id, site_title, meta_description, og_title, og_description
) values (
  'main',
  'Leonardo Rossato — Research, Software & Technology',
  'Portfolio of scientific software, data visualization, AI, web applications and emerging technology projects by Leonardo Rossato.',
  'Leonardo Rossato — Research, Software & Technology',
  'Scientific software, data visualization, AI, web applications and emerging technology projects.'
)
on conflict (id) do nothing;

insert into public.social_links
  (id, platform, label, url, icon, sort_order, visible)
values
  ('linkedin','LinkedIn','Leonardo Rossato','https://www.linkedin.com/in/leonardocamargorossato/?locale=en','linkedin',1,true),
  ('github','GitHub','LeonardoCamargoRossato','https://github.com/LeonardoCamargoRossato/','github',2,true),
  ('instagram','Instagram','@leonardo.camargo.rossato','https://www.instagram.com/leonardo.camargo.rossato/','instagram',3,true),
  ('speaker','Speaker Portfolio','Speaker Portfolio','https://leonardo-camargo-rossato.lovable.app/','globe',4,true),
  ('foton','Instituto Foton','Instituto Foton','https://institutofoton.com.br/','building',5,true),
  ('email','Email','leo.c.rossato@gmail.com','mailto:leo.c.rossato@gmail.com','mail',6,true)
on conflict (id) do nothing;

-- Seed completo inicial do portfólio. O frontend ainda mantém defaults apenas como fallback.
update public.site_settings set
  home_en = '{"eyebrow":"LEONARDO ROSSATO","title":"Building software for complex problems.","highlightedWords":"complex problems.","description":"Scientific computing, data visualization, AI, research software and digital systems.","focus":"Research + Engineering + Product","skills":["Scientific Computing","Web Applications","Data Visualization","Artificial Intelligence","Emerging Technologies"]}'::jsonb,
  home_pt = '{"eyebrow":"LEONARDO ROSSATO","title":"Construindo software para problemas complexos.","highlightedWords":"problemas complexos.","description":"Computação científica, visualização de dados, IA, software de pesquisa e sistemas digitais.","focus":"Pesquisa + Engenharia + Produto","skills":["Computação Científica","Aplicações Web","Visualização de Dados","Inteligência Artificial","Tecnologias Emergentes"]}'::jsonb,
  research_en = '{"title":"Research & Technology","description":"Areas that shape the problems, systems and interfaces I work on.","areas":["Scientific Computing","Artificial Intelligence","Systems Engineering","Data Science","Quantum Technologies","Autonomous Systems","Complex Systems","Research Software","Sensor Fusion","Emerging Technologies"]}'::jsonb,
  research_pt = '{"title":"Pesquisa & Tecnologia","description":"Áreas que orientam os problemas, sistemas e interfaces em que trabalho.","areas":["Computação Científica","Inteligência Artificial","Engenharia de Sistemas","Ciência de Dados","Tecnologias Quânticas","Sistemas Autônomos","Sistemas Complexos","Software de Pesquisa","Fusão de Sensores","Tecnologias Emergentes"]}'::jsonb
where id='main';

update public.about set
  description_en = $$PhD student in Electronic Engineering and Computing at ITA. Background in Physics (MSc – UFRGS | BSc – UFSM). Working at the intersection of systems engineering, data science, and quantum technologies.

Thesis focused on hybrid system architectures, integrating quantum and classical sensors. Uses inertial navigation in GNSS-denied environments (no GPS) as a case study to explore how quantum technologies can be integrated into real-world systems and complex problem-solving architectures.

Co-founder and President of Foton Institute. Works on R&D&I, developing and architecting solutions for complex problems, leading multidisciplinary squads, and connecting universities, companies, and research centers.$$,
  description_pt = $$Doutorando em Engenharia Eletrônica e Computação no ITA. Formação em Física (Mestrado – UFRGS | Bacharelado – UFSM). Atua na interseção entre engenharia de sistemas, ciência de dados e tecnologias quânticas.

A tese é focada em arquiteturas de sistemas híbridos, integrando sensores quânticos e clássicos. Usa navegação inercial em ambientes GNSS-denied (sem GPS) como estudo de caso para explorar a integração de tecnologias quânticas em sistemas reais e arquiteturas de resolução de problemas complexos.

Cofundador e Presidente do Instituto Foton. Atua em P&D&I, desenvolvendo e arquitetando soluções para problemas complexos, liderando squads multidisciplinares e conectando universidades, empresas e centros de pesquisa.$$,
  content_en = '{"name":"Leonardo Camargo Rossato","headline":"PhD Student · Physicist · Researcher · Technology Builder","title":"About","bio":["PhD student in Electronic Engineering and Computing at ITA. Background in Physics (MSc – UFRGS | BSc – UFSM). Working at the intersection of systems engineering, data science, and quantum technologies.","Thesis focused on hybrid system architectures, integrating quantum and classical sensors. Uses inertial navigation in GNSS-denied environments (no GPS) as a case study to explore how quantum technologies can be integrated into real-world systems and complex problem-solving architectures.","Co-founder and President of Foton Institute. Works on R&D&I, developing and architecting solutions for complex problems, leading multidisciplinary squads, and connecting universities, companies, and research centers.","Co-founder of LACQ Feynman. Focused on talent development and building the national movement of quantum computing academic leagues in Brazil.","Speaker and panelist in technology and science events across more than 10 Brazilian states.","Experience in computational and mathematical modeling of complex systems, data science, and machine learning."],"location":"São José dos Campos, Brazil","email":"leo.c.rossato@gmail.com","experiences":[],"education":[],"researchTimeline":[],"areas":["Scientific Computing","Artificial Intelligence","Systems Engineering","Data Science","Quantum Technologies","Autonomous Systems","Complex Systems","Research Software","Sensor Fusion","Emerging Technologies"],"publications":[],"scienceCommunication":"Beyond research and software development, I have worked with scientific education and technical communication.","speakerPortfolioUrl":"https://leonardo-camargo-rossato.lovable.app/"}'::jsonb,
  content_pt = '{"name":"Leonardo Camargo Rossato","headline":"Doutorando · Físico · Pesquisador · Profissional de Tecnologia","title":"Sobre","bio":["Doutorando em Engenharia Eletrônica e Computação no ITA. Formação em Física (Mestrado – UFRGS | Bacharelado – UFSM). Atua na interseção entre engenharia de sistemas, ciência de dados e tecnologias quânticas.","A tese é focada em arquiteturas de sistemas híbridos, integrando sensores quânticos e clássicos. Usa navegação inercial em ambientes GNSS-denied (sem GPS) como estudo de caso para explorar a integração de tecnologias quânticas em sistemas reais e arquiteturas de resolução de problemas complexos.","Cofundador e Presidente do Instituto Foton. Atua em P&D&I, desenvolvendo e arquitetando soluções para problemas complexos, liderando squads multidisciplinares e conectando universidades, empresas e centros de pesquisa.","Cofundador da LACQ Feynman. Focado no desenvolvimento de talentos e na construção do movimento nacional de ligas acadêmicas de computação quântica no Brasil.","Palestrante e debatedor em eventos de tecnologia e ciência em mais de 10 estados brasileiros.","Experiência em modelagem computacional e matemática de sistemas complexos, ciência de dados e aprendizado de máquina."],"location":"São José dos Campos, Brasil","email":"leo.c.rossato@gmail.com","areas":["Computação Científica","Inteligência Artificial","Engenharia de Sistemas","Ciência de Dados","Tecnologias Quânticas","Sistemas Autônomos","Sistemas Complexos","Software de Pesquisa","Fusão de Sensores","Tecnologias Emergentes"]}'::jsonb
where id='main';

insert into public.projects (
  id,slug,sort_order,title_en,title_pt,category_en,category_pt,
  short_description_en,short_description_pt,full_description_en,full_description_pt,
  sections_en,sections_pt,technologies,external_url,github_url,institution_url,status,visible,featured,badge
) values
(
  'foton-hub','foton-hub',1,'Foton Hub','Foton Hub','Institutional Digital Platform','Plataforma Digital Institucional',
  $$Institutional platform that centralizes people, organizations, projects, documents, links, tools and analysis environments from Instituto Foton in a single interface.$$,
  $$Plataforma institucional que centraliza pessoas, organizações, projetos, documentos, links, ferramentas e ambientes de análise do Instituto Foton em uma única interface.$$,
  $$Foton Hub is an institutional platform developed to centralize institutional resources in a single interface over Microsoft 365 and SharePoint.$$,
  $$O Foton Hub é uma plataforma institucional desenvolvida para centralizar recursos institucionais em uma única interface sobre Microsoft 365 e SharePoint.$$,
  '{"overview":["Foton Hub centralizes people, organizations, projects, documents, links, tools and analysis environments in one interface.","It creates an application layer over SharePoint and Microsoft 365."],"advantages":["It reduces information fragmentation and simplifies access to institutional resources.","Its modular architecture supports future expansion."],"userExperience":["The main modules are Ecosystem, Links Hub, Administration and Analysis Lab."],"properties":["Search, filters, profiles, member management, SharePoint integration, QR Codes, dashboards and administrative components."],"technologiesUsed":["Microsoft SharePoint, SPFx, React, TypeScript, Microsoft 365, SharePoint APIs, Lists and Libraries."]}'::jsonb,
  '{"overview":["O Foton Hub centraliza pessoas, organizações, projetos, documentos, links, ferramentas e ambientes de análise em uma única interface.","O projeto cria uma camada de aplicação própria sobre SharePoint e Microsoft 365."],"advantages":["Reduz a fragmentação das informações e simplifica o acesso a recursos institucionais.","Sua arquitetura modular permite evolução futura."],"userExperience":["Os principais módulos são Ecossistema, Hub de Links, Administração e Lab de Análises."],"properties":["Busca, filtros, perfis, gestão de membros, integração SharePoint, QR Codes, dashboards e componentes administrativos."],"technologiesUsed":["Microsoft SharePoint, SPFx, React, TypeScript, Microsoft 365, APIs, Listas e Bibliotecas SharePoint."]}'::jsonb,
  array['Microsoft SharePoint','SPFx','React','TypeScript','Microsoft 365','SharePoint APIs','SharePoint Lists','SharePoint Libraries'],
  null,null,'https://institutofoton.com.br/','Private Platform',true,true,'FEATURED'
),
(
  'city-comparing','cities-comparing',2,'Cities Comparing','Cities Comparing','Scientific Computing / Research Software','Computação Científica / Software de Pesquisa',
  $$Exploratory analysis platform developed from master's work in Physics, especially in econophysics, data analysis and complex systems.$$,
  $$Plataforma de análise exploratória desenvolvida a partir de trabalhos realizados durante o mestrado em Física, especialmente em econofísica, análise de dados e sistemas complexos.$$,
  $$The project compares socioeconomic indicators among cities, countries, states and macroregions using exploratory statistical visualization.$$,
  $$O projeto compara indicadores socioeconômicos entre cidades, países, estados e macrorregiões usando visualização estatística exploratória.$$,
  '{"overview":["Exploratory analysis platform derived from master’s research in Physics, econophysics, data analysis and complex systems."],"advantages":["Complex socioeconomic datasets can be explored without writing code for every analysis."],"userExperience":["Users choose cities, countries or regions and switch among scatter plots, binscatters, distributions and comparative views."],"properties":["Scatter plots, binscatters, histograms, boxplots, DataFrames and regional analyses, with deeper Jupyter modules and a simplified Streamlit version."],"technologiesUsed":["Python, Streamlit, Jupyter Notebook, Pandas, Plotly, scientific/statistical libraries, custom tools and graph-based methods."]}'::jsonb,
  '{"overview":["Plataforma de análise exploratória derivada do mestrado em Física, econofísica, análise de dados e sistemas complexos."],"advantages":["Bases socioeconômicas complexas podem ser exploradas sem escrever código para cada nova análise."],"userExperience":["O usuário escolhe cidades, países ou regiões e alterna entre scatter plots, binscatters, distribuições e visualizações comparativas."],"properties":["Scatter plots, binscatters, histogramas, boxplots, DataFrames e análises regionais, com módulos mais completos em Jupyter e versão simplificada em Streamlit."],"technologiesUsed":["Python, Streamlit, Jupyter Notebook, Pandas, Plotly, bibliotecas científicas/estatísticas, ferramentas próprias e métodos baseados em grafos."]}'::jsonb,
  array['Python','Streamlit','Jupyter Notebook','Pandas','Plotly','Scientific Libraries','Graph-based Methods'],
  'https://analysis-socioeconomic-indicators.streamlit.app/','https://github.com/LeonardoCamargoRossato/Analysis_SocioEconomic_Indicator',null,'Live',true,false,null
),
(
  'hamlet','hamlet',3,'Hamlet — Narrative Universe','Hamlet — Universo Narrativo','Experimental Web Experience','Experiência Web Experimental',
  $$Experimental web platform combining literature, experience design, multimedia content and artificial intelligence in an explorable narrative environment.$$,
  $$Plataforma web experimental que combina literatura, design de experiência, conteúdo multimídia e inteligência artificial em um universo narrativo explorável.$$,
  $$The platform transforms literary content into an immersive digital universe with stories, characters, images, documents, music and interactive dialogue.$$,
  $$A plataforma transforma conteúdo literário em um universo digital imersivo com histórias, personagens, imagens, documentos, música e diálogos interativos.$$,
  '{"overview":["Experimental platform combining literature, experience design, multimedia and AI."],"advantages":["Text, image, audio, documents and interaction become a unified narrative environment."],"userExperience":["Library, Gallery, document viewing, characters, soundtrack and Talk to Hamlet form multiple exploration paths."],"properties":["Narrative home, digital library, document viewer, gallery, character navigation, audio playback, multimedia and conversational interface."],"technologiesUsed":["React, modern front-end, Lovable, document visualization, media playback, content management and AI conversational interfaces."]}'::jsonb,
  '{"overview":["Plataforma experimental que combina literatura, design de experiência, multimídia e IA."],"advantages":["Texto, imagem, áudio, documentos e interação compõem um mesmo ambiente narrativo."],"userExperience":["Biblioteca, Galeria, visualização de documentos, personagens, trilha sonora e Fale com Hamlet criam diferentes caminhos de exploração."],"properties":["Página narrativa, biblioteca digital, visualizador de documentos, galeria, navegação por personagens, áudio, multimídia e interface conversacional."],"technologiesUsed":["React, front-end moderno, Lovable, visualização de documentos, reprodução de mídia, gerenciamento de conteúdo e interfaces conversacionais de IA."]}'::jsonb,
  array['React','Modern Front-end','Lovable','Document Viewer','Media Playback','Content Management','AI Conversational Interfaces'],
  'https://hamlet-sociedade-ideal.lovable.app/',null,null,'Live',true,false,null
),
(
  'speaker-portfolio','speaker-portfolio',4,'Speaker & Research Portfolio','Portfólio de Palestras — Leonardo Camargo Rossato','Personal Digital Experience','Experiência Digital Pessoal',
  $$Personal platform presenting professional work as a speaker, researcher and technology professional, combining trajectory, events, gallery, projects and contact.$$,
  $$Plataforma pessoal para apresentar atuação como palestrante, pesquisador e profissional de tecnologia, reunindo trajetória, eventos, galeria, projetos e contato.$$,
  $$The platform works as a personal website, professional portfolio and commercial presentation for events, companies and institutions.$$,
  $$A plataforma funciona como site pessoal, portfólio profissional e apresentação comercial para eventos, empresas e instituições.$$,
  '{"overview":["Personal platform for speaking, research and technology work."],"advantages":["Biography, events, photos, projects and contact are presented in one shareable experience."],"userExperience":["Visitors navigate through About, Topics, Events, Gallery, Projects and Contact."],"properties":["Professional presentation, event history, responsive gallery, projects, calls to action and contact."],"technologiesUsed":["React, modern front-end, Lovable, responsive components, media galleries, routes/sections and modular web publishing."]}'::jsonb,
  '{"overview":["Plataforma pessoal para atuação em palestras, pesquisa e tecnologia."],"advantages":["Biografia, eventos, fotos, projetos e contato aparecem em uma experiência pública e compartilhável."],"userExperience":["O visitante navega por Sobre, Temas, Eventos, Galeria, Projetos e Contato."],"properties":["Apresentação profissional, histórico de eventos, galeria responsiva, projetos, chamadas de ação e contato."],"technologiesUsed":["React, front-end moderno, Lovable, componentes responsivos, galerias, rotas/seções e publicação web modular."]}'::jsonb,
  array['React','Modern Front-end','Lovable','Responsive Components','Media Galleries','Routes & Sections'],
  'https://leonardo-camargo-rossato.lovable.app/',null,null,'Live',true,false,null
)
on conflict (id) do nothing;

insert into public.more_projects
(id,slug,title_en,title_pt,description_en,description_pt,category_en,category_pt,technologies,status,visible,sort_order)
values
('esp32-control','esp32-control','Embedded Control Platform','Plataforma de Controle Embarcado','Additional embedded control project being prepared as a case study.','Projeto de controle embarcado sendo preparado como estudo de caso.','Embedded Systems','Sistemas Embarcados',array['ESP32','HTML','CSS','JavaScript','Embedded Systems'],'Case Study in Progress',true,10),
('scientific-analysis','scientific-analysis','Scientific Analysis Toolkit','Toolkit de Análise Científica','Research-oriented numerical and visual analysis utilities.','Ferramentas de análise numérica e visual orientadas à pesquisa.','Scientific Computing','Computação Científica',array['Python','Jupyter','Plotly','Interactive Widgets'],'Case Study in Progress',true,11),
('streamlit-tools','streamlit-tools','Streamlit Tools','Ferramentas Streamlit','Compact interactive tools for data exploration and technical workflows.','Ferramentas interativas compactas para exploração de dados e fluxos técnicos.','Data Applications','Aplicações de Dados',array['Python','Streamlit','Data Applications'],'Case Study in Progress',true,12),
('webseer','webseer','WebSeer','WebSeer','Interactive text analysis interfaces and comparison workflows.','Interfaces interativas de análise textual e fluxos de comparação.','Text Analysis / Data Visualization','Análise de Texto / Visualização de Dados',array['React','Text Analysis','Data Visualization'],'Case Study in Progress',true,13)
on conflict (id) do nothing;
