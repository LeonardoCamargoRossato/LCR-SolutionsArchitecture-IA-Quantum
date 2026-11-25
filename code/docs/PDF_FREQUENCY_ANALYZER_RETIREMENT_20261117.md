# LCR Portfólio — Retirada do Analisador de Frequência em PDFs

**Operação:** 17/11/2026  
**Repositório:** `LeonardoCamargoRossato/LCR-SolutionsArchitecture-IA-Quantum`  
**Branch:** `fix/remove-pdf-frequency-analyzer-20261117`  
**Supabase:** `wdjffhfnzydudmhhekmk` · bucket `portfolio-media`

## Decisão editorial

Retirar do site a apresentação do projeto **Analisador de Frequência em PDFs** (*PDF Frequency Analyzer*), incluindo o card em **Projetos Adicionais**, a rota de estudo de caso e as referências ativas ao projeto.

### Inventário do estado anterior

- Registro editorial: `public.more_projects.id = 'pdf-frequency-analyzer'`; `slug = 'pdf-frequency-analyzer'`.
- Antes: `visible=true`, `case_enabled=true`, `placement='more'` e `sort_order=6`.
- Não havia um componente React exclusivo nem arquivos `src/data/` dedicados a esse projeto. O conteúdo era carregado dinamicamente pelo serviço genérico de projetos a partir do Supabase.
- Não havia dependência registrada em `public.project_institutions` nem menções diretas em outros projetos no Supabase.
- O teste legado `tests/portfolio-covers-smoke.mjs` e o migrador `scripts/migrate_portfolio_covers.py` ainda faziam referência explícita ao slug.

### Arquivos históricos preservados no Storage

| Uso | Caminho relativo ao bucket `portfolio-media` |
|---|---|
| PNG original legado | `projects/pdf-frequency-analyzer/1789577994613-5507d9da-b3c8-42c1-9f27-ecdb8989dbef-FrequencyAnalyser_CapaCard.png` |
| PNG da migração | `projects/pdf-frequency-analyzer/PNG/1789577994613-5507d9da-b3c8-42c1-9f27-ecdb8989dbef-FrequencyAnalyser_CapaCard.png` |
| WebP da migração | `projects/pdf-frequency-analyzer/WebP/1789577994613-5507d9da-b3c8-42c1-9f27-ecdb8989dbef-FrequencyAnalyser_CapaCard.webp` |

Esses arquivos são **históricos e não são mais usados pela interface**. Sua exclusão física não faz parte desta alteração, em conformidade com a política de preservação e recuperação gradual do LCR Workflow.

## Implementação

1. Supabase: desativar `visible` e `case_enabled` no registro do projeto, preservando os dados para rollback.
2. Serviço de projetos: registrar o slug como retirado e não devolvê-lo em listas públicas, administração ou consultas de estudo de caso.
3. Script de migração de capas: retirar o item desse projeto do inventário de conversões ativas; usar cardinalidade dinâmica baseada em `COVERS` para evitar falhas em futuras verificações.
4. Regressão: remover o slug do conjunto de oito estudos de caso atuais; confirmar que o card não existe na Home e que o URL `#/projects/pdf-frequency-analyzer` exibe **404 — Case study not found**.
5. Documentação: manter o inventário histórico original sem falsificar a auditoria da migração anterior, anotando esta decisão editorial.

### Escopo intencionalmente preservado

Componentes genéricos `ProjectCard`, `ProjectCaseV1`, `ProjectPdfViewer`, `SupabaseProjectRepository` e outros serviços de mídia não são exclusivos desse projeto e permanecem necessários para o portfólio. O conteúdo **WebSeer** também não deve ser alterado: análises de textos pertencem a esse outro projeto, independentemente da retirada deste protótipo.

## Critérios e verificação

- `npm ci` + `npm run build`: verificar CI.
- Playwright: oito projetos restantes renderizados com WebP/PNG no desktop e no mobile.
- Card ausente da Home em desktop/mobile; rota antiga retorna a tela de estudo de caso não encontrado.
- Contagem editorial: exatamente uma linha do projeto arquivada com `visible=false`, `case_enabled=false`.
- Nenhuma referência ativa no migrador e no conjunto de projetos de teste; nenhum outro registro do Supabase modificado.
- Merge normal na `main` somente com CI aprovado e conforme as proteções. Verificar o deploy e o site publicado.

## Recuperação

Em caso de decisão posterior de republicar o projeto:

1. Reverter a alteração de código e remover o slug de `retiredSlugs`.
2. Restabelecer `visible=true` e `case_enabled=true` no registro `public.more_projects`, após validação editorial.
3. Conferir as três variantes preservadas no Storage, verificar o card e a rota, e aprovar os testes.

**Sem exclusão permanente dos arquivos, sem exposição de chaves, sem modificação de componentes compartilhados.**
