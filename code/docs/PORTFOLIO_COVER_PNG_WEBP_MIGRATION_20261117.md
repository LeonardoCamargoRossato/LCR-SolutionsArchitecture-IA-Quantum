# LCR Portfólio — Inventário auditado da migração de capas PNG/WebP (17/11/2026)

## Estado real da execução — revisado após a migração

**Migração no Supabase concluída e validada. A integração na main e o deploy permanecem etapas separadas.**

- Projeto Supabase `wdjffhfnzydudmhhekmk`, bucket `portfolio-media` confirmado.
- **9/9 PNGs originais preservados, 9/9 PNGs copiados e 9/9 WebPs publicados**, total 18 novos arquivos e 27 objetos (legado + versões).
- **9/9 referências editoriais atualizadas:** 4 em `public.projects.cover_url` e 5 em `public.more_projects.image_url`, mantendo PNG como URL canônica.
- A migração executou leitura de volta dos 18 objetos e dos nove registros. Verificou hash SHA-256 do PNG original contra a cópia, checksum da versão WebP, formato, dimensões e ausência de sobrescritas divergentes.
- **GitHub Actions migração:** [run #44088880531](https://github.com/LeonardoCamargoRossato/LCR-SolutionsArchitecture-IA-Quantum/actions/runs/44088880531) — build, cópia, atualização CMS e `--verify` com **PASS**.
- **Testes no navegador:** [run #44091695076](https://github.com/LeonardoCamargoRossato/LCR-SolutionsArchitecture-IA-Quantum/actions/runs/44091695076) — **PASS** em 9 páginas × 2 viewports (desktop 1440×900 e mobile 390×844); WebP inicial, lightbox PNG, download original, sem 404 nas variantes testadas ou transbordamento horizontal mobile.
- **Admin:** tela de login restrita e componente `ImageUploader` testados (JPEG rejeitado como capa; PNG aceito). **Não houve teste end-to-end autenticado do painel**, por ausência de sessão administrativa autorizada no CI. Não tratar esta etapa como validada.
- `ProjectService` foi ajustado para respeitar a imagem editorial de Cities Comparing e WebSeer; o antigo gráfico de Cities Comparing permanece na galeria. Projetos com `visible=true` e `case_enabled=true` não são mais ocultados indevidamente pelas listas fixas para as nove capas.
- Nenhum original ou logotipo removido. O gatilho privilegiado via push foi desativado após a migração, mantendo apenas modo manual restrito à branch da operação.

**Economia real estimada por renderização das nove capas:** 14.648.165 bytes PNG → 1.048.776 bytes WebP, **92,84% de redução de tráfego**. Isso não corresponde a redução de armazenamento: as cópias foram preservadas.

**Evidências adicionais:** artifacts `portfolio-cover-migration-evidence` e `portfolio-browser-evidence`, disponíveis nos respectivos workflows. O merge, a revisão formal independente (caso exigida por regra) e o deploy final devem ser confirmados separadamente.

> **Atualização editorial (17/11/2026):** `pdf-frequency-analyzer` foi retirado do portfólio público após esta migração. Esta linha permanece **somente como evidência histórica** da transferência anterior de nove capas; não deve ser reutilizada para republicar o projeto. A lista operacional do script de migração contém agora oito capas. Consulte [o registro de retirada](PDF_FREQUENCY_ANALYZER_RETIREMENT_20261117.md).

## Inventário canônico — nove capas

Todos os caminhos abaixo são relativos ao bucket `portfolio-media`. A coluna SHA-256 corresponde ao **PNG original lido do Storage em 17/11/2026**. O script verificou a **igualdade SHA-256** da cópia PNG contra este valor. O tamanho WebP foi medido no objeto efetivamente publicado e corresponde ao relatório da conversão.

| Projeto | PNG legado preservado | PNG de destino | WebP de destino | Registro editorial | PNG (bytes) | WebP publicado (bytes) | Economia de tráfego | SHA-256 do original | Estado |
|---|---|---|---|---|---:|---:|---:|---|---|
| cities-comparing | `projects/cities-comparing/1789395964303-3c1f29cc-c8bd-42d7-8a7d-752b81756026-CitiesComparing_CapaCard.png` | `projects/cities-comparing/PNG/1789395964303-3c1f29cc-c8bd-42d7-8a7d-752b81756026-CitiesComparing_CapaCard.png` | `projects/cities-comparing/WebP/1789395964303-3c1f29cc-c8bd-42d7-8a7d-752b81756026-CitiesComparing_CapaCard.webp` | `public.projects.cover_url` (`city-comparing`) | 1510172 | 123206 | 91.84% | `afff17fd8c1f0738e382171a1c26e35877301b89d323afb3f7752abbd26940be` | Storage e CMS verificados |
| embedded-control-platform | `projects/embedded-control-platform/1789580925841-e27a4260-39a0-4581-baf2-fd9c2470f97a-EmbeddedWebServer_CapaCard.png` | `projects/embedded-control-platform/PNG/1789580925841-e27a4260-39a0-4581-baf2-fd9c2470f97a-EmbeddedWebServer_CapaCard.png` | `projects/embedded-control-platform/WebP/1789580925841-e27a4260-39a0-4581-baf2-fd9c2470f97a-EmbeddedWebServer_CapaCard.webp` | `public.more_projects.image_url` (`embedded-control-platform`) | 1808444 | 152558 | 91.56% | `cca752dab6e39331ae2040edba6fa5084d421609f258154bc0b1129cebbb45e7` | Storage e CMS verificados |
| foton-hub | `projects/foton-hub/1789395184532-2e274ccc-e2ad-4c41-b7b8-a795f181f84b-FotonHub_CapaCard.png` | `projects/foton-hub/PNG/1789395184532-2e274ccc-e2ad-4c41-b7b8-a795f181f84b-FotonHub_CapaCard.png` | `projects/foton-hub/WebP/1789395184532-2e274ccc-e2ad-4c41-b7b8-a795f181f84b-FotonHub_CapaCard.webp` | `public.projects.cover_url` (`foton-hub`) | 1461104 | 103166 | 92.94% | `03f5ccc2c6b8cf86df7fea39eee309b64946fd44f0bdc1681d81ecb78fc89ea2` | Storage e CMS verificados |
| hamlet | `projects/hamlet/1789395980082-0ecbb7cb-509a-4f32-af8d-8223936c54b2-Hamlet_CapaCard.png` | `projects/hamlet/PNG/1789395980082-0ecbb7cb-509a-4f32-af8d-8223936c54b2-Hamlet_CapaCard.png` | `projects/hamlet/WebP/1789395980082-0ecbb7cb-509a-4f32-af8d-8223936c54b2-Hamlet_CapaCard.webp` | `public.projects.cover_url` (`hamlet`) | 1890644 | 103640 | 94.52% | `7010dea8448bda827328606d31ffe6bf05b109cb65c4809b92cb49ba43b7ba17` | Storage e CMS verificados |
| pdf-frequency-analyzer | `projects/pdf-frequency-analyzer/1789577994613-5507d9da-b3c8-42c1-9f27-ecdb8989dbef-FrequencyAnalyser_CapaCard.png` | `projects/pdf-frequency-analyzer/PNG/1789577994613-5507d9da-b3c8-42c1-9f27-ecdb8989dbef-FrequencyAnalyser_CapaCard.png` | `projects/pdf-frequency-analyzer/WebP/1789577994613-5507d9da-b3c8-42c1-9f27-ecdb8989dbef-FrequencyAnalyser_CapaCard.webp` | `public.more_projects.image_url` (`pdf-frequency-analyzer`) | 1358618 | 94572 | 93.04% | `f4cd29471c5589fc2c5d8b6107ce7b50bb444dd929dd18e1b8497ef0b2783042` | Storage e CMS verificados |
| quantum-education-apps | `projects/quantum-education-apps/1789577934619-2416ce1d-3b63-4edc-a7cd-c74989da990a-QuantumEduApps_CapaCard.png` | `projects/quantum-education-apps/PNG/1789577934619-2416ce1d-3b63-4edc-a7cd-c74989da990a-QuantumEduApps_CapaCard.png` | `projects/quantum-education-apps/WebP/1789577934619-2416ce1d-3b63-4edc-a7cd-c74989da990a-QuantumEduApps_CapaCard.webp` | `public.more_projects.image_url` (`quantum-education-apps`) | 1801316 | 118132 | 93.44% | `f95b93f4fa76b186edb781fa2f97bc7f1824aa970f29e0399e613fdc5e591b1c` | Storage e CMS verificados |
| scientific-analysis-toolkit | `projects/scientific-analysis-toolkit/1789577893972-0ac3894c-5459-4df2-989a-029bf13891ec-ScientificAnalysisToolitCapaCard.png` | `projects/scientific-analysis-toolkit/PNG/1789577893972-0ac3894c-5459-4df2-989a-029bf13891ec-ScientificAnalysisToolitCapaCard.png` | `projects/scientific-analysis-toolkit/WebP/1789577893972-0ac3894c-5459-4df2-989a-029bf13891ec-ScientificAnalysisToolitCapaCard.webp` | `public.more_projects.image_url` (`scientific-analysis-toolkit`) | 1865442 | 169414 | 90.92% | `f787d2ed67323a2ccec850d733af8c6862ddd9afe1ad331c963004a2cecd6709` | Storage e CMS verificados |
| speaker-portfolio | `projects/speaker-portfolio/1789612243746-56327e21-536e-489e-a1e7-767a6bd6dcfb-PortifolioPalestras_CapaCard.png` | `projects/speaker-portfolio/PNG/1789612243746-56327e21-536e-489e-a1e7-767a6bd6dcfb-PortifolioPalestras_CapaCard.png` | `projects/speaker-portfolio/WebP/1789612243746-56327e21-536e-489e-a1e7-767a6bd6dcfb-PortifolioPalestras_CapaCard.webp` | `public.projects.cover_url` (`speaker-portfolio`) | 1877910 | 119786 | 93.62% | `fc94346cd35fabad34ea6e16dec41e3421065b192e4651cf745eba2a9f505676` | Storage e CMS verificados |
| webseer | `projects/webseer/1789400307805-02852533-1924-4936-990b-85f91c19e663-WebSeer_CapaCard.png` | `projects/webseer/PNG/1789400307805-02852533-1924-4936-990b-85f91c19e663-WebSeer_CapaCard.png` | `projects/webseer/WebP/1789400307805-02852533-1924-4936-990b-85f91c19e663-WebSeer_CapaCard.webp` | `public.more_projects.image_url` (`webseer`) | 1074515 | 64302 | 94.02% | `c2bb5a46ede21c5e917ee904f67ba4fa27367a981b46cac3cc6a165dbcb647f3` | Storage e CMS verificados |

**Totais reais:** PNG 14.648.165 bytes → WebP 1.048.776 bytes; economia de entrega em relação aos originais: **92,84%** (13.599.389 bytes). Como os PNGs legados e suas cópias coexistem, isso **não representa economia de armazenamento**; a preservação aumenta temporariamente a capacidade ocupada.

## Implementação na branch existente

- `scripts/migrate_portfolio_covers.py`: leitura dos nove PNGs, validação integral e SHA-256, WebP com mesma resolução, preflight completo, upload sem sobrescrever destinos divergentes, conferência independente de 18 arquivos e atualização condicional das nove URLs **somente depois** da verificação integral. `--apply` e `--verify` exigem autenticação protegida. Dry-run não exige segredo.
- `src/infrastructure/supabase/helpers.ts`: mantém PNG como URL editorial canônica e resolve URL WebP dos cards.
- `SupabaseMediaRepository.ts`, `MediaService.ts`, `IMediaRepository.ts` e painel `Admin.tsx`: novos uploads de capas exigem PNG original e geram par WebP via Canvas; validam PNG por SHA-256 e WebP por assinatura e dimensões. O repositório não remove mais automaticamente a mídia anterior em `replace()`; capas legadas e novas possuem guarda contra exclusão via método `delete()`. A exclusão de capa no editor desvincula o registro, sem apagar o objeto.
- `ImageUploader.tsx`: restringe **somente o campo de capa** a PNG, preservando JPG/PNG/WebP para foto de perfil e outros usos.
- `ProjectCard.tsx`, `MoreProjectCard.tsx` e `CaseHero.tsx`: cards usam URL WebP resolvida; o lightbox usa URL PNG e oferece download do original.
- `.github/workflows/portfolio-cover-migration.yml`: executa build, validação dry-run e evidências; build e dry-run automáticos no push; migração privilegiada exige **disparo manual** por `workflow_dispatch` **e** o GitHub secret protegido, com backup e verificação após cópia.

### Execução no CI e procedimento de aceite

O administrador registrou o secret protegido `SUPABASE_SERVICE_ROLE_KEY` no GitHub Actions, sem divulgá-lo. A migração foi acionada com autorização humana por um gatilho de push de execução única na branch `feat/portfolio-cover-webp-20261117`, depois de passar pelo build e pré-verificações. O script foi corrigido para **listar destinos no Storage antes de verificar existência**, pois o Supabase pode responder HTTP 400 para um objeto público ainda inexistente.

Após a execução, o workflow concluiu `--apply` e `--verify`, gravou o backup de URLs editoriais `portfolio-cover-editorial-backup.json` e o relatório de migração. O acesso privilegiado por push foi removido, restando somente disparo manual condicionado à branch original.

**Validação concluída:** nove PNGs legados preservados; nove cópias idênticas; nove WebPs com resolução idêntica; nove registros canônicos PNG atualizados; 18 leituras HTTP das variantes; build e smoke desktop/mobile (9 projetos × 2 dispositivos), além do teste isolado do uploader do painel.

**Limites de validação:** não foi possível executar uma substituição real de capa autenticada no painel administrativo durante o CI, nem validar o site já publicado antes do merge. Revisão independente ou aprovação obrigatória deve ser respeitada conforme regras efetivas do repositório.

**Preparação para merge:** confirmar CI da HEAD atual, status de reviews/proteções, marcar PR pronta somente após aceite; fazer merge sem força. Após deploy, verificar novamente o site público e a nova versão das capas.

## Recuperação / rollback

- Manter **todos os nove objetos legados**. O relatório e `portfolio-cover-editorial-backup.json` armazenam URLs anteriores e esperadas para recuperação.
- Se alguma gravação falhar, **não fazer merge**. O script é idempotente: repetições verificam os objetos existentes por SHA-256 e não sobrescrevem conteúdo divergente.
- Se URLs forem alteradas e a validação posterior falhar, reverter **somente os nove campos editoriais** às URLs legadas do backup, verificando cada linha. Não remover novos assets ou originais automaticamente.
- Se código em main tiver sido implantado apenas após aceitação e apresentar regressão, usar reversão de commit/PR com PR de correção, mantendo o Storage intacto e dados canônicos apontando para imagens existentes.

## Fonte normativa

[LCR_ASSET_ORGANIZATION_STANDARD — Organização Humanizada e Migração de Assets](https://docs.google.com/document/d/1mnoxV1gak5x_kX6KclcEH7PEN8QzYU3dX4JNzHUYHwI/edit), v1.0, 16/11/2026, consultado e aplicado. Migração gradual, preservação, inventário por projeto, integridade, documentação e auditoria independente. **Preparado ≠ executado ≠ testado ≠ aprovado.**
