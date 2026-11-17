# LCR Portfólio — Inventário auditado da migração de capas PNG/WebP (17/11/2026)

## Estado real da execução

**Migração de produção não concluída. PR #2 permanece draft e não deve ser integrada à main.**

- Supabase: projeto `wdjffhfnzydudmhhekmk`, bucket `portfolio-media` identificado e saudável.
- **9 PNGs legados identificados no Storage e validados pelo Pillow no dry-run; 0/9 PNGs copiados; 0/9 WebPs publicados.**
- **9 URLs editoriais ainda legadas** (4 em `public.projects.cover_url`, 5 em `public.more_projects.image_url`); 0/9 atualizadas.
- Build `npm ci` e `npm run build` **PASS**; `python3 -m py_compile` **PASS**; dry-run de conversão/integridade de nove imagens **PASS**.
- Aplicação real **BLOQUEADA**: GitHub Actions não dispõe do secret protegido `SUPABASE_SERVICE_ROLE_KEY`; a etapa `Check protected credentials` falha intencionalmente e nada grava no Supabase.
- Testes de 18 URLs HTTP 200, integração visual do site e painel administrativo: **pendentes**, não foram declarados aprovados.
- Nenhum original removido ou logotipo modificado. Auditoria independente, aprovação humana e merge pendentes.

**Evidências:** [CI de build e conversão](https://github.com/LeonardoCamargoRossato/LCR-SolutionsArchitecture-IA-Quantum/actions/runs/44085462084); [PR #2](https://github.com/LeonardoCamargoRossato/LCR-SolutionsArchitecture-IA-Quantum/pull/2). O relatório completo de dimensões e hash do dry-run está disponível como artifact `portfolio-cover-dryrun-evidence` do workflow.

## Inventário canônico — nove capas

Todos os caminhos abaixo são relativos ao bucket `portfolio-media`. A coluna SHA-256 corresponde ao **PNG original lido do Storage em 17/11/2026**. É também o hash esperado da cópia PNG, mas **a verificação do hash da cópia ainda não ocorreu porque a cópia não existe**. Tamanho WebP corresponde ao arquivo convertido em memória no CI; não a um objeto publicado.

| Projeto | PNG legado preservado | PNG de destino | WebP de destino | Registro editorial | PNG (bytes) | WebP simulado (bytes) | Economia de tráfego | SHA-256 do original | Estado |
|---|---|---|---|---|---:|---:|---:|---|---|
| cities-comparing | `projects/cities-comparing/1789395964303-3c1f29cc-c8bd-42d7-8a7d-752b81756026-CitiesComparing_CapaCard.png` | `projects/cities-comparing/PNG/1789395964303-3c1f29cc-c8bd-42d7-8a7d-752b81756026-CitiesComparing_CapaCard.png` | `projects/cities-comparing/WebP/1789395964303-3c1f29cc-c8bd-42d7-8a7d-752b81756026-CitiesComparing_CapaCard.webp` | `public.projects.cover_url` (`city-comparing`) | 1510172 | 123206 | 91.84% | `afff17fd8c1f0738e382171a1c26e35877301b89d323afb3f7752abbd26940be` | Não publicado |
| embedded-control-platform | `projects/embedded-control-platform/1789580925841-e27a4260-39a0-4581-baf2-fd9c2470f97a-EmbeddedWebServer_CapaCard.png` | `projects/embedded-control-platform/PNG/1789580925841-e27a4260-39a0-4581-baf2-fd9c2470f97a-EmbeddedWebServer_CapaCard.png` | `projects/embedded-control-platform/WebP/1789580925841-e27a4260-39a0-4581-baf2-fd9c2470f97a-EmbeddedWebServer_CapaCard.webp` | `public.more_projects.image_url` (`embedded-control-platform`) | 1808444 | 152558 | 91.56% | `cca752dab6e39331ae2040edba6fa5084d421609f258154bc0b1129cebbb45e7` | Não publicado |
| foton-hub | `projects/foton-hub/1789395184532-2e274ccc-e2ad-4c41-b7b8-a795f181f84b-FotonHub_CapaCard.png` | `projects/foton-hub/PNG/1789395184532-2e274ccc-e2ad-4c41-b7b8-a795f181f84b-FotonHub_CapaCard.png` | `projects/foton-hub/WebP/1789395184532-2e274ccc-e2ad-4c41-b7b8-a795f181f84b-FotonHub_CapaCard.webp` | `public.projects.cover_url` (`foton-hub`) | 1461104 | 103166 | 92.94% | `03f5ccc2c6b8cf86df7fea39eee309b64946fd44f0bdc1681d81ecb78fc89ea2` | Não publicado |
| hamlet | `projects/hamlet/1789395980082-0ecbb7cb-509a-4f32-af8d-8223936c54b2-Hamlet_CapaCard.png` | `projects/hamlet/PNG/1789395980082-0ecbb7cb-509a-4f32-af8d-8223936c54b2-Hamlet_CapaCard.png` | `projects/hamlet/WebP/1789395980082-0ecbb7cb-509a-4f32-af8d-8223936c54b2-Hamlet_CapaCard.webp` | `public.projects.cover_url` (`hamlet`) | 1890644 | 103640 | 94.52% | `7010dea8448bda827328606d31ffe6bf05b109cb65c4809b92cb49ba43b7ba17` | Não publicado |
| pdf-frequency-analyzer | `projects/pdf-frequency-analyzer/1789577994613-5507d9da-b3c8-42c1-9f27-ecdb8989dbef-FrequencyAnalyser_CapaCard.png` | `projects/pdf-frequency-analyzer/PNG/1789577994613-5507d9da-b3c8-42c1-9f27-ecdb8989dbef-FrequencyAnalyser_CapaCard.png` | `projects/pdf-frequency-analyzer/WebP/1789577994613-5507d9da-b3c8-42c1-9f27-ecdb8989dbef-FrequencyAnalyser_CapaCard.webp` | `public.more_projects.image_url` (`pdf-frequency-analyzer`) | 1358618 | 94572 | 93.04% | `f4cd29471c5589fc2c5d8b6107ce7b50bb444dd929dd18e1b8497ef0b2783042` | Não publicado |
| quantum-education-apps | `projects/quantum-education-apps/1789577934619-2416ce1d-3b63-4edc-a7cd-c74989da990a-QuantumEduApps_CapaCard.png` | `projects/quantum-education-apps/PNG/1789577934619-2416ce1d-3b63-4edc-a7cd-c74989da990a-QuantumEduApps_CapaCard.png` | `projects/quantum-education-apps/WebP/1789577934619-2416ce1d-3b63-4edc-a7cd-c74989da990a-QuantumEduApps_CapaCard.webp` | `public.more_projects.image_url` (`quantum-education-apps`) | 1801316 | 118132 | 93.44% | `f95b93f4fa76b186edb781fa2f97bc7f1824aa970f29e0399e613fdc5e591b1c` | Não publicado |
| scientific-analysis-toolkit | `projects/scientific-analysis-toolkit/1789577893972-0ac3894c-5459-4df2-989a-029bf13891ec-ScientificAnalysisToolitCapaCard.png` | `projects/scientific-analysis-toolkit/PNG/1789577893972-0ac3894c-5459-4df2-989a-029bf13891ec-ScientificAnalysisToolitCapaCard.png` | `projects/scientific-analysis-toolkit/WebP/1789577893972-0ac3894c-5459-4df2-989a-029bf13891ec-ScientificAnalysisToolitCapaCard.webp` | `public.more_projects.image_url` (`scientific-analysis-toolkit`) | 1865442 | 169414 | 90.92% | `f787d2ed67323a2ccec850d733af8c6862ddd9afe1ad331c963004a2cecd6709` | Não publicado |
| speaker-portfolio | `projects/speaker-portfolio/1789612243746-56327e21-536e-489e-a1e7-767a6bd6dcfb-PortifolioPalestras_CapaCard.png` | `projects/speaker-portfolio/PNG/1789612243746-56327e21-536e-489e-a1e7-767a6bd6dcfb-PortifolioPalestras_CapaCard.png` | `projects/speaker-portfolio/WebP/1789612243746-56327e21-536e-489e-a1e7-767a6bd6dcfb-PortifolioPalestras_CapaCard.webp` | `public.projects.cover_url` (`speaker-portfolio`) | 1877910 | 119786 | 93.62% | `fc94346cd35fabad34ea6e16dec41e3421065b192e4651cf745eba2a9f505676` | Não publicado |
| webseer | `projects/webseer/1789400307805-02852533-1924-4936-990b-85f91c19e663-WebSeer_CapaCard.png` | `projects/webseer/PNG/1789400307805-02852533-1924-4936-990b-85f91c19e663-WebSeer_CapaCard.png` | `projects/webseer/WebP/1789400307805-02852533-1924-4936-990b-85f91c19e663-WebSeer_CapaCard.webp` | `public.more_projects.image_url` (`webseer`) | 1074515 | 64302 | 94.02% | `c2bb5a46ede21c5e917ee904f67ba4fa27367a981b46cac3cc6a165dbcb647f3` | Não publicado |

**Totais dry-run:** PNG 14.648.165 bytes → WebP 1.048.776 bytes; economia de entrega em relação aos originais: **92,84%** (13.599.389 bytes). Como os PNGs legados e suas cópias devem coexistir na migração, isso **não representa economia imediata de armazenamento**; a duplicação temporária aumenta o uso do Storage.

## Implementação na branch existente

- `scripts/migrate_portfolio_covers.py`: leitura dos nove PNGs, validação integral e SHA-256, WebP com mesma resolução, preflight completo, upload sem sobrescrever destinos divergentes, conferência independente de 18 arquivos e atualização condicional das nove URLs **somente depois** da verificação integral. `--apply` e `--verify` exigem autenticação protegida. Dry-run não exige segredo.
- `src/infrastructure/supabase/helpers.ts`: mantém PNG como URL editorial canônica e resolve URL WebP dos cards.
- `SupabaseMediaRepository.ts`, `MediaService.ts`, `IMediaRepository.ts` e painel `Admin.tsx`: novos uploads de capas exigem PNG original e geram par WebP via Canvas; validam PNG por SHA-256 e WebP por assinatura e dimensões. O repositório não remove mais automaticamente a mídia anterior em `replace()`; capas legadas e novas possuem guarda contra exclusão via método `delete()`. A exclusão de capa no editor desvincula o registro, sem apagar o objeto.
- `ImageUploader.tsx`: restringe **somente o campo de capa** a PNG, preservando JPG/PNG/WebP para foto de perfil e outros usos.
- `ProjectCard.tsx`, `MoreProjectCard.tsx` e `CaseHero.tsx`: cards usam URL WebP resolvida; o lightbox usa URL PNG e oferece download do original.
- `.github/workflows/portfolio-cover-migration.yml`: executa build, validação dry-run e evidências; migração só é acionada quando o GitHub secret está configurado, com backup e verificação após cópia.

### Dependência para efetivar a migração

O responsável deve disponibilizar uma credencial administrativa protegida **exclusivamente no GitHub Actions**, em `Settings → Secrets and variables → Actions → New repository secret`, nome `SUPABASE_SERVICE_ROLE_KEY`, preferindo acesso de menor duração possível e rotação posterior. **Não divulgar o valor no chat, no frontend ou em commits.** A conexão Supabase de leitura/SQL disponível no chat não oferece a operação de upload de objetos do Storage. Ao rerodar o workflow da branch, este deverá comprovar 18 objetos e nove registros antes que o PR possa passar por revisão.

### Procedimento de execução e validação

1. Confirmar que o workflow valida `npm ci`, `npm run build` e Python antes do upload. Manter o banco inalterado se o build falhar.
2. Com segredo protegido, executar `python scripts/migrate_portfolio_covers.py --apply`; conferir artefato `portfolio-cover-editorial-backup.json`, relatório por projeto e hashes.
3. Executar `python scripts/migrate_portfolio_covers.py --verify`; checar no banco/Storage 9 novos PNGs, 9 WebPs, 18 downloads públicos íntegros e 9 registros editorialmente apontando para `PNG/`.
4. Testar Home, cards, carrosséis, lightbox, download PNG, edição e substituição de capas, dispositivos desktop/mobile, além de inexistência de erros 404.
5. Confirmar CI e revisão independente de segurança/qualidade, solicitar aprovação humana quando exigida, só então tirar a PR de draft, fazer merge sem força e validar deploy do site.

## Recuperação / rollback

- Manter **todos os nove objetos legados**. O relatório e `portfolio-cover-editorial-backup.json` armazenam URLs anteriores e esperadas para recuperação.
- Se alguma gravação falhar, **não fazer merge**. O script é idempotente: repetições verificam os objetos existentes por SHA-256 e não sobrescrevem conteúdo divergente.
- Se URLs forem alteradas e a validação posterior falhar, reverter **somente os nove campos editoriais** às URLs legadas do backup, verificando cada linha. Não remover novos assets ou originais automaticamente.
- Se código em main tiver sido implantado apenas após aceitação e apresentar regressão, usar reversão de commit/PR com PR de correção, mantendo o Storage intacto e dados canônicos apontando para imagens existentes.

## Fonte normativa

[LCR_ASSET_ORGANIZATION_STANDARD — Organização Humanizada e Migração de Assets](https://docs.google.com/document/d/1mnoxV1gak5x_kX6KclcEH7PEN8QzYU3dX4JNzHUYHwI/edit), v1.0, 16/11/2026, consultado e aplicado. Migração gradual, preservação, inventário por projeto, integridade, documentação e auditoria independente. **Preparado ≠ executado ≠ testado ≠ aprovado.**
