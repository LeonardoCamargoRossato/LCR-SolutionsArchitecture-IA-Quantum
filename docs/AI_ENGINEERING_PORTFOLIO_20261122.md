# LCR Portfolio — AI Engineering & Software Development

**Data:** 22/11/2026  
**Tipo:** ADR / Registro de implementação do Builder  
**Escopo:** identidade profissional, conteúdo bilíngue, estudos de caso, CMS, ordenação e SEO  
**Não é:** reconstrução visual, nova base de dados, migração de arquivos privados

## Decisão

O título principal passa a ser **AI Engineering & Software Development**. O componente existente `HeroTypeTitle` continua realizando digitação progressiva. O subtítulo **Building Intelligent Solutions.** surge após `data-typing-complete=true`; `prefers-reduced-motion` mantém o texto visível sem animação. O componente continua sendo um único H1.

A identidade profissional é **AI Engineer | Software Development | Applied AI | Systems Architecture**. As especializações secundárias permanecem bilíngues. Graduação, mestrado, doutorado e publicações não foram removidos.

**Projetos principais:** Foton Hub → Cities Comparing → AnimeFinder.  
**Adicionais em destaque:** Hamlet → WebSeer → MetCompB Landing Page.  
As prioridades explícitas estão em `src/pages/Home.tsx`. `placement` é independente de `source`: Hamlet permanece fisicamente em `projects` no Supabase, mas é exibido em `more`, sem cópia da linha para outra tabela.

## Evidência e limites das alegações técnicas

### AnimeFinder

Fontes auditadas no repositório `LeonardoCamargoRossato/AnimeFinder`:
- `README.md`, `docs/hamlet-ai-v1-architecture.md`, `docs/hamlet-ai-v1-2-architecture.md`, `docs/hamlet-self-knowledge-v1-architecture.md`
- `src/SelfKnowledgeService.ts`, `src/hamletSearchService.ts`
- `supabase/functions/hamlet-ai/index.ts`, `supabase/functions/hamlet-self-knowledge/index.ts`
- `supabase/migrations/20261102223000_hamlet_self_knowledge_v1.sql`

Evidências adicionais obtidas na conexão Supabase: funções `hamlet-ai` e `hamlet-self-knowledge` em estado **ACTIVE**, tabelas `hamlet_conversations`, `hamlet_messages`, `self_knowledge_documents` existentes no schema `animefinder`.

O código tem classificação/roteamento determinístico, análise estatística, consultas estruturadas, recuperação semântica de documentos derivados via pgvector/HNSW e geração por Gemini a partir de pacote de evidências. Não afirmar que o projeto implementa BM25, reranking, LangChain, LangGraph ou AWS sem evidência. A implantação das funções e a existência de tabelas **não** provam a qualidade de cada resposta, índices totalmente populados ou disponibilidade do provedor externo.

### Hamlet Digital Platform

Fontes auditadas no repositório `LeonardoCamargoRossato/Hamlet-Digital-Platform`: `README.md` e `supabase/functions/hamlet-chat/index.ts`.

O chatbot implementa detecção de intenção, recuperação de conhecimento via `match_knowledge`, enriquecimento por catálogos de publicações/personagens, prompt contextual e resposta com referências de fontes. Não confundir este repositório com o módulo Hamlet AI integrado ao AnimeFinder, nem declarar multiagentes/fine-tuning concluídos.

## Segurança e assets

A interface AnimeFinder é restrita por autenticação. Não foi publicada captura de tela com catálogo pessoal, conversas ou outras informações privadas. A capa no portfólio é um SVG de identificação **explicitamente declarado como não sendo screenshot**. Inventário: `public/projects/animefinder/asset-inventory.json`.

Futura substituição deve ser feita a partir de captura autorizada e revisada, com fonte original, versão otimizada WebP, PNG quando adequado, referências e inventário, seguindo `LCR_ASSET_ORGANIZATION_STANDARD` (consultado no Google Drive). Nenhum asset anterior foi apagado ou deslocado.

## Persistência

O produto contém defaults TS, Supabase e cache temporário. Os dados públicos foram sincronizados no Supabase em atualizações **limitadas**, preservando outros campos:
- `site_settings`: título inglês/português, descrições, foco, competências antigas unidas às novas, arquitetura e footer;
- `about`: posicionamento/introdução; sem alterar educação e experiências;
- `seo`: título e descrições;
- `projects`: um registro `animefinder`, e `hamlet.placement='more'` mantendo o registro na mesma tabela.

Nenhuma migration DDL, mudança de RLS, política de Auth, role ou banco paralelo. Larguras originais dos cards (`main_card_scale`, `more_card_scale`) preservadas. O componente `ProjectService` evita duplicidade e respeita registros ocultos; o `SeoSync` atualiza dados de cada caso de estudo.

**Nota:** não publicar no GitHub exports de tabelas, registros pessoais ou chaves da conexão.

## Verificação

- `npm run build` (inclui `tsc -b`) via GitHub Actions
- `tests/ai-positioning-smoke.mjs`: H1, digitação, subtítulo, PT/EN, reduced motion, catálogo, reidratação/reload, estudo AnimeFinder/Hamlet, rotas e SEO.
- `tests/portfolio-carousel-unified-smoke.mjs`: proteção do componente de galeria compartilhado, desktop/mobile e lightbox.
- Screenshots e JSON de evidências retidos como artifacts da CI.
- **Lint:** o repositório não possuía script `npm run lint`; o typecheck cobre o código TypeScript, mas não deve ser confundido com uma execução do ESLint sobre o frontend.

## Verificações remotas do Builder

- `home_en.title = home_pt.title = AI Engineering & Software Development`
- `about.professional_title_en` e `seo.site_title` atualizados
- `projects/animefinder` único, visível e `main` com `sort_order=3`
- `projects/hamlet` mantém origem na tabela principal com `placement=more`
- 0 slugs duplicados entre `projects` e `more_projects`
- 5 categorias CMS nos dois idiomas, com habilidades anteriores mantidas
- escalas dos cards anteriores preservadas

**Pendência editorial conhecida:** substituir a capa vetorial temporária por screenshot real da área pública/autorizada do AnimeFinder, após revisão de privacidade. Essa substituição não bloqueia o novo estudo técnico nem deve ser feita fabricando telas.
