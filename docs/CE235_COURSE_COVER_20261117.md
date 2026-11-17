# CE-235 — capa com captura real do portal

**Projeto:** `ce235-real-time-systems` · **Data:** 17/11/2026 · **Origem:** screenshot fornecida pelo responsável.

## O que mudou
A captura da página inicial do portal CE-235 substitui a ilustração de satélite como capa do projeto em **Projetos Adicionais** e na **primeira posição** do carrossel do estudo de caso.

O slide antigo do satélite foi preservado como **segundo slide**, seguido das seis capturas técnicas existentes (8 slides no total). O arquivo anterior `public/projects/ce235-telemetry.webp` não foi alterado nem removido.

## Assets e qualidade
Organização funcional estável:

```
public/projects/ce235/cover/
  PNG/
    ce235-course-site-original.png   # screenshot idêntica, zoom/download
    ce235-course-site-cover.png      # recorte convencional (1920 × 810)
  WebP/
    ce235-course-site-cover.webp     # 1920 × 810
    ce235-course-site-preview.webp   # 1440 × 608
    ce235-course-site-card.webp      # 960 × 405
    ce235-course-site-thumb.webp     # 480 × 202
```

**Nenhuma geração por IA:** o recorte remove somente a parte branca inferior da página, sem alterar o conteúdo da captura. O PNG original de 1920 × 1080 mantém o mesmo SHA-256 do arquivo anexado. Os WebPs são versões otimizadas do recorte; os originais permanecem recuperáveis.

Inventário e hashes: `docs/assets/ce235-course-cover.json`. Acervo Drive: `LCR Apps/LCR-SolutionsArchitecture-IA-Quantum/ce235-course-cover` (PNG, WebP, inventário).

O card da Home e o carrossel inicial usam `ce235-course-site-card.webp`; a prévia progressiva utiliza `ce235-course-site-preview.webp`; o lightbox e o download utilizam `ce235-course-site-original.png`. O slide 2 usa `ce235-telemetry.webp`.

## Fonte editorial e dependências
A CE-235 usa `src/data/ce235Project.ts` como definição de fallback; a consulta ao Supabase comprovou que não existe registro do projeto em `public.more_projects`. Os componentes compartilhados `ProjectCard` e `CaseHero` reutilizam o mesmo `coverImage`, evitando hardcode duplicado. Nenhum registro do Supabase foi modificado. Nenhuma imagem ou dado de outros projetos foi alterado.

## Evidência
- CI branch: `npm ci`, `npm run build`, `tests/ce235-cover-assets.test.mjs`, `tests/ce235-cover-browser-smoke.mjs` — 6 arquivos validados; card Home, oito slides, PNG zoom/download e ilustração antiga em desktop/mobile.
- Após merge, `ce235-cover-published.yml` executa teste de navegação no GitHub Pages.
- Caso apareçam falhas 404 ou regressões, interromper publicação e corrigir antes de encerrar.

## Reversão
Reverter a PR no GitHub para restabelecer `ce235-telemetry.webp` como capa. Todos os assets originais e variantes continuam disponíveis no histórico do Git e no acervo do Drive. Não realizar exclusões nesta etapa.

**Conformidade LCR Workflow:** organização por funcionalidade, preservação, inventário de origem e transformação, migração gradual e testes em desktop/mobile.
